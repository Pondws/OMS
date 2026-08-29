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
import { productTagApi } from "apis"
import { PRODUCT_TAG } from "./product-tag.const"
import { useTableHeight } from "hooks"
import { Plus } from "lucide-react"

const defaultVariants = {
  page: 0,
  limit: 10,
  startDate: '',
  endDate: '',
}

function ProductTagTableComp() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const height = useTableHeight()

  console.log('height', height)

  const fetchData = async () => {
    const res = await productTagApi.getAll(defaultVariants)
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
  const totalRows: number = data?.totalRows || 0

  const {
    mutate,
  } = useMutation({
    mutationFn: (id: string) => productTagApi.deleteByID(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["product-tag"] })
  })

  return (
    <div className="p-4 overflow-hidden">
      <Header
        title={PRODUCT_TAG.name}
        actionButton={
          <Button
            onClick={() => router.push(PRODUCT_TAG.path('create'))}
            size='lg'
          >
            <Plus />
            {PRODUCT_TAG.text('create')}
          </Button>
        }
        filterBox={
          <DatePicker />
        }
      />

      {/* <Table
        rows={rows}
        columns={PRODUCT_TAG.columns({
          onEdit: (id) => router.push(`${PRODUCT_TAG.path('edit')}/${id}`),
          onDelete: (id) => mutate(id),
        })}
        loading={isFetching}
        totalRows={totalRows}
        height={height}
        onRowClick={(row) => router.push(`${PRODUCT_TAG.path('edit')}/${row?.id}`)}
      /> */}
    </div>
  )
}

export const ProductTagTable = memo(ProductTagTableComp) 