"use client"

import { memo, useState } from "react"
import { useRouter } from "next/navigation"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import omitBy from "lodash/omitBy"
import { Plus } from "lucide-react"

import { Button, DataTable, Header } from "components"
import { productVariantApi } from "apis"
import { useTableQuery } from "hooks"
import { Helper } from "utils"
import { PRODUCT_VARIANT } from "./product-variant.const"
import { productVariantColumns } from "./product-variant.columns"

const DEFAULT_QUERY = { page: 1, limit: 10, startDate: "", endDate: "" }

function ProductVariantTableComp() {
  const router = useRouter()
  const { queryValues, updateQuery } = useTableQuery()

  const [query, setQuery] = useState(() => {
    const initial = { ...DEFAULT_QUERY, ...queryValues }
    return {
      ...initial,
      page: Number(initial.page) || DEFAULT_QUERY.page,
      limit: Number(initial.limit) || DEFAULT_QUERY.limit,
    }
  })
  const params = omitBy(query, Helper.omitEmptyField)

  const { data } = useQuery({
    queryKey: PRODUCT_VARIANT.queryKey.list(params),
    queryFn: () => productVariantApi.getAll(params),
    placeholderData: keepPreviousData, // ตอนเปลี่ยนหน้า ตารางไม่กระพริบว่าง
  })

  const changePage = (page: number, limit: number) => {
    setQuery((prev) => ({ ...prev, page, limit }))
    updateQuery({ page, limit })
  }

  return (
    <div className="overflow-hidden p-4">
      <Header
        title={PRODUCT_VARIANT.name}
        actionButton={
          <Button size="lg" onClick={() => router.push(PRODUCT_VARIANT.path("create"))}>
            <Plus />
            {PRODUCT_VARIANT.text("create")}
          </Button>
        }
      />

      <DataTable
        columns={productVariantColumns}
        data={data?.data ?? []}
        page={query.page}
        limit={query.limit}
        total={data?.meta?.total ?? 0}
        totalPages={data?.meta?.totalPages ?? 0}
        onPageChange={changePage}
        onLimitChange={(limit) => changePage(1, limit)}
      />
    </div>
  )
}

export const ProductVariantTable = memo(ProductVariantTableComp)