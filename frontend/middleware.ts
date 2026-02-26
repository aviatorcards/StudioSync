import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Exclude static paths and API routes explicitly to avoid unnecessary checks/loops
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".") || // Files with extensions (images, etc)
    pathname.startsWith("/api") || // Don't block API requests
    pathname.startsWith("/docs") // Documentation
  ) {
    return NextResponse.next();
  }

  // Only check setup status if the user is trying to access /setup
  // (to prevent re-running setup once already completed)
  if (pathname.startsWith("/setup")) {
    try {
      const res = await fetch("http://backend:8000/api/core/setup/status/", {
        next: { revalidate: 0 },
        method: "GET",
      });

      if (res.ok) {
        const data = await res.json();
        // If setup is already done, redirect away from /setup to prevent duplication
        if (data.is_completed) {
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }
      }
    } catch (error) {
      // If backend is unreachable, fail open
      console.error("Middleware backend check failed:", error);
    }
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
