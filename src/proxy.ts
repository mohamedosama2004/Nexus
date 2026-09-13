import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  buildCspHeader,
  buildSecurityHeaders,
  applyHeaders,
} from "@/src/lib/security-headers";

const protectedRoutes = ["/dashboard", "/projects", "/settings", "/invitations"];

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- Cookie-presence guard (protected routes only) ---
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );

  // --- Per-request nonce for Content-Security-Policy ---
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = buildCspHeader(nonce);
  const securityHeaders = buildSecurityHeaders(csp);

  // Next.js reads the CSP from the *request* headers so it can attach the
  // nonce to its internally-injected inline scripts. The response headers
  // carry the same policy for the browser.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set("x-nonce", nonce);
  applyHeaders(response, securityHeaders);

  if (isProtectedRoute) {
    const sessionToken = request.cookies.get("session_token")?.value;

    if (!sessionToken || !UUID_RE.test(sessionToken)) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
  missing: [
    { type: "header", key: "next-router-prefetch" },
    { type: "header", key: "purpose", value: "prefetch" },
  ],
};
