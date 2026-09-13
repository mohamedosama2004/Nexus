import { describe, expect, it } from "vitest";

import { fileValidationErrors, validateFile } from "./validate-file";
import { uploadPolicies } from "./upload-policies";

const policy = { maxSize: 100, allowedTypes: ["image/jpeg"] as string[] };

function makeFile(
  bytes: number[] | string,
  name = "file",
  type = "image/jpeg",
): File {
  const data =
    typeof bytes === "string"
      ? new TextEncoder().encode(bytes)
      : new Uint8Array(bytes);
  return new File([data], name, { type });
}

describe("validateFile", () => {
  it("rejects anything that is not a File", () => {
    expect(validateFile(null, policy).ok).toBe(false);
    expect(validateFile(undefined, policy).ok).toBe(false);
    expect(validateFile("readme.txt", policy).ok).toBe(false);
    expect(validateFile(42, policy).ok).toBe(false);
  });

  it("rejects empty files", () => {
    const result = validateFile(makeFile([]), policy);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("EMPTY_FILE");
    }
  });

  it("rejects files larger than the policy allows", () => {
    const result = validateFile(makeFile(new Array(101).fill(1)), policy);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("FILE_TOO_LARGE");
    }
  });

  it("rejects disallowed MIME types", () => {
    const result = validateFile(makeFile([1], "x.exe", "application/x-msdownload"), policy);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("INVALID_TYPE");
    }
  });

  it("accepts a file that fits the policy", () => {
    const file = makeFile([1, 2, 3]);
    const result = validateFile(file, policy);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.file).toBe(file);
    }
  });

  it("maps every error kind to a user-facing message", () => {
    expect(fileValidationErrors.NO_FILE).toBeTruthy();
    expect(fileValidationErrors.EMPTY_FILE).toBeTruthy();
    expect(fileValidationErrors.FILE_TOO_LARGE).toBeTruthy();
    expect(fileValidationErrors.INVALID_TYPE).toBeTruthy();
  });

  it("enforces the real upload policies (avatar excludes SVG)", () => {
    expect(uploadPolicies.avatar.allowedTypes).not.toContain("image/svg+xml");
    expect(uploadPolicies.attachment.allowedTypes).toContain(
      "application/zip",
    );
  });
});