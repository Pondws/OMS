import { ALERT_TEXT } from 'consts'
import { AlertTextType, ProductTagType } from 'types'
import { ColumnDef, createColumnHelper } from "@tanstack/react-table"
import { format } from 'date-fns'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Button
} from 'components'
import { EllipsisVertical, SquarePen, Trash } from "lucide-react"

const defaultName = 'ตัวเลือกสินค้า'
const defaultPaht = 'product-variant'

// const columnHelper = createColumnHelper<ProductTagType.GetProductTag>()

export const PRODUCT_VARIANT = {
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
  ) => action ? `/${defaultPaht}/${action}` : `/${defaultPaht}`,
  // columns: (
  //   action: {
  //     onDelete?: (id: string) => void
  //     onEdit?: (id: string) => void
  //   }) => [
  //     columnHelper.accessor("createdAt", {
  //       header: "วันที่สร้าง",
  //       cell: info => {
  //         const { createdAt } = info.row.original
  //         return createdAt ? format(createdAt, 'dd/MM/yyyy') : '-'
  //       },
  //       meta: {
  //         width: 120
  //       }
  //     }),
  //     columnHelper.accessor("updatedAt", {
  //       header: "วันที่แก้ไข",
  //       cell: info => {
  //         const { updatedAt } = info.row.original
  //         return updatedAt ? format(updatedAt, 'dd/MM/yyyy') : '-'
  //       },
  //       meta: {
  //         width: 120
  //       }
  //     }),
  //     columnHelper.accessor("name", {
  //       header: "ชื่อตัวเลือกสินค้า",
  //       meta: {
  //         width: 'auto'
  //       }
  //     }),
  //     columnHelper.display({
  //       id: 'action',
  //       cell: ({ row }) => (
  //         <DropdownMenu>
  //           <DropdownMenuTrigger asChild>
  //             <Button variant="ghost" className="h-9 w-9 p-0">
  //               <EllipsisVertical />
  //             </Button>
  //           </DropdownMenuTrigger>
  //           <DropdownMenuContent align="end">
  //             <DropdownMenuItem
  //               onClick={() => action.onEdit?.(row.original.id)}
  //             >
  //               <SquarePen />
  //               Edit
  //             </DropdownMenuItem>
  //             <DropdownMenuSeparator />
  //             <DropdownMenuItem
  //               onClick={() => action.onDelete?.(row.original.id)}
  //             >
  //               <Trash />
  //               Delete
  //             </DropdownMenuItem>
  //           </DropdownMenuContent>
  //         </DropdownMenu>
  //       ),
  //       meta: {
  //         width: 50
  //       }
  //     })
  //   ] as ColumnDef<ProductTagType.GetProductTag>[]
} 