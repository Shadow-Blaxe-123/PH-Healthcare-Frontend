import { JwtPayload, verify } from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

//  Types

type UserRole = "ADMIN" | "DOCTOR" | "PATIENT";
type RouteConfig = {
  exact: string[];
  patterns: RegExp[];
};

const authRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];
const commonProtectedRoutes: RouteConfig = {
  exact: ["/my-profile", "/settings"],
  patterns: [],
};
const doctorProtectedRoutes: RouteConfig = {
  exact: [],
  patterns: [/^\/doctor/],
};
const patientProtectedRoutes: RouteConfig = {
  exact: [],
  patterns: [/^\/dashboard/],
};
const adminProtectedRoutes: RouteConfig = {
  exact: [],
  patterns: [/^\/admin/],
};

const isAuthRoutes = (pathName: string) => {
  return authRoutes.some((route) => route === pathName);
};

const isRouteMatches = (pathName: string, routes: RouteConfig): boolean => {
  if (routes.exact.includes(pathName)) {
    return true;
  }
  return routes.patterns.some((pattern) => pattern.test(pathName));
};

const getRouteOwner = (
  pathName: string
): "ADMIN" | "DOCTOR" | "PATIENT" | "COMMON" | null => {
  if (isRouteMatches(pathName, adminProtectedRoutes)) {
    return "ADMIN";
  }
  if (isRouteMatches(pathName, doctorProtectedRoutes)) {
    return "DOCTOR";
  }
  if (isRouteMatches(pathName, patientProtectedRoutes)) {
    return "PATIENT";
  }
  if (isRouteMatches(pathName, commonProtectedRoutes)) {
    return "COMMON";
  }
  return null;
};

const getDefaultDashboardRoute = (role: UserRole): string => {
  if (role === "ADMIN") {
    return "/admin/dashboard";
  }
  if (role === "DOCTOR") {
    return "/doctor/dashboard";
  }
  if (role === "PATIENT") {
    return "/dashboard";
  }
  return "/";
};
// This function can be marked `async` if using `await` inside
export async function proxy(request: NextRequest) {
  const cookieStore = await cookies();
  const pathName = request.nextUrl.pathname;

  const accessToken = request.cookies.get("accessToken")?.value || null;

  let userRole: UserRole | null = null;
  if (accessToken) {
    const verifiedToken: JwtPayload | string = verify(
      accessToken,
      process.env.JWT_ACCESS_TOKEN_SECRET as string
    );
    if (typeof verifiedToken === "string") {
      cookieStore.delete("accessToken");
      cookieStore.delete("refreshToken");
      return NextResponse.redirect(new URL("/login", request.url));
    }
    userRole = verifiedToken.role;
  }
  const routeOwner = getRouteOwner(pathName);
  const isAuth = isAuthRoutes(pathName);

  if (accessToken && isAuth) {
    return NextResponse.redirect(
      new URL(getDefaultDashboardRoute(userRole as UserRole), request.url)
    );
  }
  if (routeOwner === null) {
    return NextResponse.next();
  }
  if (routeOwner === "COMMON") {
    if (!accessToken) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

// Alternatively, you can use a default export:
// export default function proxy(request: NextRequest) { ... }

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.well-known).*)",
  ],
};
