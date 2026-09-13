import { describe, expect, it, vi } from "vitest";

import { MemoryRateLimitStore } from "./memory-store";
import { consumeRateLimit, getRateLimitClientIp } from "./index";

const { mockGet } = vi.hoisted(() => ({
  mockGet: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: () => ({ get: mockGet }),
}));

describe("MemoryRateLimitStore", () => {
  it("allows requests up to the limit", async () => {
    const store = new MemoryRateLimitStore();

    for (let i = 0; i < 3; i++) {
      const decision = await store.consume("key", 3, 60_000);
      expect(decision.allowed).toBe(true);
      if (i === 2) {
        expect(decision.remaining).toBe(0);
      }
    }
  });

  it("blocks once the limit is exceeded and reports retry-after", async () => {
    const store = new MemoryRateLimitStore();

    for (let i = 0; i < 2; i++) {
      await store.consume("key", 2, 60_000);
    }

    const decision = await store.consume("key", 2, 60_000);

    expect(decision.allowed).toBe(false);
    expect(decision.remaining).toBe(0);
    expect(decision.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("keeps independent windows per key", async () => {
    const store = new MemoryRateLimitStore();

    await store.consume("a", 1, 60_000);
    const a = await store.consume("a", 1, 60_000);
    const b = await store.consume("b", 1, 60_000);

    expect(a.allowed).toBe(false);
    expect(b.allowed).toBe(true);
  });
});

describe("consumeRateLimit", () => {
  it("enforces a named policy and returns retry-after on denial", async () => {
    for (let i = 0; i < 3; i++) {
      await consumeRateLimit("login:1.2.3.4", "verificationResend");
    }

    const fourth = await consumeRateLimit("login:1.2.3.4", "verificationResend");

    expect(fourth.allowed).toBe(false);
    expect(fourth.retryAfterSeconds).toBeGreaterThan(0);
  });
});

describe("getRateLimitClientIp", () => {
  it("prefers the leftmost x-forwarded-for entry", async () => {
    mockGet.mockReturnValue("203.0.113.7, 10.0.0.1");
    expect(await getRateLimitClientIp()).toBe("203.0.113.7");
  });

  it("falls back to x-real-ip", async () => {
    mockGet.mockImplementation((name: string) =>
      name === "x-real-ip" ? "198.51.100.9" : null,
    );
    expect(await getRateLimitClientIp()).toBe("198.51.100.9");
  });

  it("returns a constant bucket when no IP header exists", async () => {
    mockGet.mockReturnValue(null);
    expect(await getRateLimitClientIp()).toBe("unknown");
  });
});