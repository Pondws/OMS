import { ALERT_TEXT } from 'consts'
import { AlertTextType } from 'types'
import { createColumnHelper } from "@tanstack/react-table"
import { format } from 'date-fns'
import { type DataTableFeatures } from "components"


const defaultName = 'สินค้า'
const defaultPath = 'product'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const columnHelper = createColumnHelper<DataTableFeatures, any>()

export const PRODUCT = {
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