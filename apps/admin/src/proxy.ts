import axios from "axios"
import { NextRequest, NextResponse } from "next/server"
import { getSessionCookie } from "better-auth/cookies"

const guestOnlyRoutes = ["/login", "/forgot-password"]
const publicRoutes = [...guestOnlyRoutes, "/reset-password"]

async function hasValidSession(req: NextRequest) {
  try {
    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/get-session`,
      {
        headers: { cookie: req.headers.get("cookie") ?? "" },
        timeout: 3000,
      }
    )
    return !!data?.user
  } catch (error) {
    console.error("[proxy] get-session failed", error)
    return false
  }
}
export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname
  const hasCookie = !!getSessionCookie(req)

  if (!publicRoutes.includes(path) && !hasCookie) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  if (guestOnlyRoutes.includes(path) && hasCookie && (await hasValidSession(req))) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|\\.well-known|.*\\.(?:png|jpg|jpeg|svg|webp)$).*)"],
}