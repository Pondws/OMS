"use client"

import { useEffect, useState } from "react"
import { Loading } from "components"

export function Hydration({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

  if (!hydrated) return <Loading />

  return <div>{children}</div>
}