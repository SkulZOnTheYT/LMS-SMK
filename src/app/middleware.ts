import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  // Get the token using next-auth's getToken function
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // Get the pathname
  const { pathname } = request.nextUrl

  // Define public routes that don't require authentication
  const publicRoutes = ["/login", "/error", "/api/auth"]
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  // Check if the user is authenticated
  const isAuthenticated = !!token

  // If the route requires authentication and the user is not authenticated, redirect to login
  if (!isAuthenticated && !isPublicRoute) {
    // Store the original URL to redirect back after login
    const url = new URL("/login", request.url)
    url.searchParams.set("callbackUrl", encodeURI(request.url))
    return NextResponse.redirect(url)
  }

  // If the user is authenticated and trying to access login page, redirect to dashboard
  if (isAuthenticated && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all routes except static files, images, and API routes that don't need auth
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
