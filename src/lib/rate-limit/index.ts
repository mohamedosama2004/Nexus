import { headers } from "next/headers";

import { MemoryRateLimitStore } from "./memory-store";
import type { RateLimitDecision, RateLimitStore } from "./types";

export const RATE_LIMIT_POLICIES = {
  login: { limit: 10, windowMs: 15 * 60 * 1000 },
  register: { limit: 5, windowMs: 60 * 60 * 1000 },
  verificationResend: { limit: 3, windowMs: 60 * 60 * 1000 },
  inviteCreate: { limit: 20, windowMs: 60 * 60 * 1000 },
  upload: { limit: 30, windowMs: 60 * 60 * 1000 },
} as const;

export type RateLimitPolicyName = keyof typeof RATE_LIMIT_POLICIES;

let storeInstance: RateLimitStore | null = null;

/**
 * Returns the configured rate limit store.
 *
 * - `RATE_LIMIT_STORE="memory"` (default): single-process in-memory store.
 *
 * Any other value fails loudly instead of silently running without limiting,
 * so a deployment moving behind multiple instances is forced to provide a
 * shared backend. The MemoryRateLimitStore remains the reference
 * implementation and the default for development.
 */
export function getRateLimitStore(): RateLimitStore {
  if (storeInstance) {
    return storeInstance;
  }

  const configured = process.env.RATE_LIMIT_STORE || "memory";

  if (configured === "memory") {
    storeInstance = new MemoryRateLimitStore();
    return storeInstance;
  }

  throw new Error(
    `Unsupported RATE_LIMIT_STORE "${configured}". Supported values: "memory".`,
  );
}

/**
 * Best-effort client IP for rate limit keys.
 *
 * Prefers the leftmost `x-forwarded-for` entry (set by reverse proxies),
 * falls back to `x-real-ip`, and otherwise uses a constant bucket. The IP is
 * only used as a rate-limit key — it is never trusted for authorization.
 */
export async function getRateLimitClientIp(): Promise<string> {
  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }
  return headerStore.get("x-real-ip") ?? "unknown";
}

/**
 * Consumes one unit from a named policy and returns the decision.
 */
export async function consumeRateLimit(
  key: string,
  policy: RateLimitPolicyName,
): Promise<RateLimitDecision> {
  const { limit, windowMs } = RATE_LIMIT_POLICIES[policy];
  return getRateLimitStore().consume(key, limit, windowMs);
}

/**
 * Shared message used by route handlers when a limit is exceeded.
 */
export const RATE_LIMIT_EXCEEDED_MESSAGE =
  "Too many requests. Please try again later.";