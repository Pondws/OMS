"use client"

import { useRouter } from "next/navigation"
import { useEffect, ReactNode } from "react"
import { Loading } from "components"
import { useMe } from "hooks"

export function GuardProvider({ children }: { children: ReactNode }) {
  const router = useRouter()

  const {
    data: user,
    isPending,
    isError
  } = useMe()

  useEffect(() => {
    if (!isPending && (isError || !user)) {
      router.replace("/login")
    }
  }, [isPending, isError, user, router])

  if (isPending) {
    return <Loading />
  }

  if (isError || !user) {
    return null
  }
  return children
}
