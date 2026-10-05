import { ALERT_TEXT } from 'consts'
import { AlertTextType, ProductTagType } from 'types'
import { ColumnDef, createColumnHelper } from "@tanstack/react-table"
import { format } from 'date-fns'
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
//   Button
// } from 'components'
// import { EllipsisVertical, SquarePen, Trash } from "lucide-react"
import { type DataTableFeatures } from "components"


const defaultName = 'หมวดหมู่สินค้า'
const defaultPath = 'product-category'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const columnHelper = createColumnHelper<DataTableFeatures, any>()

export const PRODUCT_CATEGORY = {
  name: defaultName,
  text: (
    action: AlertTextType.ActionProps,
    status?: AlertTextType.StatusProps
  ) =>
    status
      ? `${ALERT_TEXT.action[action]}${defaultName}${ALERT_TEXT.status[status]}`
      : `${ALERT_TEXT.action[action]}${defaultName}`,
  path: (
    action?: AlertTextType.PathProps
  ) => action ? `/${defaultPath}/${action}` : `/${defaultPath}`,
  columns: columnHelper.columns([
    columnHelper.accessor("name", {
      header: "ชื่อหมวดหมู่สินค้า",
    }),
    columnHelper.accessor("createdAt", {
      header: "วันที่สร้าง",
      cell: info => {
        const { updatedAt } = info.row.original
        return updatedAt ? format(updatedAt, 'dd/MM/yyyy') : '-'
      },
    }),
    columnHelper.accessor("updatedAt", {
      header: "วันที่อัปเดต",
      cell: info => {
        const { updatedAt } = info.row.original
        return updatedAt ? format(updatedAt, 'dd/MM/yyyy') : '-'
      },
    }),
  ])
} 