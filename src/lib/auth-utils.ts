//  Types

export type UserRole = "ADMIN" | "DOCTOR" | "PATIENT";
export type RouteConfig = {
  exact: string[];
  patterns: RegExp[];
};

export const authRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];
export const commonProtectedRoutes: RouteConfig = {
  exact: ["/my-profile", "/settings"],
  patterns: [],
};
export const doctorProtectedRoutes: RouteConfig = {
  exact: [],
  patterns: [/^\/doctor/],
};
export const patientProtectedRoutes: RouteConfig = {
  exact: [],
  patterns: [/^\/dashboard/],
};
export const adminProtectedRoutes: RouteConfig = {
  exact: [],
  patterns: [/^\/admin/],
};

export const isAuthRoutes = (pathName: string) => {
  return authRoutes.some((route) => route === pathName);
};

export const isRouteMatches = (
  pathName: string,
  routes: RouteConfig
): boolean => {
  if (routes.exact.includes(pathName)) {
    return true;
  }
  return routes.patterns.some((pattern) => pattern.test(pathName));
};

export const getRouteOwner = (
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

export const getDefaultDashboardRoute = (role: UserRole): string => {
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

export const isValidRedirectForRole = (
  redirectPath: string,
  role: UserRole
): boolean => {
  const routeOwner = getRouteOwner(redirectPath);
  if (routeOwner === null || routeOwner === "COMMON") {
    return true;
  }
  if (routeOwner === role) {
    return true;
  }
  return false;
};
