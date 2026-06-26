import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const { pathname } = request.nextUrl;

  const skipPaths = ["/_next/", "/api/", "/admin", "/cafe", "/fonts/", "/favicon.ico", "/restaurant/"];
  if (skipPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const subdomain = hostname.match(/^(.*?)\.menuchat\.vercel\.app$/);
  if (subdomain && subdomain[1] !== "www") {
    const slug = subdomain[1];
    const newUrl = new URL(`/restaurant/${slug}${pathname === "/" ? "" : pathname}`, request.url);
    return NextResponse.rewrite(newUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
