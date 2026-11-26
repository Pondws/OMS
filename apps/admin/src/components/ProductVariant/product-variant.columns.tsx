"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createColumnHelper } from "@tanstack/react-table"
import { toast } from "sonner"
import { Circle, EllipsisVertical, SquarePen, Trash, Type } from "lucide-react"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  type DataTableFeatures,
} from "components"
import { productVariantApi } from "apis"
import { ProductVariantType } from "types"
import { Helper, handleError } from "utils"
import { PRODUCT_VARIANT } from "./product-variant.const"
import { DISPLAY_TYPE_LABEL } from "./product-variant.schema"

type Row = ProductVariantType.ProductVariant

// ─── Cells ──────────────────────────────────

export function DisplayTypeBadge({ type }: { type: ProductVariantType.DisplayType }) {
  const Icon = type === "CIRCLE" ? Circle : Type
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium">
      <Icon className="size-3" aria-hidden />
      {DISPLAY_TYPE_LABEL[type]}
    </span>
  )
}

export function OptionValuesPreview({
  type,
  options,
  max = 4,
}: {
  type: ProductVariantType.DisplayType
  options: ProductVariantType.Option[]
  max?: number
}) {
  const sorted = Helper.sortBySortOrder(options)
  const shown = sorted.slice(0, max)
  const rest = sorted.length - shown.length

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {shown.map((o) =>
        type === "CIRCLE" ? (
          <span key={o.id} className="inline-flex items-center gap-1.5 rounded-full border py-0.5 pr-2 pl-0.5 text-xs">
            <span className="size-4 rounded-full border border-black/15" style={{ backgroundColor: Helper.safeHex(o.colorHex) }} aria-hidden />
            {o.name}
          </span>
        ) : (
          <span key={o.id} className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
            {o.name}
          </span>
        ),
      )}
      {rest > 0 && <span className="text-xs text-muted-foreground">+{rest}</span>}
    </div>
  )
}

function StatusBadge({ status }: { status: Row["status"] }) {
  return status === "ACTIVE" ? (
    <span className="rounded-md border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">เปิดใช้งาน</span>
  ) : (
    <span className="rounded-md border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">ปิดใช้งาน</span>
  )
}

/** ต้องเป็น component เพราะใช้ hook (ห้ามเรียก hook ใน cell ตรงๆ) */
function RowActions({ row }: { row: Row }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const { mutate: remove, isPending } = useMutation({
    mutationFn: () => productVariantApi.delete(row.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_VARIANT.queryKey.all })
      toast.success("ลบข้อมูลสำเร็จ")
      setConfirmOpen(false)
    },
    onError: (error) => toast.error(handleError(error)),
  })

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" className="size-8 p-0" aria-label={`จัดการ ${row.name}`} />}>
          <EllipsisVertical />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => router.push(PRODUCT_VARIANT.detailPath(row.id))}>
            <SquarePen />
            แก้ไข
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => setConfirmOpen(true)}>
            <Trash />
            ลบ
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            {/* <AlertDialogTitle>ลบตัวเลือก “{row.name}”?</AlertDialogTitle> */}
            <AlertDialogDescription>
              {/* ค่าของตัวเลือกทั้ง {row.options.length} ค่าจะถูกลบด้วย ถ้ามีสินค้าใช้อยู่จะลบไม่ได้ ให้เปลี่ยนสถานะเป็นปิดใช้งานแทน */}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>ยกเลิก</AlertDialogCancel>
            {/* ใช้ Button ธรรมดา dialog จะไม่ปิดเองก่อนลบเสร็จ */}
            <Button variant="destructive" disabled={isPending} onClick={() => remove()}>
              {isPending ? "กำลังลบ..." : "ลบ"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

// ─── Columns ────────────────────────────────

const columnHelper = createColumnHelper<DataTableFeatures, Row>()

export const productVariantColumns = columnHelper.columns([
  columnHelper.accessor("name", {
    header: "ชื่อตัวเลือกสินค้า",
    cell: (info) => <span className="font-medium">{info.getValue()}</span>,
  }),
  columnHelper.accessor("type", {
    header: "รูปแบบ",
    cell: (info) => <DisplayTypeBadge type={info.getValue()} />,
  }),
  // columnHelper.accessor("options", {
  //   header: "ค่า",
  //   cell: (info) => <OptionValuesPreview type={info.row.original.type} options={info.getValue()} />,
  // }),
  columnHelper.accessor("status", {
    header: "สถานะ",
    cell: (info) => <StatusBadge status={info.getValue()} />,
  }),
  columnHelper.accessor("createdAt", {
    header: "วันที่สร้าง",
    cell: (info) => Helper.formatDate(info.getValue()),
  }),
  columnHelper.accessor("updatedAt", {
    header: "วันที่อัปเดต",
    cell: (info) => Helper.formatDate(info.getValue()),
  }),
  columnHelper.display({
    id: "actions",
    header: () => <span className="sr-only">จัดการ</span>,
    cell: (info) => <RowActions row={info.row.original} />,
  }),
])