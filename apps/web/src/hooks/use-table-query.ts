"use client"

import { useRouter, useSearchParams } from "next/navigation";
import { Helper } from "utils";

// export function useTableQuery() {
//   const router = useRouter()
//   const searchParams = useSearchParams()

//   const updateQuery = (values: Record<string, unknown>) => {
//     const current = Object.fromEntries(searchParams.entries())

//     const final = {
//       ...current,
//       ...values,
//     }

//     const query = Helper.createQueryString(final)

//     router.push(query ? `?${query}` : "?")
//   }

//   return {
//     updateQuery
//   }
// }

export function useTableQuery() {
  const router = useRouter()
  const searchParams = useSearchParams()

 const queryValues = {
  // ...defaultValues,
  ...Object.fromEntries(
    Array.from(searchParams.entries()).map(([key, value]) => [
      key,
      key === "page" || key === "limit"
        ? Number(value)
        : value,
    ])
  ),
}

  const updateQuery = (values: Record<string, unknown>) => {
    const current = Object.fromEntries(searchParams.entries())

    const final = {
      // ...defaultValues,
      ...current,
      ...values,
    }

    const query = Helper.createQueryString(final)

    router.replace(`?${query}`)
  }

  return {
    queryValues,
    updateQuery
  }
}