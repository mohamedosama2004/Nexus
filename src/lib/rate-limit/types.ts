export type RateLimitDecision = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

/**
 * Provider-neutral rate limit backend.
 *
 * The concrete store backing this interface is chosen at runtime from the
 * `RATE_LIMIT_STORE` environment variable (see `getRateLimitStore`). A
 * `RateLimitStore` is only responsible for counting a request against a fixed
 * sliding window for a given key; the policies (limits + windows) and the call
 * sites (server actions / route handlers) live in the calling code.
 */
export interface RateLimitStore {
  consume(key: string, limit: number, windowMs: number): Promise<RateLimitDecision>;
}