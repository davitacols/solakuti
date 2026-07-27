import { NextRequest, NextResponse } from "next/server";

/**
 * Maintenance mode.
 *
 * When MAINTENANCE_MODE === "on", all traffic is rewritten to /maintenance.
 * This matters during the VPS migration: the backend/API will be down, so
 * without this the real pages would render as broken/empty.
 *
 * Team preview: append ?bypass=<MAINTENANCE_BYPASS_TOKEN> to any URL to set a
 * cookie that lets you browse the live (migrated) site while everyone else
 * still sees the maintenance page.
 */
const BYPASS_COOKIE = "solakuti-maint-bypass";

export function middleware(request: NextRequest) {
  if (process.env.MAINTENANCE_MODE !== "on") {
    return NextResponse.next();
  }

  const { nextUrl } = request;
  const token = process.env.MAINTENANCE_BYPASS_TOKEN;

  // Grant bypass via ?bypass=<token>, persisting it as a cookie.
  if (token && nextUrl.searchParams.get("bypass") === token) {
    const clean = nextUrl.clone();
    clean.searchParams.delete("bypass");
    const response = NextResponse.redirect(clean);
    response.cookies.set(BYPASS_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24
    });
    return response;
  }

  if (token && request.cookies.get(BYPASS_COOKIE)?.value === token) {
    return NextResponse.next();
  }

  // Let the maintenance page itself through to avoid a rewrite loop.
  if (nextUrl.pathname === "/maintenance") {
    return NextResponse.next();
  }

  const response = NextResponse.rewrite(new URL("/maintenance", request.url));
  // Signal a temporary outage to crawlers rather than a permanent 200 page.
  response.headers.set("Retry-After", "10800"); // ~3 hours
  return response;
}

export const config = {
  // Run on everything except Next internals and static assets, so the
  // maintenance page can still load its own CSS, logo and favicon.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|ico|webmanifest|xml|txt)).*)"]
};
