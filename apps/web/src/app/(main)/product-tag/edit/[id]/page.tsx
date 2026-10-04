"use client"

import { ProductTagForm } from "components"
import { useParams } from "next/navigation"

export default function ProductTagEditPage() {
  const params = useParams()
  const id = params?.id as string

  return <ProductTagForm id={id} />
}