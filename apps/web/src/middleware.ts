import { NextRequest, NextResponse } from "next/server"
import { PUBLIC_PATHS } from "consts"

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const accessToken = req.cookies.get("accessToken")?.value

  const isAuthenticated = !!accessToken

  const isPublicPath = PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  )

  if (!isAuthenticated && !isPublicPath) {
    return NextResponse.redirect(
      new URL('/login', req.url)
    )
  }

  if (isAuthenticated && pathname === "/login") {
    return NextResponse.redirect(
      new URL('/dashboard', req.url)
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Run middleware on all routes except:
     * - _next/static
     * - _next/image
     * - favicon
     * - public files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
}