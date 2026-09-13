import type { RateLimitDecision, RateLimitStore } from "./types";

type Bucket = {
  count: number;
  resetAt: number;
};

/**
 * In-memory token-bucket implementation of `RateLimitStore`.
 *
 * Suitable for development and single-instance deployments. It is NOT shared
 * across processes, so multi-instance production deployments must swap in a
 * distributed store (Redis) via `RATE_LIMIT_STORE`.
 *
 * Buckets expire after their window elapses: when a bucket is depleted the
 * retry-after is derived from the time left in the current window, and a
 * periodic sweep removes fully-expired entries so the map does not grow
 * unboundedly.
 */
export class MemoryRateLimitStore implements RateLimitStore {
  private readonly buckets = new Map<string, Bucket>();
  private nextSweepAt = 0;

  constructor(private readonly sweepIntervalMs = 60_000) {}

  private sweep(now: number) {
    if (now < this.nextSweepAt) {
      return;
    }
    this.nextSweepAt = now + this.sweepIntervalMs;
    for (const [key, bucket] of this.buckets) {
      if (bucket.resetAt <= now) {
        this.buckets.delete(key);
      }
    }
  }

  async consume(
    key: string,
    limit: number,
    windowMs: number,
  ): Promise<RateLimitDecision> {
    const now = Date.now();
    this.sweep(now);

    const bucket = this.buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      this.buckets.set(key, { count: 1, resetAt: now + windowMs });
      return {
        allowed: true,
        remaining: limit - 1,
        retryAfterSeconds: Math.ceil(windowMs / 1000),
      };
    }

    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((bucket.resetAt - now) / 1000),
    );

    if (bucket.count >= limit) {
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds,
      };
    }

    bucket.count += 1;

    return {
      allowed: true,
      remaining: limit - bucket.count,
      retryAfterSeconds,
    };
  }
}