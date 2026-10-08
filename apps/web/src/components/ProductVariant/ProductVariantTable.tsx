"use client"

import { memo } from "react"
import {
  // Table,
  Button,
  Header,
  DatePicker,
  DataTable
} from "components"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { productVariantApi } from "apis"
import { PRODUCT_VARIANT } from "./product-variant.const"
import { Plus } from "lucide-react"
import { Helper } from "utils"
import omitBy from "lodash/omitBy"
import { useForm, useWatch } from "react-hook-form"
import { useTableQuery } from "hooks"

const defaultValues = {
  page: 1,
  limit: 10,
  startDate: '',
  endDate: '',
}

function ProductVariantTableComp() {
  const router = useRouter()
  const {
    queryValues,
    updateQuery
  } = useTableQuery()

  const {
    control,
    setValue,
  } = useForm({
    defaultValues: {
      ...defaultValues,
      ...queryValues,
    },
  })

  const value = useWatch({
    control,
  })

  const apiValue = omitBy(value, Helper.omitEmptyField)

  const {
    data
  } = useQuery({
    queryKey: ['product-category', apiValue],

    queryFn: () => productVariantApi.getAll(apiValue)
  })

  const rows = data?.data ?? []
  const total = data?.meta?.total ?? 0
  const totalPages = data?.meta?.totalPages ?? 0

  const handlePageChange = (page: number, limit: number) => {
    setValue("page", page)
    setValue("limit", limit)

    updateQuery({
      page,
      limit,
    })
  }

  const handleLimitChange = (limit: number) => {
    setValue("page", 1)
    setValue("limit", limit)

    updateQuery({
      page: 1,
      limit,
    })
  }
  return (
    <div className="p-4 overflow-hidden">
      <Header
        title={PRODUCT_VARIANT.name}
        actionButton={
          <Button
            onClick={() => router.push(PRODUCT_VARIANT.path('create'))}
            size='lg'
          >
            <Plus />
            {PRODUCT_VARIANT.text('create')}
          </Button>
        }
      // filterBox={
      //   <DatePicker />
      // }
      />

      <DataTable
        columns={PRODUCT_VARIANT.columns}
        data={rows}
        page={value?.page ?? defaultValues.page}
        limit={value?.limit ?? defaultValues.limit}
        total={total}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
      />
    </div>
  )
}

export const ProductVariantTable = memo(ProductVariantTableComp) 