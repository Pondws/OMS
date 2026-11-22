"use client"

import { memo, useEffect, useId, useMemo } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowLeft, Save, X } from "lucide-react"
import { arrayMove } from "@dnd-kit/sortable"

import { Textarea } from "@/components/ui/textarea"
import { Input, Button, Header, CardBody, Select, Autocomplete, ImageUpload, AutocompleteOption } from "components"
import { productApi, productCategoryApi, productTagApi, productVariantApi, uploadImageApi } from "apis"
import { ProductType } from "types"
import { handleError, Helper } from "utils"
import { STATUS } from "consts"
import { PRODUCT, MAX_IMAGES, DEFAULT_VALUES } from "./product.const"
import { productSchema, ProductVariantOption, type ProductFormValues, type ProductOption, type SkuRow } from "./product.schema"

import { cn } from "@/lib/utils"
import { skuColumns } from "./product.columns"
import { FormTable } from "../FormTable/FormTable"



// ─── SKU ────────────────────────────────────

// const comboKey = (ids: string[]) => [...ids].sort().join("|")

// const emptySku = (optionValueIds: string[]): SkuRow => ({
//   key: comboKey(optionValueIds),
//   optionValueIds,
//   sku: "",
//   price: "",
//   compareAtPrice: "",
//   stock: 0,
//   weightGrams: null,
//   status: "ACTIVE",
// })

/** ชุดค่าหนึ่งเป็นส่วนหนึ่งของอีกชุดหรือเปล่า เช่น [ดำ, M] อยู่ใน [ดำ, M, Cotton] */
// const isSubset = (a: string[], b: string[]) => a.every((id) => b.includes(id))

/**
 * สร้าง SKU ทุกชุดจากค่าที่เลือก
 * - ชุดค่าเดิมตรงกันพอดี → ใช้แถวเดิม (เรียงค่าตามลำดับตัวเลือกล่าสุด)
 * - เพิ่มหรือเอาตัวเลือกออก → คัดลอกราคาและน้ำหนักจากแถวเดิมที่ใกล้ที่สุด
 *   (ไม่คัดลอกรหัส SKU, สต็อก และ skuId เพราะเป็นสินค้าคนละชิ้นแล้ว)
 */
function buildSkus(options: ProductOption[], current: SkuRow[], prefix = ""): SkuRow[] {
  // 1. ใช้เฉพาะตัวเลือกที่เลือกค่าไว้แล้ว
  const active = options.filter((o) => o.selectedVariantIds.length > 0)

  // 2. สร้างทุกคู่ของค่า (cartesian product) เรียงตามลำดับใน variants
  const combos = active.reduce<{ id: string; name: string }[][]>(
    (acc, o) => {
      const values = o.variants.filter((v) => o.selectedVariantIds.includes(v.id))
      return acc.flatMap((combo) => values.map((v) => [...combo, v]))
    },
    [[]],
  )

  // เรียง id ก่อนต่อกัน เพื่อให้สลับลำดับตัวเลือกแล้วยังจับคู่ SKU เดิมได้
  const toKey = (ids: string[]) => [...ids].sort().join("|")
  const byKey = new Map(current.map((s) => [toKey(s.variantIds), s]))
  const claimed = new Set<SkuRow>() // SKU เดิมที่ถูกส่งต่อ id ไปแล้ว

  // 3. รอบแรก: จับคู่ที่ตรงกันพอดีก่อน
  const exact = combos.map((combo) => {
    const found = byKey.get(toKey(combo.map((v) => v.id)))
    if (found) claimed.add(found)
    return found
  })

  // 4. รอบสอง: สร้างแต่ละแถว
  return combos.map((combo, i) => {
    const variantIds = combo.map((v) => v.id)

    if (exact[i]) return { ...exact[i], variantIds }

    const sku = [prefix, ...combo.map((v) => v.name)]
      .filter(Boolean)
      .join("-")
      .replace(/\s+/g, "-")
      .toUpperCase()
      .slice(0, 64)

    const base: SkuRow = {
      variantIds,
      sku,
      price: "",
      compareAtPrice: "",
      stock: 0,
      weightGrams: null,
      status: "ACTIVE",
    }

    // SKU เดิมที่เกี่ยวข้อง: คู่ใหม่ครอบคู่เดิม (เพิ่มตัวเลือก) หรือคู่เดิมครอบคู่ใหม่ (ลบตัวเลือก)
    const isRelated = (s: SkuRow) => {
      const added = s.variantIds.every((id) => variantIds.includes(id))
      const removed = variantIds.every((id) => s.variantIds.includes(id))
      return added || removed
    }
    const related = current.find((s) => isRelated(s) && !claimed.has(s)) ?? current.find(isRelated)
    if (!related) return base

    const template = {
      price: related.price,
      compareAtPrice: related.compareAtPrice,
      weightGrams: related.weightGrams,
      status: related.status,
    }

    // SKU เดิมถูกส่งต่อไปแล้ว: คัดลอกแค่ราคาและการตั้งค่า
    if (claimed.has(related)) return { ...base, ...template }

    // ส่งต่อ id และสต็อกให้คู่แรกที่เกี่ยวข้อง
    claimed.add(related)
    return {
      ...base,
      ...template,
      ...(related.id && { id: related.id }),
      stock: related.stock
    }
  })
}

// const countCombos = (options: ProductOption[]) =>
//   options.filter((o) => o.selectedIds.length).reduce((n, o) => n * o.selectedIds.length, 1)

/** รหัส SKU จาก slug และชื่อค่า เช่น BASIC-COTTON-TEE-ดำ-M */
// function suggestSkuCode(slug: string, valueNames: string[]) {
//   const base = slug.toUpperCase() || "SKU"
//   const parts = valueNames.map((n) => n.toUpperCase().replace(/\s+/g, ""))
//   return [base, ...parts].filter(Boolean).join("-")
// }

/** slug จากชื่อสินค้า (a-z, 0-9 และ -) */
function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s-]+/g, "-")
    .replace(/^-|-$/g, "")
}

// ─── API ↔ ฟอร์ม ─────────────────────────────

/** ตัวเลือกสินค้า (พร้อมค่าทั้งหมด) → แถวตัวเลือกในฟอร์ม */
// function toProductOption(variant: ProductVariantType.ProductVariant, selectedIds: string[] = []): ProductOption {
//   return {
//     label: variant.name,
//     value: variant.id,
//     type: variant.type,
//     variants: Helper.sortBySortOrder(variant.options).map(({ id, name, colorHex }) => ({ id, name, colorHex })),
//     selectedIds,
//   }
// }

/** ข้อมูลสินค้าจาก API → ค่าในฟอร์ม */
const toFormValues = (product: ProductType.ProductDetail) => {
  return {
    name: product.name,
    slug: product.slug,
    description: product.description ?? "",
    status: product.status,
    category: { label: product.category.name, value: product.category.id },
    tags: product.tags.map((t) => ({ label: t.name, value: t.id })),
    images: product.images.map((img) => ({ url: img.url, path: "" })),
    // options,
    // skus: product.skus.map((s) => {
    //   // เรียงค่าตามลำดับตัวเลือก (สี แล้วไซส์) ให้ป้ายในตารางอ่านง่าย
    //   const ordered = options
    //     .map((o) => s.optionValueIds.find((vid) => o.variants.some((v) => v.id === vid)))
    //     .filter((vid): vid is string => !!vid)
    //   return {
    //     skuId: s.id,
    //     // key: comboKey(ordered),
    //     optionValueIds: ordered,
    //     sku: s.sku,
    //     price: s.price ?? "",
    //     compareAtPrice: s.compareAtPrice ?? "",
    //     stock: s.stock,
    //     weightGrams: s.weightGrams ?? null,
    //     status: s.status,
    //   }
    // }),
  }
}

/** ค่าในฟอร์ม → body ที่ส่งไป API */
const toPayload = (v: ProductFormValues) => {
  return {
    name: v.name,
    slug: v.slug,
    description: v.description || null,
    status: v.status,
    categoryId: v.category!.value,
    tagIds: v.tags.map((t) => t.value),
    options: v.options.map((o) => ({ productVariantId: o.productVariantId })),
    skus: v.skus.map((s) => ({
      // ...(s.skuId ? { id: s.skuId } : {}),
      sku: s.sku,
      price: s.price,
      compareAtPrice: s.compareAtPrice || null,
      stock: s.stock,
      weightGrams: s.weightGrams,
      status: s.status,
      variantIds: s.variantIds,
    })),
    images: v.images.map((img) => ({ url: img.url, alt: null, optionValueId: null })),
  }
}

// ─── เรียก API ───────────────────────────────

// const fetchOption = async (productVariantId: string, selectedIds: string[] = []) =>
//   toProductOption(await productVariantApi.getByID(productVariantId), selectedIds)

// async function loadProduct(id: string): Promise<ProductFormValues> {
//   const product = await productApi.getByID(id)
//   // API ส่งมาแค่ค่าที่สินค้าใช้ ต้องดึงค่าทั้งหมดของแต่ละตัวเลือกเพื่อให้เลือกเพิ่มได้
//   const options = await Promise.all(
//     product.options.map((o) => fetchOption(o.productVariantId, o.values.map((v) => v.id))),
//   )
//   return toFormValues(product, options)
// }

const loadProduct = async (id: string) => {
  const product = await productApi.getByID(id)
  // const options = product.options.map((o) => ({
  //   productVariantId: o.productVariant.id,
  //   name: o.productVariant.name,
  //   variants: o.productVariant.variants.map(({ id, name, colorHex }) => ({ id, name, colorHex })),
  //   selectedVariantIds: o.values.map((v) => v.variantId),
  // }))
  return toFormValues(product)
}

type StatusPath = "status" | `skus.${number}.status`

// ─── Form ───────────────────────────────────

function ProductFormComp({ id }: { id?: string }) {
  const isEdit = !!id
  const formId = useId()
  const descId = useId()
  const router = useRouter()
  const queryClient = useQueryClient()
  // const [bulkPrice, setBulkPrice] = useState("")
  // const [bulkStock, setBulkStock] = useState("")
  const dirty = { shouldDirty: true, shouldValidate: true }

  const {
    control,
    register,
    handleSubmit,
    setValue,
    getValues,
    getFieldState,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: DEFAULT_VALUES,
  })

  // const value = useWatch({ control })
  const name = useWatch({ control, name: "name" })
  const images = useWatch({ control, name: "images" })
  const options = useWatch({ control, name: "options" })
  const skus = useWatch({ control, name: "skus" })
  // fields ไม่เปลี่ยนตอนพิมพ์ในตาราง ฟอร์มจึงไม่ re-render ทั้งหน้า
  const { fields: skuFields } = useFieldArray({ control, name: "skus" })

  // const valueName = new Map(options.flatMap((o) => o.variants.map((v) => [v.id, v.name] as const)))
  // const hasOptions = skuFields.some((f) => f.optionValueIds.length > 0)
  const skusError = errors.skus?.root?.message ?? errors.skus?.message

  // ─── โหลด / บันทึก ──
  const { data } = useQuery({
    queryKey: PRODUCT.queryKey.detail(id ?? ""),
    queryFn: () => loadProduct(id!),
    enabled: isEdit,
  })

  useEffect(() => {
    if (data) reset(data)
  }, [data, reset])

  const backToList = () => router.push(PRODUCT.path())

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: ProductType.ProductForm) =>
      isEdit ? productApi.update(id!, payload) : productApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT.queryKey.all })
      toast.success("บันทึกข้อมูลสำเร็จ")
      backToList()
    },
    onError: (error) => toast.error(handleError(error)),
  })

  const columns = useMemo(
    () => skuColumns({ control, register, errors, options, disabled: isPending }),
    [control, register, errors, options, isPending],
  )

  const onSubmit = (values: ProductFormValues) => mutate(toPayload(values))

  // ─── slug ──

  // สร้าง slug จากชื่อ จนกว่าผู้ใช้จะแก้ slug เอง (เฉพาะตอนสร้าง)
  useEffect(() => {
    if (isEdit || getFieldState("slug").isDirty) return
    setValue("slug", slugify(name))
  }, [name, isEdit, getFieldState, setValue])

  // ─── รูป ──

  const handleUploadImages = async (files: File[]) => {
    const remaining = MAX_IMAGES - getValues("images").length
    if (remaining <= 0) return toast.error(`อัปโหลดได้ไม่เกิน ${MAX_IMAGES} รูป`)
    try {
      const uploaded = await uploadImageApi("products", files.slice(0, remaining))
      setValue("images", [...getValues("images"), ...uploaded], dirty)
    } catch (error) {
      toast.error(handleError(error))
    }
  }

  const handleRemoveImage = (index: number) => {
    setValue("images", getValues("images").filter((_, i) => i !== index), dirty)
  }

  const handleReorderImages = (from: number, to: number) => {
    setValue("images", arrayMove(getValues("images"), from, to), dirty)
  }

  // ─── ตัวเลือก ──

  const applyOptions = (option: ProductOption[]) => {
    const currentSkus = getValues("skus")
    const nextSkus = buildSkus(option, currentSkus)

    setValue("options", option, dirty)
    setValue("skus", nextSkus, { shouldDirty: true })
  }

  const handleOptionsChange = (selected: AutocompleteOption<ProductVariantOption>[]) => {
    const currentOptions = getValues("options")
    // option ที่เลือกไว้แล้วใช้ข้อมูลเดิม (ค่าที่ติ๊กและโหมดรูปไม่หาย) ตัวใหม่แปลงจาก autocomplete
    applyOptions(
      selected.map((s) => currentOptions.find((o) => o.productVariantId === s.value) ?? {
        productVariantId: s.value,
        name: s.label,
        variants: s.data?.variants ?? [],
        selectedVariantIds: [],
      })
    )
  }


  // const toggleValue = (optionIndex: number, variantId: string) => {
  //   applyOptions(
  //     getValues("options").map((opt, i) => {
  //       if (i !== optionIndex) return opt
  //       const on = opt.selectedIds.includes(variantId)
  //       return {
  //         ...opt,
  //         // เรียงตามลำดับของตัวเลือก ไม่ใช่ตามลำดับที่กด
  //         selectedIds: opt.variants
  //           .map((v) => v.id)
  //           .filter((vid) => (vid === variantId ? !on : opt.selectedIds.includes(vid))),
  //       }
  //     }),
  //   )
  // }

  // ─── SKU ──

  // const applyToAllSkus = () => {
  //   skuFields.forEach((_, i) => {
  //     if (bulkPrice) setValue(`skus.${i}.price`, bulkPrice, dirty)
  //     if (bulkStock) setValue(`skus.${i}.stock`, Number(bulkStock), dirty)
  //   })
  // }

  // const fillSkuCodes = () => {
  //   const slug = getValues("slug")
  //   getValues("skus").forEach((s, i) => {
  //     if (s.sku) return
  //     const names = s.optionValueIds.map((vid) => valueName.get(vid) ?? "")
  //     setValue(`skus.${i}.sku`, suggestSkuCode(slug, names), dirty)
  //   })
  // }

  // ─── ใช้ร่วมกัน ──

  const renderStatus = (fieldName: StatusPath) => (
    <Controller
      control={control}
      name={fieldName}
      render={({ field }) => (
        <Select
          className={Helper.handleColorStatus(field.value)}
          options={STATUS}
          value={field.value}
          onChange={(value) => {
            if (value === "ACTIVE" || value === "INACTIVE") field.onChange(value)
          }}
        />
      )}
    />
  )

  // ─── UI ──

  return (
    <div className="p-4">
      <Header
        routes={[
          { name: PRODUCT.name, path: PRODUCT.path() },
          { name: PRODUCT.text(isEdit ? "update" : "create"), path: "" },
        ]}
        title={PRODUCT.text(isEdit ? "update" : "create")}
        actionButton={
          <>
            <Button type="button" onClick={backToList} size="lg" className="px-8" variant="outline">
              <ArrowLeft />
              กลับ
            </Button>
            <Button type="submit" form={formId} size="lg" className="px-8" disabled={isPending || (isEdit && !isDirty)}>
              <Save />
              {isPending ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
          </>
        }
      />

      <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* ─── ข้อมูลสินค้า ─── */}
        <CardBody title="ข้อมูลสินค้า" action={renderStatus("status")}>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              {...register("name")}
              required
              label="ชื่อสินค้า"
              placeholder="กรุณากรอกชื่อสินค้า"
              helperText={errors.name?.message}
              error={!!errors.name}
            />

            <Input
              {...register("slug")}
              required
              label="Slug"
              placeholder="เช่น basic-cotton-tee"
              helperText={errors.slug?.message ?? "ใช้ใน URL ของหน้าสินค้า สร้างจากชื่อให้อัตโนมัติ"}
              error={!!errors.slug}
            />

            <div className="flex flex-col gap-2 md:col-span-2">
              <label htmlFor={descId} className="text-sm font-medium">
                รายละเอียดสินค้า <span className="font-normal text-muted-foreground">(ไม่บังคับ)</span>
              </label>
              <Textarea id={descId} rows={5} placeholder="กรอกรายละเอียดสินค้า" {...register("description")} />
              {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
            </div>
          </div>
        </CardBody>

        {/* ─── จัดหมวดหมู่ ─── */}
        <CardBody title="จัดหมวดหมู่">
          <div className="grid gap-4 md:grid-cols-2">
            <Controller
              control={control}
              name="category"
              render={({ field, fieldState }) => (
                <Autocomplete
                  label="หมวดหมู่สินค้า"
                  placeholder="เลือกหมวดหมู่สินค้า"
                  options={(search) => productCategoryApi.getOptions({ search })}
                  value={field.value}
                  onChange={field.onChange}
                  clearable
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="tags"
              render={({ field, fieldState }) => (
                <Autocomplete
                  multiple
                  label="แท็กสินค้า"
                  placeholder="เลือกแท็กสินค้า"
                  options={(search) => productTagApi.getOptions({ search })}
                  value={field.value}
                  onChange={field.onChange}
                  clearable
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </div>
        </CardBody>

        {/* ─── รูปภาพ ─── */}
        <CardBody title={`รูปภาพ (${images.length}/${MAX_IMAGES})`}>
          <ImageUpload
            placeholder="อัปโหลดรูป"
            value={images}
            error={!!errors.images}
            helperText={errors.images?.message}
            multiple
            disabled={isPending || images.length >= MAX_IMAGES}
            onSelect={handleUploadImages}
            onRemove={handleRemoveImage}
            onReorder={handleReorderImages}
            primaryBadge="รูปหลัก"
          />
        </CardBody>

        {/* ─── ตัวเลือกสินค้า ─── */}
        <CardBody title="ตัวเลือกสินค้า">
          <div className="space-y-4">
            <Autocomplete
              label="ตัวเลือกสินค้า"
              placeholder="เลือกตัวเลือกสินค้า เช่น สี ไซส์ (ไม่บังคับ)"
              options={(search) => productVariantApi.getOptions({ search })}
              value={options?.map(({ productVariantId, name }) => ({ value: productVariantId, label: name }))}
              onChange={handleOptionsChange}
              multiple
              clearable
              disabled={isPending}
              error={!!errors.options?.message}
              helperText={errors.options?.message}
            />

            {options?.length > 0 && (
              <div className="space-y-3">
                {options.map((option, index) => {
                  const selected = new Set(option.selectedVariantIds)
                  const allSelected = selected.size === option.variants.length
                  const error = errors.options?.[index]?.selectedVariantIds?.message

                  return (
                    <div key={option?.productVariantId} className="space-y-3 rounded-lg border p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-medium">{option.name}</h4>
                        <span className="text-xs text-muted-foreground tabular-nums">
                          เลือก {selected.size}/{option.variants.length}
                        </span>
                        <div className="ml-auto flex gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={isPending}
                            onClick={() =>
                              applyOptions(
                                options.map((o, i) =>
                                  i === index
                                    ? { ...o, selectedVariantIds: allSelected ? [] : o.variants.map((x) => x.id) }
                                    : o,
                                ),
                              )
                            }
                          >
                            {allSelected ? "ล้างที่เลือก" : "เลือกทั้งหมด"}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-destructive"
                            disabled={isPending}
                            onClick={() => applyOptions(options.filter((_, i) => i !== index))}
                          >
                            <X className="size-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {option.variants.map((v) => {
                          const checked = selected.has(v.id)
                          return (
                            <button
                              key={v.id}
                              type="button"
                              aria-pressed={checked}
                              disabled={isPending}
                              onClick={() =>
                                applyOptions(
                                  options.map((o, i) =>
                                    i !== index
                                      ? o
                                      : {
                                        ...o,
                                        // กรองจาก variants เพื่อให้ลำดับตรงกับ sortOrder เสมอ
                                        selectedVariantIds: o.variants
                                          .filter((x) => (x.id === v.id ? !checked : selected.has(x.id)))
                                          .map((x) => x.id),
                                      },
                                  ),
                                )
                              }
                              className={cn(
                                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
                                checked
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "text-muted-foreground hover:bg-muted",
                              )}
                            >
                              {v.colorHex && (
                                <span className="size-3 rounded-full border" style={{ backgroundColor: v.colorHex }} />
                              )}
                              {v.name}
                            </button>
                          )
                        })}
                      </div>

                      {error ? (
                        <p className="text-sm text-destructive">{error}</p>
                      ) : (
                        selected.size === 0 && (
                          <p className="text-sm text-muted-foreground">เลือกอย่างน้อย 1 ค่า</p>
                        )
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </CardBody>

        {/* ─── SKU ─── */}
        <CardBody title={`SKU (${skuFields.length} รายการ)`}>
          <div className="space-y-3">
            {/* {options.length > 0 && (
              <p className="text-sm text-muted-foreground">
                สร้างจากตัวเลือกที่เลือกไว้ ({options.map((o) => `${o.label} ${o.selectedIds.length}`).join(" × ")})
                ควรเลือกตัวเลือกให้ครบก่อนกรอกรหัส SKU และสต็อก
              </p>
            )} */}

            {/* <div className="flex flex-wrap items-end gap-2 rounded-md bg-muted/50 p-3">
              <Input
                className="w-36"
                aria-label="ราคาทุกแถว"
                placeholder="ราคาทุกแถว"
                inputMode="decimal"
                value={bulkPrice}
                onChange={(e) => setBulkPrice(e.target.value)}
              />
              <Input
                className="w-36"
                aria-label="สต็อกทุกแถว"
                placeholder="สต็อกทุกแถว"
                type="number"
                min={0}
                value={bulkStock}
                onChange={(e) => setBulkStock(e.target.value)}
              />
              <Button type="button" variant="secondary" onClick={applyToAllSkus} disabled={!bulkPrice && !bulkStock}>
                ใช้กับทุกแถว
              </Button>
              <Button type="button" variant="ghost" className="ml-auto" onClick={fillSkuCodes}>
                <Wand2 />
                สร้างรหัส SKU ที่ยังว่าง
              </Button>
            </div> */}

            <FormTable
              columns={columns}
              data={skuFields}
              getRowId={(row) => row.id}
              rowClassName={(_, i) => (skus[i]?.status === "INACTIVE" ? "opacity-60" : undefined)}
              emptyText="เลือกตัวเลือกและค่าก่อน แล้ว SKU จะถูกสร้างให้อัตโนมัติ"
            />

            {skusError && <p className="text-sm text-destructive">{skusError}</p>}
          </div>
        </CardBody>
      </form>
    </div>
  )
}

export const ProductForm = memo(ProductFormComp)