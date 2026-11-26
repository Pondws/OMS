import type { ColumnDef } from "@tanstack/react-table"
import type { DataTableFeatures } from "../DataTable/data-table-features"  
import { InventoryType } from "types"
import { cn } from "@/lib/utils"

// const dateFormat = new Intl.DateTimeFormat("th-TH", {
//   day: "numeric",
//   month: "short",
//   hour: "2-digit",
//   minute: "2-digit",
// })

export const inventoryColumns: ColumnDef<DataTableFeatures, InventoryType.Item>[] = [
  {
    id: "product",
    header: "สินค้า",
    cell: ({ row: { original: r } }) => (
      <div className="flex items-center gap-3">
        {r.product.coverUrl ? (
          <img src={r.product.coverUrl} alt="" className="size-9 rounded-md object-cover" />
        ) : (
          <div className="size-9 rounded-md bg-muted" />
        )}
        <span className="font-medium">{r.product.name}</span>
      </div>
    ),
  },
  {
    id: "variant",
    header: "ตัวเลือก",
    cell: ({ row }) => row.original.variantLabel || <span className="text-muted-foreground">–</span>,
  },
  {
    accessorKey: "sku",
    header: "รหัส SKU",
    cell: ({ row }) => <span className="font-mono text-xs">{row.original.sku}</span>,
  },
  {
    accessorKey: "stock",
    header: () => <div className="text-right">สต็อก</div>,
    cell: ({ row: { original: r } }) => (
      <div className="flex items-center justify-end gap-2 font-semibold tabular-nums">
        {r.stockStatus === "IN_STOCK" && (
          <span className="rounded-full bg-amber-100 px-2 text-xs font-medium text-amber-700">ใกล้หมด</span>
        )}
        {r.stockStatus === "OUT_OF_STOCK" && (
          <span className="rounded-full bg-red-100 px-2 text-xs font-medium text-red-700">หมด</span>
        )}
        {r.stock}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "สถานะขาย",
    cell: ({ row }) => (
      <span
        className={cn(
          "rounded-full px-2 py-0.5 text-xs font-medium",
          row.original.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground",
        )}
      >
        {row.original.status === "ACTIVE" ? "เปิดขาย" : "ปิดขาย"}
      </span>
    ),
  },
  // {
  //   accessorKey: "lastMovedAt",
  //   header: "อัปเดตล่าสุด",
  //   cell: ({ row }) =>
  //     row.original.lastMovedAt ? (
  //       <span className="text-muted-foreground tabular-nums">{dateFormat.format(new Date(row.original.lastMovedAt))}</span>
  //     ) : (
  //       "–"
  //     ),
  // },
]