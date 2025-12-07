import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes("_rsc")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("auth-storage")?.value;
  const protectedPaths = [
    "/dashboard",
    "/employee-portal",
    "/payroll",
    "/organizations",
    "/employees",
    "/compliance",
    "/settings",
  ];
  const publicPaths = ["/login", "/register", "/"];

  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  if (isProtectedPath && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (
    isPublicPath &&
    token &&
    (pathname === "/login" || pathname === "/register")
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
