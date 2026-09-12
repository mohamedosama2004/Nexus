import type { FileValidationOptions } from "./validate-file";

/**
 * Centralized upload policies.
 *
 * Every upload in Nexus is validated against one of these named policies so
 * that size/type limits live in a single place instead of being scattered
 * across components and actions.
 *
 * `image/svg+xml` is deliberately excluded everywhere: SVG can contain
 * executable scripts and would be unsafe to serve inline.
 */
export type UploadPolicyName = "avatar" | "attachment";

export const uploadPolicies: Record<UploadPolicyName, FileValidationOptions> = {
  avatar: {
    maxSize: 2 * 1024 * 1024, // 2 MB
    allowedTypes: ["image/jpeg", "image/png", "image/webp"],
  },

  attachment: {
    maxSize: 10 * 1024 * 1024, // 10 MB
    allowedTypes: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "application/pdf",
      "text/plain",
      "application/json",
      "text/csv",
      "application/zip",
    ],
  },
};