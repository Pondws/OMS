import { Status } from "type"

export namespace ProductVariantType {
  /** รูปแบบการแสดงในหน้าร้าน */
  export type DisplayType = "TEXT" | "CIRCLE"

  /** ค่าของตัวเลือก เช่น แดง, M (ที่ API ส่งกลับมา) */
  export interface Option {
    id: string
    name: string
    /** มีค่าเมื่อ type = "CIRCLE" */
    colorHex: string | null
    sortOrder: number
  }

  /** แถวในหน้ารายการ */
  export interface ProductVariant {
    id: string
    name: string
    type: DisplayType
    status: Status
    options: Option[]
    createdAt: string
    updatedAt: string
  }

  /** ข้อมูลจาก getByID ใช้ตอนเปิดหน้าแก้ไข */
  // export interface ProductVariant extends GetProductVariant {}

  /** ค่าของตัวเลือกที่ส่งไปตอนสร้างหรือแก้ไข */
  export interface OptionForm {
    /** มีเฉพาะค่าที่มีอยู่แล้ว ค่าที่เพิ่มใหม่ไม่ต้องส่ง */
    id?: string
    name: string
    /** ส่ง null เมื่อ type = "TEXT" */
    colorHex: string | null
    sortOrder: number
  }

  /** body ของ create / update */
  export interface ProductVariantForm {
    name: string
    status: Status
    type: DisplayType
    options: OptionForm[]
  }
}