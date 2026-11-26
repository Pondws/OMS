"use client"

import { useEffect, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useMe } from "hooks"

export function GuestGuard({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { data } = useMe()
  const isLoggedIn = !!data?.user

  useEffect(() => {
    if (isLoggedIn) router.replace("/dashboard")
  }, [isLoggedIn, router])

  if (isLoggedIn) return null

  return children
}