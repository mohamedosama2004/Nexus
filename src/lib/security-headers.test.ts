import { afterEach, describe, expect, it } from "vitest";

import {
  applyHeaders,
  buildCspHeader,
  buildSecurityHeaders,
} from "./security-headers";
import { NextResponse } from "next/server";

const originalEnv = process.env.NODE_ENV;

afterEach(() => {
  process.env.NODE_ENV = originalEnv;
});

function headerMap(headers: [string, string][]): Record<string, string> {
  return Object.fromEntries(headers);
}

describe("buildCspHeader", () => {
  it("includes the nonce for script-src", () => {
    const csp = buildCspHeader("abc123");
    expect(csp).toContain("script-src 'self' 'nonce-abc123'");
  });

  it("adds strict-dynamic and keeps unsafe-eval out of production", () => {
    process.env.NODE_ENV = "production";
    const csp = buildCspHeader("nonce");
    expect(csp).not.toContain("'unsafe-eval'");
    expect(csp).toContain("'strict-dynamic'");
    expect(csp).toContain("upgrade-insecure-requests");
  });

  it("allows unsafe-eval in development and skips upgrade-insecure-requests", () => {
    process.env.NODE_ENV = "development";
    const csp = buildCspHeader("nonce");
    expect(csp).toContain("'unsafe-eval'");
    expect(csp).not.toContain("upgrade-insecure-requests");
  });

  it("blocks frames and plugins", () => {
    const csp = buildCspHeader("nonce");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
  });
});

describe("buildSecurityHeaders", () => {
  it("includes the standard security headers", () => {
    const headers = headerMap(buildSecurityHeaders(buildCspHeader("n")));

    expect(headers["Content-Security-Policy"]).toBeDefined();
    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
    expect(headers["X-Frame-Options"]).toBe("DENY");
    expect(headers["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["Permissions-Policy"]).toContain("geolocation=()");
  });

  it("sends HSTS only in production", () => {
    process.env.NODE_ENV = "production";
    expect(
      headerMap(buildSecurityHeaders(buildCspHeader("n")))["Strict-Transport-Security"],
    ).toContain("max-age=");

    process.env.NODE_ENV = "development";
    expect(
      headerMap(buildSecurityHeaders(buildCspHeader("n")))["Strict-Transport-Security"],
    ).toBeUndefined();
  });
});

describe("applyHeaders", () => {
  it("sets header pairs on a NextResponse", () => {
    const response = NextResponse.next();
    applyHeaders(response, [["X-Test", "1"]]);
    expect(response.headers.get("X-Test")).toBe("1");
  });
});