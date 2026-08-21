import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = ["/dashboard", "/projects", "/settings"];

//! NextResponse.next()  ========>  complete the request (go to the required destination)

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }
  
  // TODO: check authentication
  const sessionToken = request.cookies.get("session_token")?.value;
  if (!sessionToken) {
    const loginURl = new URL("/login", request.url);
    return NextResponse.redirect(loginURl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/projects/:path*", "/settings/:path*"],
};
