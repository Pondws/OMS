"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loading } from "components"
import { useMe } from "hooks"

export function GuestProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  const {
    data: user,
    isPending,
  } = useMe()

  useEffect(() => {
    if (!isPending && user) {
      router.replace("/dashboard")
    }
  }, [user, isPending, router])

  if (isPending) {
    return <Loading />
  }

  if (user) {
    return null
  }

  return children
}