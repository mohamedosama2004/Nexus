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
 * Today only a local filesystem driver ships, which is safe for development.
 * Replacing it with object storage (S3, R2, GCS, ...) only requires a new
 * implementation of this interface and a small lookup in `getStorage`.
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

/**
 * Returns the configured storage driver.
 *
 * - `STORAGE_DRIVER="local"` (default): filesystem under `STORAGE_DIR`
 *   (defaults to `<project>/uploads`).
 */
export function getStorage(): FileStorage {
  if (storageInstance) {
    return storageInstance;
  }

  const driver = process.env.STORAGE_DRIVER || "local";

  if (driver === "local") {
    storageInstance = new LocalFileStorage(
      process.env.STORAGE_DIR || DEFAULT_STORAGE_DIR,
    );
    return storageInstance;
  }

  throw new Error(
    `Unsupported STORAGE_DRIVER "${driver}". Supported values: "local".`,
  );
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