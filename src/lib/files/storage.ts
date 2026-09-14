import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";

/**
 * Storage abstraction for uploaded files.
 *
 * Nexus never writes file bytes into PostgreSQL. Instead it persists a metadata
 * row (`FileRecord`) that points at a storage key, and the bytes themselves are
 * handled by a `FileStorage` implementation.
 *
 * Today a local filesystem driver (`local`) and a Vercel Blob driver
 * (`vercel-blob`) ship. Replacing them with other object storage (S3, R2,
 * GCS, ...) only requires a new implementation of this interface and a small
 * lookup in `getStorage`.
 */

export interface FileStorage {
  /** Persists `data` under the given storage key. */
  save(storageKey: string, data: Buffer): Promise<void>;
  /** Returns the stored bytes, or `null` when nothing exists for the key. */
  read(storageKey: string): Promise<Buffer | null>;
  /** Removes the stored bytes. Missing files are ignored. */
  delete(storageKey: string): Promise<void>;
}

const DEFAULT_STORAGE_DIR = path.join(process.cwd(), "uploads");

class LocalFileStorage implements FileStorage {
  constructor(private readonly rootDir: string) {}

  /**
   * Resolves a storage key to an absolute path inside the uploads root.
   *
   * Every key that reaches this method must already be server-generated, but
   * the `read`/`delete` callers also accept keys coming from the URL, so the
   * resolved path is checked to stay inside the root. This is the last line of
   * defense against path traversal — it never depends on trusting the caller.
   */
  private resolvePath(storageKey: string): string {
    const root = path.resolve(this.rootDir);
    const resolved = path.resolve(root, path.normalize(storageKey));
    const insideRoot = resolved === root || resolved.startsWith(root + path.sep);

    if (!insideRoot) {
      throw new Error("Storage key escapes the uploads directory.");
    }

    return resolved;
  }

  async save(storageKey: string, data: Buffer): Promise<void> {
    const target = this.resolvePath(storageKey);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, data);
  }

  async read(storageKey: string): Promise<Buffer | null> {
    const target = this.resolvePath(storageKey);

    try {
      return await fs.readFile(target);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return null;
      }
      throw error;
    }
  }

  async delete(storageKey: string): Promise<void> {
    const target = this.resolvePath(storageKey);

    try {
      await fs.unlink(target);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return;
      }
      throw error;
    }
  }
}

let storageInstance: FileStorage | null = null;

export type StorageDriver = "local" | "vercel-blob";

const STORAGE_DRIVERS: readonly StorageDriver[] = ["local", "vercel-blob"];

function getStorageDriverName(): StorageDriver {
  const driver = process.env.STORAGE_DRIVER || "local";

  if ((STORAGE_DRIVERS as readonly string[]).includes(driver)) {
    return driver as StorageDriver;
  }

  throw new Error(
    `Unsupported STORAGE_DRIVER "${driver}". Supported values: "${STORAGE_DRIVERS.join(
      '", "',
    )}".`,
  );
}

/**
 * Vercel Blob backend for production uploads.
 *
 * Bytes live in a Vercel Blob store (durable object storage) instead of a
 * serverless filesystem (`/var/task/uploads`), which is ephemeral and
 * read-only. All blobs are created with `access: "private"` — Nexus serves
 * them exclusively through the authorized `/api/files/[...key]` route, never
 * by exposing a public blob URL.
 *
 * Storage keys are the object pathnames. `addRandomSuffix` is forced off so
 * the server-generated key (`avatar/<uuid>.jpg`) is the object path, and
 * overwriting is rejected to mirror the local driver's safety guarantee.
 */
class VercelBlobStorage implements FileStorage {
  async save(storageKey: string, data: Buffer): Promise<void> {
    const { put } = await import("@vercel/blob");

    await put(storageKey, data, {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: false,
    });
  }

  async read(storageKey: string): Promise<Buffer | null> {
    const { get } = await import("@vercel/blob");

    // `useCache: false` bypasses the CDN cache on private reads. This matters
    // right after a direct client upload, where the cached entry for a brand
    // new key can lag behind the store (the SDK's documented escape hatch).
    const result = await get(storageKey, {
      access: "private",
      useCache: false,
    });

    if (!result || result.statusCode !== 200) {
      return null;
    }

    const bytes = await new Response(result.stream).arrayBuffer();
    return Buffer.from(bytes);
  }

  async delete(storageKey: string): Promise<void> {
    const { del } = await import("@vercel/blob");

    await del(storageKey);
  }
}

/**
 * Returns the configured storage driver.
 *
 * - `STORAGE_DRIVER="local"` (default): filesystem under `STORAGE_DIR`
 *   (defaults to `<project>/uploads`) — for development.
 * - `STORAGE_DRIVER="vercel-blob"`: Vercel Blob object storage — for
 *   production. Authentication is resolved by the SDK from the environment
 *   (a `BLOB_READ_WRITE_TOKEN`, or Vercel Blob OIDC via `BLOB_STORE_ID` +
 *   `VERCEL_OIDC_TOKEN` when the store is plugged into the Vercel project).
 *
 * Production never silently falls back to the local filesystem: when a Blob
 * driver is requested but no credentials are present, `getStorage` fails
 * loudly with a configuration error instead of writing to `/var/task/uploads`.
 */
export function getStorage(): FileStorage {
  if (storageInstance) {
    return storageInstance;
  }

  const driver = getStorageDriverName();

  if (driver === "local") {
    storageInstance = new LocalFileStorage(
      process.env.STORAGE_DIR || DEFAULT_STORAGE_DIR,
    );
    return storageInstance;
  }

  if (driver === "vercel-blob") {
    const hasCredentials = Boolean(
      process.env.BLOB_READ_WRITE_TOKEN ||
        process.env.BLOB_STORE_ID ||
        process.env.VERCEL_OIDC_TOKEN,
    );

    if (!hasCredentials) {
      throw new Error(
        'STORAGE_DRIVER is "vercel-blob" but no Vercel Blob credentials were found in the environment. ' +
          "Connect a Blob store to the Vercel project (or set BLOB_READ_WRITE_TOKEN) and run `vercel env pull`, " +
          "then retry the upload.",
      );
    }

    storageInstance = new VercelBlobStorage();
    return storageInstance;
  }

  // Unreachable: getStorageDriverName already rejected unknown drivers.
  throw new Error(`Unsupported STORAGE_DRIVER "${driver}".`);
}

export type StorageUploadPath =
  | { mode: "direct"; presignedUrl: string }
  | { mode: "server" };

/**
 * Prepares the client-side upload step for a server-generated storage key.
 *
 * - Vercel Blob driver: a short-lived signed upload URL (scoped to the exact
 *   pathname + MIME type, capped at `maximumSizeInBytes`) so the browser can
 *   PUT the file straight to the store. This keeps attachments — which can be
 *   up to 10 MB — inside Vercel's serverless request-body limit instead of
 *   buffering them through a Server Action.
 * - Local driver: the file still travels server-side through the existing
 *   Server Action, so `mode` is `"server"` and no URL is issued.
 */
export async function getStorageUploadPath(
  storageKey: string,
  options: { mimeType: string; maximumSizeInBytes: number },
): Promise<StorageUploadPath> {
  if (getStorageDriverName() !== "vercel-blob") {
    return { mode: "server" };
  }

  const { issueSignedToken, presignUrl } = await import("@vercel/blob");

  const validUntil = Date.now() + 60 * 60 * 1000;

  const signed = await issueSignedToken({
    operations: ["put"],
    pathname: storageKey,
    allowedContentTypes: [options.mimeType],
    maximumSizeInBytes: options.maximumSizeInBytes,
    validUntil,
  });

  const { presignedUrl } = await presignUrl(
    {
      clientSigningToken: signed.clientSigningToken,
      delegationToken: signed.delegationToken,
    },
    {
      operation: "put",
      pathname: storageKey,
      access: "private",
      // Mirror the contract of the server-side builder: no random suffix and
      // no overwrite, so the object lands on the exact storageKey we read back
      // in Flight — otherwise the delegated upload may store it under a
      // suffixed key and the finalize step would 404.
      addRandomSuffix: false,
      allowOverwrite: false,
      allowedContentTypes: [options.mimeType],
      maximumSizeInBytes: options.maximumSizeInBytes,
      validUntil,
    },
  );

  return { mode: "direct", presignedUrl };
}

const MIME_TYPE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "application/pdf": "pdf",
  "text/plain": "txt",
  "application/json": "json",
  "text/csv": "csv",
  "application/zip": "zip",
};

/**
 * Returns the canonical file extension for a MIME type. Unknown types fall
 * back to `bin`; the extension is never taken from the client-provided
 * filename, so a name like `photo.exe` can never influence the stored key.
 */
export function extensionForMimeType(mimeType: string): string {
  return MIME_TYPE_EXTENSIONS[mimeType] ?? "bin";
}

export type StorageCategory = "avatar" | "attachment";

/**
 * Builds a safe, unique storage key.
 *
 * The key is `category/<random uuid>.<extension>`: it is fully server-side,
 * contains no user-controlled characters, and can never collide with an
 * existing file (so unrelated files are never overwritten).
 */
export function buildStorageKey(
  category: StorageCategory,
  mimeType: string,
): string {
  return `${category}/${randomUUID()}.${extensionForMimeType(mimeType)}`;
}

/**
 * Produces a display-safe version of the original filename.
 *
 * When a key is derived from the client filename it becomes an easy path
 * traversal or overwrite vector, so the original name is only ever used for
 * display (stored in the database and used in `Content-Disposition`). It is
 * stripped of path components and control characters.
 */
export function sanitizeFilename(originalName: string): string {
  const basename = originalName.split(/[\\/]/).pop() ?? "";
  const cleaned = basename
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/^\.+/, "")
    .trim();

  return (cleaned || "file").slice(0, 255);
}