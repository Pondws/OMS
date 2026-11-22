import { z } from "zod"
import { Helper } from "utils"

export const MAX_IMAGES = 5
export const MAX_SKUS = 2048
const MONEY = /^\d{1,10}(\.\d{1,2})?$/

const optionSchema = z.object({ label: z.string(), value: z.string() })

const variantValueSchema = z.object({
  id: z.string(),
  name: z.string(),
  colorHex: z.string().nullable(),
})

const productOptionSchema = z
  .object({
    productVariantId: z.string(),
    name: z.string(),
    variants: z.array(variantValueSchema),
    selectedVariantIds: z.array(z.string()).min(1, "เลือกอย่างน้อย 1 ค่า"),
  })
  .superRefine((o, ctx) => {
    const available = new Set(o.variants.map((v) => v.id))
    if (o.selectedVariantIds.some((id) => !available.has(id))) {
      ctx.addIssue({ code: "custom", path: ["selectedVariantIds"], message: `มีค่าที่ไม่ใช่ของ ${o.name}` })
    }
    if (new Set(o.selectedVariantIds).size !== o.selectedVariantIds.length) {
      ctx.addIssue({ code: "custom", path: ["selectedVariantIds"], message: "เลือกค่าซ้ำ" })
    }
  })

const skuSchema = z
  .object({
    id: z.string().optional(),
    variantIds: z.array(z.string()),
    sku: z.string().trim().min(1, "กรอกรหัส SKU").max(64),
    price: z.string().trim().regex(MONEY, "รูปแบบราคาไม่ถูกต้อง"),
    compareAtPrice: z.union([z.string().trim().regex(MONEY, "รูปแบบราคาไม่ถูกต้อง"), z.literal("")]),
    stock: z.number({ error: "กรอกจำนวน" }).int().min(0, "ต้องไม่ติดลบ"),
    weightGrams: z.number().int().positive("ต้องมากกว่า 0").max(50_000).nullable(),
    status: z.enum(["ACTIVE", "INACTIVE"]),
  })
  .refine((s) => !s.compareAtPrice || Number(s.compareAtPrice) > Number(s.price), {
    path: ["compareAtPrice"],
    message: "ต้องมากกว่าราคาขาย",
  })

export const productSchema = z
  .object({
    name: z.string().trim().min(1, "กรุณากรอกชื่อสินค้า").max(200),
    slug: z
      .string()
      .trim()
      .min(1, "กรุณากรอก slug")
      .max(120)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "ใช้ได้เฉพาะ a-z, 0-9 และ - เท่านั้น"),
    description: z.string().trim().max(5000),
    status: z.enum(["ACTIVE", "INACTIVE"]),
    category: optionSchema.nullable(),
    tags: z.array(optionSchema),
    images: z
      .array(z.object({ url: z.string(), path: z.string() }))
      .max(MAX_IMAGES, `อัปโหลดได้ไม่เกิน ${MAX_IMAGES} รูป`),
    options: z.array(productOptionSchema).max(5, "เลือกได้ไม่เกิน 5 ตัวเลือก"),
    skus: z.array(skuSchema).min(1, "ต้องมีอย่างน้อย 1 SKU"),
  })
  .superRefine((v, ctx) => {
    // ตัวเลือกซ้ำ
    if (Helper.findDuplicateIndexes(v.options.map((o) => o.productVariantId)).length) {
      ctx.addIssue({ code: "custom", path: ["options"], message: "เลือกตัวเลือกซ้ำ" })
    }

    // จำนวน SKU เกิน
    const count = v.options.reduce((n, o) => n * o.selectedVariantIds.length, 1)
    if (count > MAX_SKUS) {
      ctx.addIssue({ code: "custom", path: ["options"], message: `ได้ ${count} SKU เกินกว่าที่รองรับ (${MAX_SKUS})` })
    }

    // SKU ต้องมีค่าครบทุกตัวเลือก ตัวเลือกละ 1 ค่า จากค่าที่เลือกไว้
    const selected = v.options.map((o) => new Set(o.selectedVariantIds))
    v.skus.forEach((s, index) => {
      const valid =
        s.variantIds.length === v.options.length &&
        selected.every((ids) => s.variantIds.filter((id) => ids.has(id)).length === 1)
      if (!valid) {
        ctx.addIssue({ code: "custom", path: ["skus", index, "variantIds"], message: "SKU ไม่ตรงกับตัวเลือกที่เลือก" })
      }
    })

    // คู่ค่าซ้ำ
    Helper.findDuplicateIndexes(v.skus.map((s) => [...s.variantIds].sort().join("|"))).forEach((index) => {
      ctx.addIssue({ code: "custom", path: ["skus", index, "variantIds"], message: "ตัวเลือกซ้ำกับ SKU อื่น" })
    })

    // รหัส SKU ซ้ำ
    Helper.findDuplicateIndexes(v.skus.map((s) => s.sku)).forEach((index) => {
      ctx.addIssue({ code: "custom", path: ["skus", index, "sku"], message: "รหัส SKU ซ้ำ" })
    })

    // สินค้าที่เปิดขายต้องมี SKU ที่เปิดขาย
    if (v.status === "ACTIVE" && !v.skus.some((s) => s.status === "ACTIVE")) {
      ctx.addIssue({ code: "custom", path: ["status"], message: "สินค้าที่เปิดขายต้องมี SKU ที่เปิดขายอย่างน้อย 1 รายการ" })
    }
  })

export type ProductFormValues = z.infer<typeof productSchema>
export type ProductOption = ProductFormValues["options"][number]
export type SkuRow = ProductFormValues["skus"][number]

export type ProductVariantOption = {
  id: string
  name: string
  variants: ProductOption["variants"]  // { id, name, colorHex }[] จาก schema
}
