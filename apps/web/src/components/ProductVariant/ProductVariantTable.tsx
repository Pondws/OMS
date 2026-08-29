"use client"

import { memo } from "react"
import {
  // Table,
  Button,
  Header,
  DatePicker
} from "components"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { productVariantApi } from "apis"
import { PRODUCT_VARIANT } from "./product-variant.const"
import { useTableHeight } from "hooks"
import { Plus } from "lucide-react"

const defaultVariants = {
  page: 0,
  limit: 10,
  startDate: '',
  endDate: '',
}

function ProductVariantTableComp() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const height = useTableHeight()

  const fetchData = async () => {
    const res = await productVariantApi.getAll(defaultVariants)
    return res
  }

  const {
    data,
    isFetching
  } = useQuery({
    queryKey: ['product-tag'],
    queryFn: fetchData
  })

  const rows = data?.data || []
  const totalRows = data?.totalRows || 0

  const {
    mutate,
  } = useMutation({
    mutationFn: (id: string) => productVariantApi.deleteByID(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["product-tag"] })
  })

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
        filterBox={
          <DatePicker />
        }
      />

      {/* <Table
        rows={rows}
        columns={PRODUCT_VARIANT.columns({
          onEdit: (id) => router.push(`${PRODUCT_VARIANT.path('edit')}/${id}`),
          onDelete: (id) => mutate(id),
        })}
        loading={isFetching}
        totalRows={totalRows}
        height={height}
        onRowClick={(row) => router.push(`${PRODUCT_VARIANT.path('edit')}/${row?.id}`)}
      /> */}
    </div>
  )
}

export const ProductVariantTable = memo(ProductVariantTableComp) 