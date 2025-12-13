import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Paths that require authentication
  const protectedPaths = [
    "/write",
    "/edit",
    "/bookmarks",
    "/settings",
    "/stats",
  ];

  // API routes that require authentication
  const protectedApiPaths = [
    "/api/posts",
    "/api/like",
    "/api/bookmark",
    "/api/follow",
  ];

  // Check if the path requires authentication
  const isProtectedPath = protectedPaths.some(path => 
    pathname.startsWith(path)
  );

  const isProtectedApiPath = protectedApiPaths.some(path => 
    pathname.startsWith(path)
  );

  // Get the token from the request
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  // If trying to access protected route without token, redirect to login
  if ((isProtectedPath || isProtectedApiPath) && !token) {
    const loginUrl = new URL("/auth/signin", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Allow access to public routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth.js routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};