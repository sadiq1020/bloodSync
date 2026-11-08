import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const PROTECTED_PREFIXES = ["/requests", "/my", "/donor", "/donors", "/admin"];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Better Auth cookie check:
  // In development (HTTP), the session cookie is named "better-auth.session_token".
  // Over HTTPS in production (see server/src/config/auth.ts defaultCookieAttributes),
  // Better Auth automatically prefixes the cookie with "__Secure-".
  // getSessionCookie() checks both "__Secure-better-auth.session_token" and "better-auth.session_token".
  // We also check request.cookies as a fallback to guarantee compatibility across all runtimes.
  const sessionCookie =
    getSessionCookie(request) ??
    request.cookies.get("__Secure-better-auth.session_token")?.value ??
    request.cookies.get("better-auth.session_token")?.value;

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

