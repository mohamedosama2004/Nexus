import { describe, expect, it } from "vitest";

import {
  buildStorageKey,
  extensionForMimeType,
  sanitizeFilename,
} from "./storage";

const KEY_RE =
  /^avatar\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.png$/i;

describe("extensionForMimeType", () => {
  it("maps known MIME types to canonical extensions", () => {
    expect(extensionForMimeType("image/jpeg")).toBe("jpg");
    expect(extensionForMimeType("image/png")).toBe("png");
    expect(extensionForMimeType("image/webp")).toBe("webp");
    expect(extensionForMimeType("image/gif")).toBe("gif");
    expect(extensionForMimeType("application/pdf")).toBe("pdf");
    expect(extensionForMimeType("application/zip")).toBe("zip");
  });

  it("falls back to bin for unknown types", () => {
    expect(extensionForMimeType("image/svg+xml")).toBe("bin");
    expect(extensionForMimeType("")).toBe("bin");
  });
});

describe("buildStorageKey", () => {
  it("produces server-controlled keys that can never collide", () => {
    const a = buildStorageKey("avatar", "image/png");
    const b = buildStorageKey("avatar", "image/png");

    expect(a).toMatch(KEY_RE);
    expect(a).not.toBe(b);
  });

  it("derives the extension from the MIME type, never the filename", () => {
    // A malicious filename can never influence the stored key.
    const key = buildStorageKey("attachment", "text/plain");
    expect(key.endsWith(".txt")).toBe(true);
  });
});

describe("sanitizeFilename", () => {
  it("strips path components", () => {
    expect(sanitizeFilename("../../etc/passwd")).toBe("passwd");
    expect(sanitizeFilename("C:\\Windows\\system32\\drivers.exe")).toBe(
      "drivers.exe",
    );
    expect(sanitizeFilename("a/b/c.txt")).toBe("c.txt");
  });

  it("strips control characters", () => {
    expect(sanitizeFilename("report\u0000.txt")).toBe("report.txt");
    expect(sanitizeFilename("name\u0001\u001f.txt")).toBe("name.txt");
  });

  it("removes leading dots and trims", () => {
    expect(sanitizeFilename("...hidden.txt")).toBe("hidden.txt");
    expect(sanitizeFilename("  spaced  ")).toBe("spaced");
  });

  it("falls back to a safe default and caps length", () => {
    expect(sanitizeFilename("")).toBe("file");
    expect(sanitizeFilename("/\\")).toBe("file");
    const long = "a".repeat(400) + ".txt";
    expect(sanitizeFilename(long).length).toBeLessThanOrEqual(255);
  });
});