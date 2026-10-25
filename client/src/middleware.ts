import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const PROTECTED_PREFIXES = ["/requests", "/my", "/donor", "/donors", "/admin"];

const AUTH_ROUTES = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = getSessionCookie(request);

  const isProtectedRoute = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Visitors without a session cookie are redirected from protected routes to /login
  if (isProtectedRoute && !sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Visitors with a session cookie are redirected from /login and /register to /requests
  if (isAuthRoute && sessionCookie) {
    return NextResponse.redirect(new URL("/requests", request.url));
  }

  return NextResponse.next();
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
    "/login",
    "/register",
  ],
};
