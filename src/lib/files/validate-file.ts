/**
 * Server-side file validation.
 *
 * This module is the single validation gate for every filesystem write in
 * Nexus. It runs only on the server (inside server actions) because the
 * browser can always be bypassed, so the server must never trust values that
 * were only checked on the client.
 *
 * Validation results are returned as a discriminated union instead of throwing,
 * which matches the existing Nexus action-result convention
 * (`{ success, error }`-style objects) and makes the outcome easy to surface
 * in the UI.
 */

export type FileValidationOptions = {
  /** Maximum accepted size in bytes. */
  maxSize: number;
  /** MIME types that are allowed. */
  allowedTypes: readonly string[];
};

export type FileValidationErrorKind =
  | "NO_FILE"
  | "EMPTY_FILE"
  | "FILE_TOO_LARGE"
  | "INVALID_TYPE";

export type FileValidationSuccess = {
  ok: true;
  file: File;
};

export type FileValidationFailure = {
  ok: false;
  error: FileValidationErrorKind;
};

export type FileValidationResult = FileValidationSuccess | FileValidationFailure;

export const fileValidationErrors: Record<FileValidationErrorKind, string> = {
  NO_FILE: "Please choose a file to upload.",
  EMPTY_FILE: "The chosen file is empty.",
  FILE_TOO_LARGE: "The file is larger than the allowed size.",
  INVALID_TYPE: "This file type is not allowed.",
};

/**
 * Validates that `value` is a real uploaded file and that it satisfies the
 * given policy (size + MIME type).
 *
 * Anything that is not a `File` object (for example `null`, a plain string, or
 * a body that was never parsed from multipart `FormData`) is rejected as
 * "no file".
 */
export function validateFile(
  value: unknown,
  options: FileValidationOptions,
): FileValidationResult {
  if (!(value instanceof File)) {
    return { ok: false, error: "NO_FILE" };
  }

  if (value.size === 0) {
    return { ok: false, error: "EMPTY_FILE" };
  }

  if (value.size > options.maxSize) {
    return { ok: false, error: "FILE_TOO_LARGE" };
  }

  if (!options.allowedTypes.includes(value.type)) {
    return { ok: false, error: "INVALID_TYPE" };
  }

  return { ok: true, file: value };
}