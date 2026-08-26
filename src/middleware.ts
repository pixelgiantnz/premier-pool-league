import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/convex-server";

const PUBLIC_PATHS = [
  "/gate",
  "/admin/login",
  "/admin/register",
  "/admin/reset-password",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))
  ) {
    return NextResponse.next();
  }

  const session = request.cookies.get(SESSION_COOKIE)?.value;
  if (!session) {
    const gateUrl = request.nextUrl.clone();
    gateUrl.pathname = "/gate";
    gateUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(gateUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.*\\..*).*)"],
};
