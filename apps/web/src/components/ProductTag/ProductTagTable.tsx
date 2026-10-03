"use client"

import { memo, useState } from "react"
import {
  // Table,
  Button,
  Header,
  DatePicker,
  DataTable
} from "components"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { productTagApi } from "apis"
import { PRODUCT_TAG } from "./product-tag.const"
import { useTableHeight } from "hooks"
import { Plus } from "lucide-react"

const defaultValues = {
  page: 1,
  limit: 3,
  // startDate: '',
  // endDate: '',
}

function ProductTagTableComp() {
  const router = useRouter()
  // const queryClient = useQueryClient()
  // const height = useTableHeight()


  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(3)
  // const fetchData = async () => {
  //   const res = await productTagApi.getAll(defaultValues)
  //   return res.data
  // }

  const {
    data,
    isFetching
  } = useQuery({
    queryKey: ['product-tag', { page, limit }],

    queryFn: () => productTagApi.getAll({
      page,
      limit
    })
  })

  const rows = data?.data ?? []
  const total = data?.meta?.total ?? 0
  const totalPages = data?.meta?.totalPages ?? 0

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit)
    setPage(1)
  }

  // const {
  //   mutate,
  // } = useMutation({
  //   mutationFn: (id: string) => productTagApi.deleteByID(id),
  //   onSuccess: () => queryClient.invalidateQueries({ queryKey: ["product-tag"] })
  // })

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

      <DataTable
        columns={PRODUCT_TAG.columns}
        data={rows}
        page={page}
        limit={limit}
        total={total}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
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