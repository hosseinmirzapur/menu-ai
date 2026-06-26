import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const { pathname } = request.nextUrl;

  const skipPaths = ["/_next/", "/api/", "/admin", "/cafe", "/fonts/", "/favicon.ico", "/restaurant/"];
  if (skipPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Strip port from hostname for comparison
  const host = hostname.split(":")[0];

  // Handle *.localhost:<port> for local testing
  if (host.endsWith(".localhost")) {
    const subdomain = host.slice(0, host.lastIndexOf(".localhost"));
    if (subdomain && subdomain !== "www") {
      const newUrl = new URL(`/restaurant/${subdomain}${pathname}`, request.url);
      return NextResponse.rewrite(newUrl);
    }
  }

  // Handle any subdomain of any domain (e.g. cafe-a.menuchat.vercel.app, cafe-a.menu-ai.vercel.app, etc.)
  // A subdomain exists when there are 3+ dot-separated parts
  const parts = host.split(".");
  if (parts.length >= 3) {
    const subdomain = parts[0];
    if (subdomain !== "www") {
      const newUrl = new URL(`/restaurant/${subdomain}${pathname}`, request.url);
      return NextResponse.rewrite(newUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
