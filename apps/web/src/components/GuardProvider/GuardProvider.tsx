"use client"

import { useAuth } from "hooks"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import { PUBLIC_PATHS } from "consts"
import { Loading } from "components"

export function GuardProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth()
  const router = useRouter()
  const path = usePathname()

  useEffect(() => {
    if (auth?.loading) return

    if (!auth.isAuthenticated && !PUBLIC_PATHS.includes(path)) {
      router.replace("/login")
    } else if (auth.isAuthenticated && path === "/login") {
      router.replace("/dashboard")
    }
  }, [auth?.isAuthenticated, router, path, auth?.loading])

  if (auth.loading 
    || (!auth.isAuthenticated && !PUBLIC_PATHS.includes(path)) 
    || (auth.isAuthenticated && path === "/login")
  ) {
    return <Loading />
  }

  return children
}
