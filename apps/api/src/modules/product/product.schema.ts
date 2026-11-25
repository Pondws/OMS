import { z } from "zod";

const statusSchema = z.enum(["ACTIVE", "INACTIVE"]);
const moneySchema = z.string().regex(/^\d{1,10}(\.\d{1,2})?$/, "รูปแบบราคาไม่ถูกต้อง");
const cmSchema = z.number().positive().max(99_999).nullable().optional();
const MAX_IMAGES = 5

const imageSchema = z.object({
  url: z.url().max(2048),   // TODO: ตอนทำ Supabase เพิ่ม .refine(isProductImageUrl, "รูปไม่ถูกต้อง")
  alt: z.string().trim().max(200).nullable().optional(),
  sortOrder: z.number().int().min(0).max(MAX_IMAGES - 1),
})

const imageList = (min: number) =>
  z
    .array(imageSchema)
    .min(min, "ต้องมีรูปอย่างน้อย 1 รูป")
    .max(MAX_IMAGES, `อัปโหลดได้ไม่เกิน ${MAX_IMAGES} รูป`)
    .refine((imgs) => new Set(imgs.map((i) => i.sortOrder)).size === imgs.length, "ลำดับรูปซ้ำกัน")

const optionSchema = z
  .object({
    productVariantId: z.uuid(),
    showImage: z.boolean().default(false),
    variantIds: z.array(z.uuid()).min(1, "เลือกอย่างน้อย 1 ค่า").max(50),
  })
  .refine((o) => new Set(o.variantIds).size === o.variantIds.length, {
    path: ["variantIds"],
    message: "ค่าซ้ำกัน",
  })

const imageGroupSchema = z.object({
  variantIds: z.array(z.uuid()).min(1).max(3),
  images: imageList(0),
})

const skuSchema = z
  .object({
    sku: z.string().trim().min(1, "กรอกรหัส SKU").max(64),
    price: moneySchema,
    compareAtPrice: moneySchema.nullable().optional(),
    initialStock: z.number().int().min(0, "สต็อกต้องไม่ติดลบ"),
    status: statusSchema.default("ACTIVE"),
    weightGrams: z.number().int().positive().max(50_000).nullable().optional(),
    lengthCm: cmSchema,
    widthCm: cmSchema,
    heightCm: cmSchema,
    variantIds: z.array(z.uuid()).max(3).default([]),              // ← เดิม optionValueIds
  })
  .refine((s) => !s.compareAtPrice || Number(s.compareAtPrice) > Number(s.price), {
    path: ["compareAtPrice"],
    message: "ราคาก่อนลดต้องมากกว่าราคาขาย",
  })

export const productBodySchema = z
  .object({
    name: z.string().trim().min(1, "กรุณากรอกชื่อสินค้า").max(200),
    slug: z
      .string()
      .trim()
      .min(1, "กรุณากรอก slug")
      .max(120)
      .regex(/^[a-z0-9ก-๙]+(?:-[a-z0-9ก-๙]+)*$/, "ใช้ได้เฉพาะ a-z, 0-9, ภาษาไทย และขีด (-)"),
    description: z.string().max(5000).nullable().optional(),
    status: statusSchema.default("ACTIVE"),
    categoryId: z.uuid("เลือกหมวดหมู่"),
    tagIds: z.array(z.uuid()).max(50).default([]).transform((ids) => [...new Set(ids)]),
    options: z.array(optionSchema).max(3, "ตัวเลือกได้ไม่เกิน 3 ตัว").default([]),
    skus: z.array(skuSchema).min(1, "ต้องมีอย่างน้อย 1 SKU").max(200),
    images: imageList(1),
    imageGroups: z.array(imageGroupSchema).default([]),
  })
  .superRefine((v, ctx) => {
    const issue = (path: (string | number)[], message: string) =>
      ctx.addIssue({ code: "custom", path, message })

    // ── ตัวเลือก ──
    const typeIds = v.options.map((o) => o.productVariantId)
    if (new Set(typeIds).size !== typeIds.length) issue(["options"], "ใส่ตัวเลือกเดียวกันซ้ำไม่ได้")

    // ค่า → index ของตัวเลือกที่ค่านั้นอยู่ เช่น "ดำ" → 0 (สี), "M" → 1 (ไซส์)
    const optionOf = new Map<string, number>()
    v.options.forEach((o, oi) =>
      o.variantIds.forEach((id) => {
        if (optionOf.has(id)) issue(["options", oi, "variantIds"], "ค่าเดียวกันอยู่ในหลายตัวเลือก")
        optionOf.set(id, oi)
      }),
    )

    // ── SKU ──
    if (v.options.length === 0 && v.skus.length !== 1) {
      issue(["skus"], "สินค้าที่ไม่มีตัวเลือกต้องมี SKU เดียว")
    }

    const codes = new Set<string>()
    const combos = new Set<string>()
    v.skus.forEach((s, i) => {
      const code = s.sku.toUpperCase()
      if (codes.has(code)) issue(["skus", i, "sku"], "รหัส SKU ซ้ำ")
      codes.add(code)

      const opts = s.variantIds.map((id) => optionOf.get(id))
      if (opts.some((o) => o === undefined)) {
        issue(["skus", i, "variantIds"], "มีค่าที่ไม่ได้เลือกไว้ในตัวเลือก")
      } else if (s.variantIds.length !== v.options.length || new Set(opts).size !== v.options.length) {
        issue(["skus", i, "variantIds"], "ต้องเลือกตัวเลือกละ 1 ค่า")
      }

      const combo = [...s.variantIds].sort().join("|")
      if (combos.has(combo)) issue(["skus", i, "variantIds"], "ชุดตัวเลือกซ้ำกับ SKU อื่น")
      combos.add(combo)
    })

    // ── กลุ่มรูป ──
    const imageOptions = v.options.flatMap((o, i) => (o.showImage ? [i] : []))
    if (v.imageGroups.length > 0 && imageOptions.length === 0) {
      issue(["imageGroups"], 'ต้องติ๊ก "ใช้รูปตามตัวเลือกนี้" อย่างน้อย 1 ตัวเลือก')
    }

    const groupCombos = new Set<string>()
    v.imageGroups.forEach((g, gi) => {
      const opts = g.variantIds.map((id) => optionOf.get(id))
      const valid =
        g.variantIds.length === imageOptions.length &&
        opts.every((o) => o !== undefined && v.options[o].showImage) &&
        new Set(opts).size === imageOptions.length
      if (!valid) {
        issue(["imageGroups", gi, "variantIds"], "กลุ่มรูปต้องมีค่าจากตัวเลือกที่ใช้รูป ตัวเลือกละ 1 ค่า")
      }

      const combo = [...g.variantIds].sort().join("|")
      if (groupCombos.has(combo)) issue(["imageGroups", gi, "variantIds"], "กลุ่มรูปซ้ำกัน")
      groupCombos.add(combo)

      if (!v.skus.some((s) => g.variantIds.every((id) => s.variantIds.includes(id)))) {
        issue(["imageGroups", gi, "variantIds"], "ไม่มี SKU ของชุดตัวเลือกนี้")
      }
    })

    const urls = [...v.images, ...v.imageGroups.flatMap((g) => g.images)].map((i) => i.url)
    if (new Set(urls).size !== urls.length) issue(["images"], "ใช้รูปเดียวกันซ้ำ")
  })

export type ProductBody = z.infer<typeof productBodySchema>
