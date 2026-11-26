import {
  isNil
} from "lodash"
import { format } from "date-fns"

const HEX_REGEX = /^#[0-9A-Fa-f]{6}$/

export const Helper = {
  handleColorStatus: (
    status: "ACTIVE" | "INACTIVE" | undefined
  ) => {
    switch (status) {
      case "ACTIVE":
        return [
          "border-success",
          "text-success",
          "font-semibold"
        ].join(" ")

      case "INACTIVE":
        return [
          "border-muted-foreground",
          "text-muted-foreground",
          "font-semibold"
        ].join(" ")

      default:
        return [
          "border-input",
          "bg-background",
          "text-foreground",
          "hover:bg-accent",
          "focus:ring-ring/30",
        ].join(" ")
    }
  },
  createQueryString: (values: Record<string, unknown>) => {
    const params = new URLSearchParams()

    Object.entries(values).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        params.set(key, String(value))
      }
    })

    return params.toString()
  },
  omitEmptyField: (value: unknown) => {
    return isNil(value) || value === ""
  },
  formatDate: (value?: string | Date | null, pattern = "dd/MM/yyyy") => {
    if (!value) return "-"
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? "-" : format(date, pattern)
  },

  /** เรียงตาม sortOrder โดยไม่แก้ array เดิม */
  sortBySortOrder: <T extends { sortOrder: number }>(items: T[]) =>
    [...items].sort((a, b) => a.sortOrder - b.sortOrder),

  /** index ของค่าที่ซ้ำกับค่าก่อนหน้า (ไม่สนตัวพิมพ์เล็กใหญ่ และช่องว่างหัวท้าย) ค่าว่างไม่นับ */
  findDuplicateIndexes: (values: string[]) => {
    const seen = new Set<string>()
    return values.reduce<number[]>((dupes, value, index) => {
      const key = value.trim().toLowerCase()
      if (!key) return dupes
      if (seen.has(key)) dupes.push(index)
      seen.add(key)
      return dupes
    }, [])
  },

  /** เป็นรหัสสีรูปแบบ #RRGGBB หรือไม่ */
  isHex: (value?: string | null): value is string => !!value && HEX_REGEX.test(value),

  /** ใช้แสดงผล ถ้ารหัสสีผิดรูปแบบจะได้ fallback แทน */
  safeHex: (value?: string | null, fallback = "#FFFFFF") =>
    value && HEX_REGEX.test(value) ? value : fallback,

  /** ใช้ตอนผู้ใช้พิมพ์รหัสสี: แปลงเป็นตัวพิมพ์ใหญ่ เติม # และตัดให้ไม่เกิน 7 ตัว */
  normalizeHex: (raw: string) => {
    let value = raw.trim().toUpperCase()
    if (value && !value.startsWith("#")) value = `#${value}`
    return value.slice(0, 7)
  },
}