"use client"

import { memo } from "react"
import {
  Button,
  Header,
  DatePicker,
  // DataTable,
  // Select,
  // Input
} from "components"
// import { useMutation, useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
// import { productCategoryApi } from "apis"
import { PRODUCT } from "./product.const"
import { useTableQuery } from "hooks"
import { Plus } from "lucide-react"
// import { STATUS } from "consts"
import {
  useForm,
  //  Controller,
  useWatch
} from "react-hook-form"
// import { Helper } from "utils"
// import { omitBy } from "lodash"

const defaultValues = {
  name: "",
  status: "",
  page: 1,
  limit: 10,
  dateType: "createdAt",
  startDate: '',
  endDate: '',
}

function ProductTableComp() {
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

  // const apiValue = omitBy(value, Helper.omitEmptyField)

  // const {
  //   data
  // } = useQuery({
  //   queryKey: ['product-category', apiValue],

  //   queryFn: () => productCategoryApi.getAll(apiValue)
  // })

  // const rows = data?.data ?? []
  // const total = data?.meta?.total ?? 0
  // const totalPages = data?.meta?.totalPages ?? 0

  // const handlePageChange = (page: number, limit: number) => {
  //   setValue("page", page)
  //   setValue("limit", limit)

  //   updateQuery({
  //     page,
  //     limit,
  //   })
  // }

  // const handleLimitChange = (limit: number) => {
  //   setValue("page", 1)
  //   setValue("limit", limit)

  //   updateQuery({
  //     page: 1,
  //     limit,
  //   })
  // }

  return (
    <div className="flex h-full flex-col overflow-hidden p-4">
      <Header
        title={PRODUCT.name}
        actionButton={
          <Button
            onClick={() => router.push(PRODUCT.path('create'))}
            size='lg'
          >
            <Plus />
            {PRODUCT.text('create')}
          </Button>
        }
        filterBox={
          <>
            <DatePicker
              dateTypeValue={value.dateType}
              onDateTypeChange={(dateType) => {
                setValue("dateType", dateType)
                setValue("page", 1)

                updateQuery({
                  dateType,
                  page: 1,
                })
              }}
              startDate={value.startDate}
              endDate={value.endDate}
              onDateRangeChange={(range) => {
                setValue("startDate", range.startDate)
                setValue("endDate", range.endDate)
                setValue("page", 1)

                updateQuery({
                  startDate: range.startDate,
                  endDate: range.endDate,
                  page: 1,
                })
              }}
            />
          </>
        }
      />

      {/* <DataTable
        columns={PRODUCT.columns}
        data={rows}
        page={value?.page ?? defaultValues.page}
        limit={value?.limit ?? defaultValues.limit}
        total={total}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
      /> */}
    </div>
  )
}

export const ProductTable = memo(ProductTableComp)