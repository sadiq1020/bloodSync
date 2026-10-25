import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const PROTECTED_PREFIXES = ["/requests", "/my", "/donor", "/donors", "/admin"];

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const sessionCookie = getSessionCookie(request);

  const isProtectedRoute = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  // Visitors without a session cookie are redirected from protected routes to /login?next=...
  if (isProtectedRoute && !sessionCookie) {
    const fullPath = pathname + search;
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", fullPath);
    return NextResponse.redirect(loginUrl);
  }

  // Pass current pathname to downstream server components via request headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname + search);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    "/requests/:path*",
    "/my/:path*",
    "/donor",
    "/donor/:path*",
    "/donors",
    "/donors/:path*",
    "/admin",
    "/admin/:path*",
  ],
};
