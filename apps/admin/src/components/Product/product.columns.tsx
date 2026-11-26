import type { ColumnDef } from "@tanstack/react-table"
import {
  Controller,
  type Control,
  type FieldArrayWithId,
  type FieldErrors,
  type UseFormRegister,
} from "react-hook-form"

import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

import type { DataTableFeatures } from "../DataTable"
import type { ProductFormValues, ProductOption } from "./product.schema"

export type SkuField = FieldArrayWithId<ProductFormValues, "skus", "id">

type SkuColumnsParams = {
  control: Control<ProductFormValues>
  register: UseFormRegister<ProductFormValues>
  errors: FieldErrors<ProductFormValues>
  options: ProductOption[]
  disabled?: boolean
}

export function skuColumns({
  control,
  register,
  errors,
  options,
  disabled,
}: SkuColumnsParams): ColumnDef<DataTableFeatures, SkuField>[] {
  // id ของ variant → ชื่อ ใช้แสดงคอลัมน์ตัวเลือก
  const names = new Map(options.flatMap((o) => o.variants.map((v) => [v.id, v.name] as const)))

  const error = (message?: string) =>
    message ? <p className="mt-1 text-xs text-destructive">{message}</p> : null

  return [
    {
      id: "status",
      header: "ขาย",
      cell: ({ row }) => (
        <Controller
          control={control}
          name={`skus.${row.index}.status`}
          render={({ field }) => (
            <Switch
              checked={field.value === "ACTIVE"}
              onCheckedChange={(checked) => field.onChange(checked ? "ACTIVE" : "INACTIVE")}
              disabled={disabled}
              aria-label={`เปิดขาย ${row.original.sku || `แถว ${row.index + 1}`}`}
            />
          )}
        />
      ),
    },
    {
      id: "variants",
      header: "ตัวเลือก",
      cell: ({ row }) => (
        <div className="min-w-24">
          <span className="whitespace-nowrap">
            {row.original.variantIds.map((id) => names.get(id) ?? "?").join(" / ") || "—"}
          </span>
          {error(errors.skus?.[row.index]?.variantIds?.message)}
        </div>
      ),
    },
    {
      id: "sku",
      header: "รหัส SKU",
      cell: ({ row }) => (
        <div>
          <Input
            className="h-8 w-40 font-mono text-xs"
            disabled={disabled}
            aria-label={`รหัส SKU แถว ${row.index + 1}`}
            aria-invalid={!!errors.skus?.[row.index]?.sku}
            {...register(`skus.${row.index}.sku`)}
          />
          {error(errors.skus?.[row.index]?.sku?.message)}
        </div>
      ),
    },
    {
      id: "price",
      header: "ราคา (฿)",
      cell: ({ row }) => (
        <div>
          <Input
            inputMode="decimal"
            placeholder="0.00"
            className="h-8 w-28 text-right tabular-nums"
            disabled={disabled}
            aria-label={`ราคา แถว ${row.index + 1}`}
            aria-invalid={!!errors.skus?.[row.index]?.price}
            {...register(`skus.${row.index}.price`)}
          />
          {error(errors.skus?.[row.index]?.price?.message)}
        </div>
      ),
    },
    {
      id: "compareAtPrice",
      header: "ราคาก่อนลด (฿)",
      cell: ({ row }) => (
        <div>
          <Input
            inputMode="decimal"
            placeholder="ไม่บังคับ"
            className="h-8 w-28 text-right tabular-nums"
            disabled={disabled}
            aria-label={`ราคาก่อนลด แถว ${row.index + 1}`}
            aria-invalid={!!errors.skus?.[row.index]?.compareAtPrice}
            {...register(`skus.${row.index}.compareAtPrice`)}
          />
          {error(errors.skus?.[row.index]?.compareAtPrice?.message)}
        </div>
      ),
    },
    {
      id: "stock",
      header: "สต็อก",
      cell: ({ row }) => (
        <div>
          <Input
            type="number"
            min={0}
            step={1}
            className="h-8 w-24 text-right tabular-nums"
            disabled={disabled}
            aria-label={`สต็อก แถว ${row.index + 1}`}
            aria-invalid={!!errors.skus?.[row.index]?.stock}
            {...register(`skus.${row.index}.stock`, { valueAsNumber: true })}
          />
          {error(errors.skus?.[row.index]?.stock?.message)}
        </div>
      ),
    },
    {
      id: "weightGrams",
      header: "น้ำหนัก (g)",
      cell: ({ row }) => (
        <div>
          <Input
            type="number"
            min={1}
            step={1}
            placeholder="ไม่บังคับ"
            className="h-8 w-24 text-right tabular-nums"
            disabled={disabled}
            aria-label={`น้ำหนัก แถว ${row.index + 1}`}
            aria-invalid={!!errors.skus?.[row.index]?.weightGrams}
            {...register(`skus.${row.index}.weightGrams`, {
              setValueAs: (v) => (v === "" || v === null ? null : Number(v)),
            })}
          />
          {error(errors.skus?.[row.index]?.weightGrams?.message)}
        </div>
      ),
    },
  ]
}