import { z } from "zod"
import { ProductVariantType } from "types"
import { Helper } from "utils"

export const DEFAULT_HEX = "#000000"

export const DISPLAY_TYPES = ["TEXT", "CIRCLE"] as const satisfies readonly ProductVariantType.DisplayType[]

export const DISPLAY_TYPE_LABEL: Record<ProductVariantType.DisplayType, string> = {
  TEXT: "ปุ่มข้อความ",
  CIRCLE: "วงกลมสี",
}

export const productVariantSchema = z
  .object({
    name: z.string().trim().min(1, "กรุณากรอกชื่อตัวเลือกสินค้า"),
    status: z.enum(["ACTIVE", "INACTIVE"]),
    type: z.enum(DISPLAY_TYPES),
    options: z
      .array(
        z.object({
          id: z.string().optional(),
          name: z.string().trim().min(1, "กรุณากรอกชื่อตัวเลือก"),
          colorHex: z.string(),
        }),
      )
      .min(1, "ต้องมีตัวเลือกอย่างน้อย 1 ตัว"),
  })
  .superRefine((values, ctx) => {
    Helper.findDuplicateIndexes(values.options.map((o) => o.name)).forEach((index) => {
      ctx.addIssue({ code: "custom", path: ["options", index, "name"], message: "ชื่อตัวเลือกซ้ำกัน" })
    })

    if (values.type === "CIRCLE") {
      values.options.forEach((option, index) => {
        if (!Helper.isHex(option.colorHex)) {
          ctx.addIssue({ code: "custom", path: ["options", index, "colorHex"], message: "รหัสสีต้องเป็น #RRGGBB" })
        }
      })
    }
  })

export type ProductVariantFormValues = z.infer<typeof productVariantSchema>
export type OptionFormValue = ProductVariantFormValues["options"][number]

export const EMPTY_OPTION: OptionFormValue = { name: "", colorHex: DEFAULT_HEX }

export const DEFAULT_VALUES: ProductVariantFormValues = {
  name: "",
  status: "ACTIVE",
  type: "TEXT",
  options: [EMPTY_OPTION],
}

export function toFormValues(data: ProductVariantType.ProductVariant): ProductVariantFormValues {
  return {
    name: data.name,
    status: data.status,
    type: data.type ?? "TEXT",
    options: Helper.sortBySortOrder(data.options).map((o) => ({
      id: o.id,
      name: o.name,
      colorHex: o.colorHex ?? DEFAULT_HEX,
    })),
  }
}

export function toPayload(values: ProductVariantFormValues): ProductVariantType.ProductVariantForm {
  const isCircle = values.type === "CIRCLE"
  return {
    name: values.name,
    status: values.status,
    type: values.type,
    options: values.options.map((o, index) => ({
      id: o.id,
      name: o.name,
      // ปุ่มข้อความไม่ต้องมีรหัสสี แต่ในฟอร์มยังเก็บไว้ สลับกลับมาแล้วค่าเดิมยังอยู่
      colorHex: isCircle ? o.colorHex.toUpperCase() : null,
      sortOrder: index,
    })),
  }
}