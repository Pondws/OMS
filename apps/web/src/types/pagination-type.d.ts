export interface PaginationType {
  page?: number
  limit?: number
  dateType?: "createdAt" | "updatedAt"
  startDate?: string
  endDate?: string
}