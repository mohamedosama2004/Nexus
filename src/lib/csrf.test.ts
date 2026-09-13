import { describe, expect, it } from "vitest";

import { assertSameOrigin, CROSS_ORIGIN_ERROR, isSafeMethod } from "./csrf";

function makeRequest(method: string, headers: Record<string, string>): Request {
  return new Request("http://localhost:3000/api/example", {
    method,
    headers,
  });
}

describe("isSafeMethod", () => {
  it("treats GET, HEAD and OPTIONS as safe", () => {
    expect(isSafeMethod("GET")).toBe(true);
    expect(isSafeMethod("HEAD")).toBe(true);
    expect(isSafeMethod("OPTIONS")).toBe(true);
  });

  it("treats state-changing methods as unsafe", () => {
    expect(isSafeMethod("POST")).toBe(false);
    expect(isSafeMethod("PATCH")).toBe(false);
    expect(isSafeMethod("DELETE")).toBe(false);
  });
});

describe("assertSameOrigin", () => {
  it("allows safe methods without any origin header", () => {
    const result = assertSameOrigin(makeRequest("GET", {}));
    expect(result.ok).toBe(true);
  });

  it("rejects a state-changing request with no Origin or Referer", () => {
    const result = assertSameOrigin(makeRequest("POST", {}));
    expect(result).toEqual({ ok: false, error: "Missing Origin header." });
  });

  it("accepts a same-origin POST", () => {
    const result = assertSameOrigin(
      makeRequest("POST", { origin: "http://localhost:3000" }),
    );
    expect(result).toEqual({ ok: true });
  });

  it("accepts requests matching a custom APP_URL", () => {
    const result = assertSameOrigin(
      makeRequest("PATCH", { origin: "https://nexus.example.com" }),
      "https://nexus.example.com",
    );
    expect(result).toEqual({ ok: true });
  });

  it("rejects a cross-origin POST", () => {
    const result = assertSameOrigin(
      makeRequest("POST", { origin: "https://evil.example.com" }),
      "http://localhost:3000",
    );
    expect(result).toEqual({ ok: false, error: CROSS_ORIGIN_ERROR });
  });

  it("rejects a malformed origin header", () => {
    const result = assertSameOrigin(
      makeRequest("POST", { origin: "not-a-url" }),
    );
    expect(result).toEqual({ ok: false, error: "Invalid Origin header." });
  });

  it("falls back to the Referer header when Origin is missing", () => {
    const result = assertSameOrigin(
      makeRequest("POST", { referer: "http://localhost:3000/dashboard" }),
    );
    expect(result).toEqual({ ok: true });
  });

  it("rejects a foreign Referer", () => {
    const result = assertSameOrigin(
      makeRequest("POST", { referer: "https://evil.example.com/x" }),
      "https://nexus.example.com",
    );
    expect(result).toEqual({ ok: false, error: CROSS_ORIGIN_ERROR });
  });
});