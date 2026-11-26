"use client"

import { useEffect } from "react"
import { useTable, type ColumnDef, type RowData } from "@tanstack/react-table"

import { TableBase, TableBody, TableCell, TableHead, TableHeader, TableRow } from "components"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { SelectBase, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

import { features, type DataTableFeatures } from "./data-table-features"

const DEFAULT_LIMIT_OPTIONS = [10, 20, 50, 100]

type PageItem = number | "start-ellipsis" | "end-ellipsis"

/** เลขหน้าที่จะแสดง เช่น 1 … 4 5 6 … 20 */
function getPageItems(current: number, total: number, siblings = 1): PageItem[] {
  const maxShown = siblings * 2 + 5 // หน้าแรก + หน้าสุดท้าย + หน้าปัจจุบัน + หน้าข้างๆ + ช่อง … 2 ช่อง
  if (total <= maxShown) return Array.from({ length: total }, (_, i) => i + 1)

  const left = Math.max(2, current - siblings)
  const right = Math.min(total - 1, current + siblings)
  const items: PageItem[] = [1]

  if (left > 2) items.push("start-ellipsis")
  for (let p = left; p <= right; p++) items.push(p)
  if (right < total - 1) items.push("end-ellipsis")
  items.push(total)

  return items
}

interface DataTableProps<TData extends RowData> {
  columns: ColumnDef<DataTableFeatures, TData>[]
  data: TData[]

  page: number
  limit: number
  total: number
  totalPages: number

  onPageChange: (page: number, limit: number) => void
  onLimitChange: (limit: number) => void
  onRowClick?: (row: TData) => void
  isRowActive?: (row: TData) => boolean

  limitOptions?: number[]
  isLoading?: boolean
  emptyText?: string
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
  limitOptions = DEFAULT_LIMIT_OPTIONS,
  isLoading = false,
  emptyText = "ไม่พบข้อมูล",
  onRowClick,
  isRowActive,
}: DataTableProps<TData>) {
  const table = useTable({ features, data, columns })

  const rows = table.getRowModel().rows
  const columnCount = table.getVisibleLeafColumns().length || columns.length

  const start = total > 0 ? (page - 1) * limit + 1 : 0
  const end = Math.min(page * limit, total)
  const canPrev = page > 1
  const canNext = page < totalPages

  // ใส่ limit ปัจจุบันเข้าไปด้วย ถ้าไม่อยู่ในรายการ ช่องเลือกจะได้ไม่ว่าง
  const limits = limitOptions.includes(limit)
    ? limitOptions
    : [...limitOptions, limit].sort((a, b) => a - b)

  // ลบแถวสุดท้ายของหน้าสุดท้ายแล้วจำนวนหน้าลดลง ให้ถอยกลับไปหน้าที่ยังมีข้อมูล
  useEffect(() => {
    if (!isLoading && totalPages > 0 && page > totalPages) {
      onPageChange(totalPages, limit)
    }
  }, [isLoading, page, totalPages, limit, onPageChange])

  const goTo = (target: number) => (e: React.MouseEvent) => {
    e.preventDefault()
    if (target >= 1 && target <= totalPages && target !== page) onPageChange(target, limit)
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-auto rounded-sm border">
        <TableBase aria-busy={isLoading}>
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
                <TableRow
                  key={row.id}
                  tabIndex={onRowClick ? 0 : undefined}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  onKeyDown={
                    onRowClick
                      ? (e) => {
                        if (e.target !== e.currentTarget) return
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault()
                          onRowClick(row.original)
                        }
                      }
                      : undefined
                  }
                  className={cn(
                    isLoading && "opacity-60",
                    onRowClick && "cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
                  )}
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
                <TableCell colSpan={columnCount} className="h-24 text-center text-muted-foreground">
                  {isLoading ? "กำลังโหลด..." : emptyText}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </TableBase>
      </div>

      <div className="mt-3 flex shrink-0 flex-wrap items-center justify-between gap-3">
        <span className="text-sm text-muted-foreground" aria-live="polite">
          แสดง {start} – {end} จาก {total} รายการ
        </span>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">แถวต่อหน้า</span>
            <SelectBase value={String(limit)} onValueChange={(value) => onLimitChange(Number(value))}>
              <SelectTrigger className="w-20" aria-label="จำนวนแถวต่อหน้า">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {limits.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectBase>
          </div>

          {totalPages > 1 && (
            <Pagination className="mx-0 w-auto">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={goTo(page - 1)}
                    aria-disabled={!canPrev}
                    tabIndex={canPrev ? undefined : -1}
                    className={cn(!canPrev && "pointer-events-none opacity-50")}
                  />
                </PaginationItem>

                {getPageItems(page, totalPages).map((item) =>
                  typeof item === "number" ? (
                    <PaginationItem key={item}>
                      <PaginationLink
                        href="#"
                        isActive={item === page}
                        aria-label={`หน้า ${item}`}
                        onClick={goTo(item)}
                      >
                        {item}
                      </PaginationLink>
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={item}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ),
                )}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={goTo(page + 1)}
                    aria-disabled={!canNext}
                    tabIndex={canNext ? undefined : -1}
                    className={cn(!canNext && "pointer-events-none opacity-50")}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </div>
    </div>
  )
}