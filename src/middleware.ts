import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "codomax_session";

/**
 * Cheap edge guard for the dashboard: a request without a session cookie is
 * bounced to /login before any server component runs. Full JWT verification
 * happens in the dashboard layout (Node runtime, DB-backed).
 */
export function middleware(request: NextRequest) {
  const hasSession = request.cookies.has(SESSION_COOKIE);
  const { pathname, search } = request.nextUrl;

  if (!hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
