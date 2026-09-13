import { describe, expect, it } from "vitest";

import {
  detectSignature,
  validateFileContent,
} from "./content-validation";

const JPEG = () => Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
const PNG = () =>
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x01]);
const WEBP = () =>
  Buffer.concat([
    Buffer.from("RIFF"),
    Buffer.from([0x00, 0x00, 0x00, 0x00]),
    Buffer.from("WEBP"),
  ]);
const GIF = () => Buffer.from("GIF89a...");
const PDF = () => Buffer.from("%PDF-1.4\n% test");
const ZIP = () => Buffer.from("PK\x03\x04notreallyzip");
const TEXT = () => Buffer.from("hello, world\nplain text");

describe("detectSignature", () => {
  it("detects jpeg/png/webp/gif signatures", () => {
    expect(detectSignature(JPEG())).toBe("image/jpeg");
    expect(detectSignature(PNG())).toBe("image/png");
    expect(detectSignature(WEBP())).toBe("image/webp");
    expect(detectSignature(GIF())).toBe("image/gif");
    expect(detectSignature(PDF())).toBe("application/pdf");
    expect(detectSignature(ZIP())).toBe("application/zip");
  });

  it("does not mistake short or arbitrary data for a signature", () => {
    expect(detectSignature(Buffer.from([0xff, 0xd8]))).toBeNull();
    expect(detectSignature(Buffer.from("ff d8 ff e0".replace(/ /g, "")))).toBeNull();
    expect(detectSignature(Buffer.alloc(32, 0x00))).toBeNull();
  });
});

describe("validateFileContent", () => {
  it("accepts a binary file whose bytes match its declared type", () => {
    expect(validateFileContent(JPEG(), "image/jpeg")).toEqual({
      ok: true,
      detectedType: "image/jpeg",
    });
    expect(validateFileContent(PDF(), "application/pdf")).toEqual({
      ok: true,
      detectedType: "application/pdf",
    });
  });

  it("rejects content that does not match the declared type", () => {
    const result = validateFileContent(PNG(), "image/jpeg");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("TYPE_MISMATCH");
    }
  });

  it("rejects binary declared types with unrecognized content", () => {
    const result = validateFileContent(TEXT(), "image/jpeg");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("INVALID_CONTENT");
    }
  });

  it("accepts plain text declared types", () => {
    expect(validateFileContent(TEXT(), "text/plain")).toEqual({
      ok: true,
      detectedType: "text/plain",
    });
  });

  it("rejects text that is actually a known binary file", () => {
    const result = validateFileContent(ZIP(), "text/plain");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("TYPE_MISMATCH");
    }
  });
});