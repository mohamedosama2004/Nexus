/**
 * CSRF defense for Route Handlers.
 *
 * Server Actions in Next.js already include built-in Origin/Host header
 * checks, but plain Route Handlers (PATCH/POST/DELETE fetches from client
 * components) do not. This module adds the same principle to those routes:
 * every state-changing request must come from an origin we expect.
 *
 * Strategy:
 * - Safe (non-state-changing) methods GET/HEAD/OPTIONS always pass.
 * - A state-changing request must include an `Origin` (preferred) or
 *   `Referer` header whose origin matches the configured `APP_URL`.
 * - Requests with neither header are rejected (browsers always send Origin
 *   on non-GET requests, so a legit same-origin fetch always carries one).
 * - In development, any `localhost`/`127.0.0.1` origin is accepted to avoid
 *   breaking dev flows on non-standard ports.
 *
 * If `APP_URL` is unset the default is `http://localhost:3000`, which makes
 * production deployments fail closed until `APP_URL` is configured — the safe
 * default, since we would rather block a frame-busting/xsite request than
 * silently allow one.
 */

type OriginCheckResult =
  | { ok: true }
  | { ok: false; error: string };

export const CROSS_ORIGIN_ERROR =
  "Cross-origin request rejected.";

export function isSafeMethod(method: string): boolean {
  return method === "GET" || method === "HEAD" || method === "OPTIONS";
}

function isLocalhostSource(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]" ||
    hostname === "::1"
  );
}

export function assertSameOrigin(
  request: Request,
  appUrl: string = process.env.APP_URL ?? "http://localhost:3000",
): OriginCheckResult {
  if (isSafeMethod(request.method)) {
    return { ok: true };
  }

  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const source = origin ?? referer;

  if (!source) {
    return { ok: false, error: "Missing Origin header." };
  }

  let sourceUrl: URL;

  try {
    sourceUrl = new URL(source);
  } catch {
    return { ok: false, error: "Invalid Origin header." };
  }

  const expectedUrl = new URL(appUrl);

  if (sourceUrl.origin === expectedUrl.origin) {
    return { ok: true };
  }

  // Development: accept any localhost origin (covers non-default ports, IPv4
  // loopback, and tools like pnpm dev on a forwarded port).
  if (process.env.NODE_ENV !== "production" && isLocalhostSource(sourceUrl.hostname)) {
    return { ok: true };
  }

  return { ok: false, error: CROSS_ORIGIN_ERROR };
}