import { z } from "zod";

const statusSchema = z.enum(["ACTIVE", "INACTIVE"]);
const moneySchema = z.string().regex(/^\d{1,10}(\.\d{1,2})?$/, "รูปแบบราคาไม่ถูกต้อง");
const cmSchema = z.number().positive().max(99_999).nullable().optional();

const skuSchema = z
  .object({
    sku: z.string().trim().min(1, "กรอกรหัส SKU").max(64),
    price: moneySchema,
    compareAtPrice: moneySchema.nullable().optional(),
    stock: z.number().int().min(0, "สต็อกต้องไม่ติดลบ"),
    status: statusSchema.default("ACTIVE"),
    weightGrams: z.number().int().positive().max(50_000).nullable().optional(),
    lengthCm: cmSchema,
    widthCm: cmSchema,
    heightCm: cmSchema,
    optionValueIds: z.array(z.uuid()).max(10).default([]),
  })
  .refine((s) => !s.compareAtPrice || Number(s.compareAtPrice) > Number(s.price), {
    path: ["compareAtPrice"],
    message: "ราคาก่อนลดต้องมากกว่าราคาขาย",
  });

const imageSchema = z.object({
  url: z.url().max(2048),
  alt: z.string().trim().max(200).nullable().optional(),
  optionValueId: z.uuid().nullable().optional(),
});

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
    tagIds: z.array(z.uuid()).max(50).default([]),
    options: z.array(z.object({ productVariantId: z.uuid() })).max(5).default([]),
    skus: z.array(skuSchema).min(1, "ต้องมีอย่างน้อย 1 SKU").max(200),
    images: z.array(imageSchema).max(30).default([]),
  })
  .superRefine((v, ctx) => {
    const typeIds = v.options.map((o) => o.productVariantId);
    if (new Set(typeIds).size !== typeIds.length) {
      ctx.addIssue({ code: "custom", path: ["options"], message: "ใส่ตัวเลือกเดียวกันซ้ำไม่ได้" });
    }

    const codes = new Set<string>();
    const combos = new Set<string>();
    v.skus.forEach((s, i) => {
      const code = s.sku.toUpperCase();
      if (codes.has(code)) ctx.addIssue({ code: "custom", path: ["skus", i, "sku"], message: "รหัส SKU ซ้ำ" });
      codes.add(code);

      if (s.optionValueIds.length !== typeIds.length) {
        ctx.addIssue({
          code: "custom",
          path: ["skus", i, "optionValueIds"],
          message: `ต้องมีค่าตัวเลือก ${typeIds.length} ค่า`,
        });
      }

      const combo = [...s.optionValueIds].sort().join("|");
      if (combos.has(combo)) {
        ctx.addIssue({ code: "custom", path: ["skus", i, "optionValueIds"], message: "ชุดตัวเลือกซ้ำกับ SKU อื่น" });
      }
      combos.add(combo);
    });
  });

export type ProductBody = z.infer<typeof productBodySchema>