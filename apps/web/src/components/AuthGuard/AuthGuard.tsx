"use client"

import { useRouter } from "next/navigation"
import { useEffect, ReactNode } from "react"
import { Loading } from "components"
import { useMe } from "hooks"

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { data, isPending, isError, refetch } = useMe()

  const isLoggedOut = !isPending && !isError && !data?.user

  useEffect(() => {
    if (isLoggedOut) router.replace("/login")
  }, [isLoggedOut, router])

  if (isPending) return <Loading />

  if (isError) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3">
        <p>ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้</p>
        <button onClick={() => refetch()} className="rounded border px-4 py-2">
          ลองใหม่
        </button>
      </div>
    )
  }

  if (isLoggedOut) return null

  return children
}