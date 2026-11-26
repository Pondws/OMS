"use client"

import { ProductCategoryForm } from "components"
import { useParams } from "next/navigation"

export default function ProductCategoryEditPage() {
  const params = useParams()
  const id = params?.id as string

  return <ProductCategoryForm id={id} />
}