import { NextRequest, NextResponse } from "next/server";

const ROOT_DOMAIN =
  process.env.ROOT_DOMAIN ||
  process.env.NEXT_PUBLIC_VERCEL_URL ||
  "menuchat.vercel.app";

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const { pathname } = request.nextUrl;

  const skipPaths = ["/_next/", "/api/", "/admin", "/cafe", "/fonts/", "/favicon.ico", "/restaurant/"];
  if (skipPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const host = hostname.split(":")[0];

  // Handle *.localhost for local testing
  if (host.endsWith(".localhost")) {
    const subdomain = host.slice(0, host.lastIndexOf(".localhost"));
    if (subdomain && subdomain !== "www") {
      const newUrl = new URL(`/restaurant/${subdomain}${pathname}`, request.url);
      return NextResponse.rewrite(newUrl);
    }
  }

  // Handle known root domain with subdomain.
  // e.g. cafe-a.menuchat.vercel.app → rewrite to /restaurant/cafe-a
  //      menuchat.vercel.app itself → pass through (no subdomain, no rewrite)
  if (host.endsWith(`.${ROOT_DOMAIN}`)) {
    const subdomain = host.slice(0, host.length - ROOT_DOMAIN.length - 1);
    if (subdomain && subdomain !== "www") {
      const newUrl = new URL(`/restaurant/${subdomain}${pathname}`, request.url);
      return NextResponse.rewrite(newUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
