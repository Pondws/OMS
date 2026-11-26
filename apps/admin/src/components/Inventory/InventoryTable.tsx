"use client"

import { memo } from "react"
import {
  Button,
  Header,
  DatePicker,
  DataTable,
  Select,
  Input
} from "components"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useTableQuery } from "hooks"
import { Plus } from "lucide-react"
import { STATUS } from "consts"
import { useForm, useWatch } from "react-hook-form"
import { Helper } from "utils"
import omitBy from "lodash/omitBy"
import { inventoryColumns } from "./inventory.columns"
import { InventoryApi } from "apis"
import { INVENTORY } from "./inventory.const"

const defaultValues = {
  name: "",
  status: "",
  page: 1,
  limit: 10,
  dateType: "createdAt",
  startDate: '',
  endDate: '',
}

function InventoryTableComp() {
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

  const value = useWatch({ control })
  const apiValue = omitBy(value, Helper.omitEmptyField)
  const selectSku = (skuId: string | null) => updateQuery({ sku: skuId ?? undefined })

  const {
    data,
    isFetching
  } = useQuery({
    queryKey: ['inventory', apiValue],
    queryFn: () => InventoryApi.getAll(apiValue)
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
    <div className="flex h-full flex-col overflow-hidden p-4">
      <Header
        title={INVENTORY.name}
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
          </>
        }
      />

      <DataTable
        columns={inventoryColumns}
        data={rows}
        isLoading={isFetching}
        page={value?.page ?? defaultValues.page}
        limit={value?.limit ?? defaultValues.limit}
        total={total}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        onRowClick={(row) => selectSku(row.id)}
      />

    </div>
  )
}

export const InventoryTable = memo(InventoryTableComp)