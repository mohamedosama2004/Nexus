/**
 * Magic-byte (content signature) validation for uploaded files.
 *
 * The browser-provided MIME type is attacker-controlled, so it is used only as
 * a hint. This module reads the actual leading bytes of the uploaded data and
 * verifies they match the declared type. It runs after `validateFile` (size +
 * type policy) and before bytes are written to storage.
 *
 * Text types (`text/plain`, `application/json`, `text/csv`) deliberately have
 * no byte signature: a text file can legitimately begin with anything, so we
 * only reject them when a KNOWN binary signature is detected (i.e. the file is
 * almost certainly not the text it claims to be).
 */

export type ContentValidationResult =
  | { ok: true; detectedType: string }
  | { ok: false; error: "INVALID_CONTENT" | "TYPE_MISMATCH" };

export const contentValidationErrors: Record<
  "INVALID_CONTENT" | "TYPE_MISMATCH",
  string
> = {
  INVALID_CONTENT:
    "The file could not be recognized as an allowed file type.",
  TYPE_MISMATCH:
    "The file's content does not match its declared file type.",
};

export const TEXT_MIME_TYPES: ReadonlySet<string> = new Set([
  "text/plain",
  "application/json",
  "text/csv",
]);

function hasSignature(data: Buffer, signature: readonly number[]): boolean {
  if (data.length < signature.length) {
    return false;
  }
  return signature.every((byte, index) => data[index] === byte);
}

function matchesAscii(data: Buffer, offset: number, expected: string): boolean {
  if (data.length < offset + expected.length) {
    return false;
  }
  for (let i = 0; i < expected.length; i++) {
    if (data[offset + i] !== expected.charCodeAt(i)) {
      return false;
    }
  }
  return true;
}

/**
 * Detects the content type from the leading bytes, or returns null when no
 * known signature is present.
 */
export function detectSignature(data: Buffer): string | null {
  if (
    hasSignature(data, [0xff, 0xd8, 0xff])
  ) {
    return "image/jpeg";
  }

  if (
    hasSignature(data, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  ) {
    return "image/png";
  }

  // RIFF....WEBP
  if (
    data.length >= 12 &&
    matchesAscii(data, 0, "RIFF") &&
    matchesAscii(data, 8, "WEBP")
  ) {
    return "image/webp";
  }

  // GIF87a / GIF89a
  if (
    data.length >= 4 &&
    (matchesAscii(data, 0, "GIF87a") || matchesAscii(data, 0, "GIF89a"))
  ) {
    return "image/gif";
  }

  if (data.length >= 4 && matchesAscii(data, 0, "%PDF")) {
    return "application/pdf";
  }

  // PK\x03\x04 (empty/normal ZIP), PK\x05\x06 (empty archive), PK\x07\x08 (spanned)
  if (
    data.length >= 4 &&
    data[0] === 0x50 &&
    data[1] === 0x4b &&
    (data[2] === 0x03 || data[2] === 0x05 || data[2] === 0x07) &&
    data[3] === 0x04
  ) {
    return "application/zip";
  }

  return null;
}

/**
 * Validates that the raw bytes match the declared MIME type.
 *
 * Binary declared types must carry their own signature. Text declared types
 * are accepted unless they contain a known binary signature.
 */
export function validateFileContent(
  data: Buffer,
  declaredMimeType: string,
): ContentValidationResult {
  const detectedType = detectSignature(data);

  if (detectedType !== null && detectedType !== declaredMimeType) {
    return { ok: false, error: "TYPE_MISMATCH" };
  }

  if (!TEXT_MIME_TYPES.has(declaredMimeType)) {
    if (detectedType === null) {
      return { ok: false, error: "INVALID_CONTENT" };
    }
  }

  return { ok: true, detectedType: declaredMimeType };
}