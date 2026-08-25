import { SESSION_COOKIE } from "@/lib/convex-server";
import { NextRequest, NextResponse } from "next/server";

export function GET(request: NextRequest) {
  return NextResponse.json({
    authenticated: Boolean(request.cookies.get(SESSION_COOKIE)?.value),
  });
}
