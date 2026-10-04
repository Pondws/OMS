"use client"

import { memo, useState } from "react"
import {
  // Table,
  Button,
  Header,
  DatePicker,
  DataTable,
  Autocomplete,
  Select,
  Input
} from "components"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { productTagApi } from "apis"
import { PRODUCT_TAG } from "./product-tag.const"
import { useTableHeight, useTableQuery } from "hooks"
import { Plus } from "lucide-react"
import { STATUS } from "consts"
import { useForm, Controller, useWatch } from "react-hook-form"
import { Helper } from "utils"
import { omitBy } from "lodash"

const defaultValues = {
  name: "",
  status: "",
  page: 1,
  limit: 3,
  // dateType: "createdAt",
  startDate: '',
  endDate: '',
}

function ProductTagTableComp() {
  const router = useRouter()
  const {
    queryValues,
    updateQuery
  } = useTableQuery()

  const {
    control,
    register,
    watch,
    setValue,
    reset
  } = useForm({
    defaultValues: {
      ...defaultValues,
      ...queryValues,
    },
  })

  const value = useWatch({
    control,
  })

  console.log("value", value)

  const apiValue = omitBy(value, Helper.omitEmptyField)

  const {
    data,
    isFetching
  } = useQuery({
    queryKey: ['product-tag', apiValue],

    queryFn: () => productTagApi.getAll(apiValue)
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
          <div>
            {/* <DatePicker
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
            /> */}

            {/* <Input
              placeholder="ชื่อ"
              {...register("name")}
            />

            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  placeholder="สถานะ"
                  options={STATUS}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            /> */}
          </div>
        }
      />

      <DataTable
        columns={PRODUCT_TAG.columns}
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

export const ProductTagTable = memo(ProductTagTableComp)


// const {
//   mutate,
// } = useMutation({
//   mutationFn: (id: string) => productTagApi.deleteByID(id),
//   onSuccess: () => queryClient.invalidateQueries({ queryKey: ["product-tag"] })
// })

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