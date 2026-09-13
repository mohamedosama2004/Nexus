import { describe, expect, it } from "vitest";

import { apiError, apiTooManyRequests } from "./api-response";

describe("apiError", () => {
  it("returns a generic error payload with the requested status", async () => {
    const response = apiError("Unauthorized", 401);
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "Unauthorized",
    });
  });

  it("includes issues only when provided", async () => {
    const response = apiError("Invalid input", 400, { field: ["required"] });
    await expect(response.json()).resolves.toEqual({
      error: "Invalid input",
      issues: { field: ["required"] },
    });
  });

  it("never leaks stack traces or internal details", async () => {
    const response = apiError("Internal server error", 500);
    const body = (await response.json()) as Record<string, unknown>;

    expect(JSON.stringify(body)).not.toMatch(/stack|sql|password|token/i);
  });
});

describe("apiTooManyRequests", () => {
  it("returns 429 with a Retry-After header", async () => {
    const response = apiTooManyRequests(42);

    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("42");
    await expect(response.json()).resolves.toEqual({
      error: "Too many requests. Please try again later.",
    });
  });
});