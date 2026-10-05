// "use client"

// import {
//   tableFeatures,
//   useTable,
//   flexRender,
//   type ColumnDef,
// } from "@tanstack/react-table"

// import {
//   TableBase,
//   TableBody,
//   TableCell,
//   TableFooter,
//   TableHead,
//   TableHeader,
//   TableRow,
//   Skeleton
// } from "components"
// import { Inbox } from "lucide-react"

// const features = tableFeatures({})

// type Features = typeof features

// interface TableProps<TData> {
//   rows: TData[]
//   columns: ColumnDef<Features, TData>[]
//   loading: boolean
//   totalRows?: number
//   height?: string
//   onRowClick?: (row: TData) => void
// }

// interface ColumnMeta {
//   width?: string | number
// }

// export const Table = <TData,>(props: TableProps<TData>) => {
//   const {
//     rows,
//     columns,
//     loading = false,
//     totalRows,
//     height,
//     onRowClick
//   } = props
//   const features = tableFeatures({})

//   const table = useTable({
//     features,
//     data: rows,
//     columns,
//   })

//   if (loading) {
//     return <Skeleton className="w-full h-[450px]" />
//   }

//   return (
//     <div
//       className='rounded-sm border'
//     // style={{ height }}
//     >
//       <TableBase>
//         <TableHeader id='table-header' className="flex-none">
//           {table.getHeaderGroups().map(headerGroup => (
//             <TableRow key={headerGroup.id}>
//               {headerGroup.headers.map(header => (
//                 <TableHead
//                   key={header.id}
//                   className={`h-9 ${header.column.id === 'action' ? 'text-right w-[60px]' : ''
//                     }`}
//                   style={{ width: (header.column.columnDef.meta as ColumnMeta)?.width || header.getSize() }}
//                 >
//                   {flexRender(header.column.columnDef.header, header.getContext())}
//                 </TableHead>
//               )
//               )}
//             </TableRow>
//           ))}
//         </TableHeader>

//         <TableBody>
//           {rows.length === 0 ? (
//             <TableRow className="hover:bg-transparent">
//               <TableCell align="center" colSpan={columns.length} style={{ height }}>
//                 <Inbox size={84} strokeWidth={1} />
//                 No data
//               </TableCell>
//             </TableRow>
//           ) : (
//             table.getRowModel().rows.map((row) => (
//               <TableRow
//                 key={row.id}
//                 onClick={() => onRowClick?.(row?.original)}
//                 className={onRowClick ? 'cursor-pointer' : ''}
//               >
//                 {row.getVisibleCells().map((cell) => (
//                   <TableCell
//                     key={cell.id}
//                     className={`h-9 ${cell.column.id === 'action' ? 'text-right w-[60px]' : ''
//                       }`}
//                     style={{ width: (cell.column.columnDef.meta as ColumnMeta)?.width || cell.column.getSize() }}
//                   >
//                     {flexRender(cell.column.columnDef.cell, cell.getContext())}
//                   </TableCell>
//                 ))}
//               </TableRow>
//             ))
//           )}
//         </TableBody>

//         {rows.length > 0 && (
//           <TableFooter id='table-footer'>
//             <TableRow>
//               <TableCell colSpan={columns.length}>{`ทั้งหมด ${totalRows}`}</TableCell>
//             </TableRow>
//           </TableFooter>
//         )}
//       </TableBase>
//     </div>
//   )
// }

"use client"

import { useTable, type ColumnDef, type RowData } from "@tanstack/react-table"

import {
  TableBase,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "components"

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

import {
  SelectBase,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { features, type DataTableFeatures } from "./data-table-features"

interface DataTableProps<TData extends RowData> {
  columns: ColumnDef<DataTableFeatures, TData>[]
  data: TData[]

  page: number
  limit: number
  total: number
  totalPages: number

  onPageChange: (page: number, limit: number) => void
  onLimitChange: (page: number) => void
}

export function DataTable<TData extends RowData>({
  columns,
  data,
  page,
  limit,
  total,
  totalPages,
  onPageChange,
  onLimitChange,
}: DataTableProps<TData>) {
  const table = useTable({
    features,
    data,
    columns,
  })

  const start = total > 0 ? (page - 1) * limit + 1 : 0
  const end = Math.min(page * limit, total)

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-auto rounded-sm border">
        <TableBase>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : (
                        <table.FlexRender header={header} />
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  ไม่พบข้อมูล
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </TableBase>
      </div>

      <div className="mt-3 flex shrink-0 items-center justify-between">
        <span className="text-sm text-muted-foreground">
          แสดง {start} – {end} จาก {total} รายการ
        </span>

        <div className="flex gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              แสดง
            </span>

            <SelectBase
              value={String(limit)}
              onValueChange={(value) => {
                onLimitChange(Number(value))
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="6">6</SelectItem>
                <SelectItem value="9">9</SelectItem>
                <SelectItem value="12">12</SelectItem>
              </SelectContent>
            </SelectBase>
          </div>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()

                    if (page > 1) {
                      onPageChange(page - 1, limit)
                    }
                  }}
                />
              </PaginationItem>

              {Array.from(
                { length: totalPages },
                (_, index) => index + 1
              ).map((pageNumber) => (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    href="#"
                    isActive={pageNumber === page}
                    onClick={(e) => {
                      e.preventDefault()
                      onPageChange(pageNumber, limit)
                    }}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()

                    if (page < totalPages) {
                      onPageChange(page + 1, limit)
                    }
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  )
}