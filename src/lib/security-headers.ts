import { NextResponse } from "next/server";

/**
 * Build the Content-Security-Policy header value for a given per-request nonce.
 *
 * Policy decisions:
 * - script-src: nonce + strict-dynamic in production; adds 'unsafe-eval' in dev for HMR/overlay
 * - style-src: 'unsafe-inline' — required by Next.js next/font, react-toastify, daisyui
 * - connect-src: 'self' for API + HMR websocket (dev adds ws:)
 * - img-src: self, data: (Google profile avatars), blob: (client previews)
 * - font-src: self, data: (next/font base64 subsets)
 * - frame-ancestors: 'none' — prevents all framing (supersedes X-Frame-Options)
 * - form-action: 'self' — prevents form hijacking
 * - base-uri: 'self' — prevents base tag injection
 * - object-src: 'none' — blocks plugins/flash
 * - upgrade-insecure-requests: production only (dev uses localhost HTTP)
 */
export function buildCspHeader(nonce: string): string {
  const isDev = process.env.NODE_ENV !== "production";

  const directives: string[] = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob:`,
    `font-src 'self' data:`,
    `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
  ];

  if (!isDev) {
    directives.push(`upgrade-insecure-requests`);
  }

  return directives.join("; ");
}

/**
 * Return the array of security headers to apply to every response.
 * Called once per request in proxy.ts.
 */
export function buildSecurityHeaders(
  cspHeader: string,
): [string, string][] {
  const isProduction = process.env.NODE_ENV === "production";

  const headers: [string, string][] = [
    ["Content-Security-Policy", cspHeader],
    ["X-Content-Type-Options", "nosniff"],
    ["X-Frame-Options", "DENY"],
    ["Referrer-Policy", "strict-origin-when-cross-origin"],
    [
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=(), browsing-topics=()",
    ],
    ["Cross-Origin-Opener-Policy", "same-origin"],
  ];

  if (isProduction) {
    headers.push([
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload",
    ]);
  }

  return headers;
}

/**
 * Apply an array of [key, value] header pairs to a NextResponse.
 */
export function applyHeaders(
  response: NextResponse,
  headers: [string, string][],
): NextResponse {
  for (const [key, value] of headers) {
    response.headers.set(key, value);
  }
  return response;
}
