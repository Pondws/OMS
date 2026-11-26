"use client"

import { ProductVariantForm } from "components"
import { useParams } from "next/navigation"

export default function ProductTagEditPage() {
  const params = useParams()
  const id = params.id

  return <ProductVariantForm id={id as string} />
}