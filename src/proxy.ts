import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || "kunci_cadangan");

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get("admin_session")?.value;
  let isTokenValid = false;

  if (token) {
    try {
      await jwtVerify(token, SECRET_KEY);
      isTokenValid = true;
    } catch {
      isTokenValid = false;
    }
  }

  if (path === "/login" && isTokenValid) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (path.startsWith("/admin") && !isTokenValid) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
