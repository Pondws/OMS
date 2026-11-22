"use client"

import { useTable, type ColumnDef, type RowData } from "@tanstack/react-table"

import { TableBase, TableBody, TableCell, TableHead, TableHeader, TableRow } from "components"
import { cn } from "@/lib/utils"

import { features, type DataTableFeatures } from "../DataTable"

interface FormTableProps<TData extends RowData> {
  columns: ColumnDef<DataTableFeatures, TData>[]
  /** ใช้ fields จาก useFieldArray */
  data: TData[]
  getRowId: (row: TData, index: number) => string
  rowClassName?: (row: TData, index: number) => string | undefined
  emptyText?: string
}

export function FormTable<TData extends RowData>({
  columns,
  data,
  getRowId,
  rowClassName,
  emptyText = "ไม่มีข้อมูล",
}: FormTableProps<TData>) {
  const table = useTable({ features, data, columns, getRowId })
  const rows = table.getRowModel().rows
  const columnCount = table.getVisibleLeafColumns().length || columns.length

  return (
    <div className="overflow-auto rounded-sm border">
      <TableBase>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {rows.length > 0 ? (
            rows.map((row) => (
              <TableRow key={row.id} className={cn(rowClassName?.(row.original, row.index))}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columnCount} className="h-24 text-center text-muted-foreground">
                {emptyText}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </TableBase>
    </div>
  )
}