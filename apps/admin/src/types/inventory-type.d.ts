import { Status } from "types"

export namespace InventoryType {
  export type StockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK"

  export interface Item {
    id: string                 // skuId
    sku: string
    stock: number
    stockStatus: StockStatus
    status: Status
    product: { id: string; name: string; coverUrl: string | null }
    variantLabel: string       // เช่น "ดำ / M" ถ้าไม่มีตัวเลือกเป็น ""
    lastMovedAt: string | null
  }

  // export interface ListQuery {
  //   page?: number
  //   limit?: number
  //   search?: string
  //   categoryId?: string
  //   stockStatus?: "all" | "low" | "out"
  // }
}