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
import {
  productSchema,
  ProductVariantOption,
  type ProductFormValues,
  type ProductOption,
  type ProductImage,
  type ImageGroup,
  type SkuRow,
} from "./product.schema"

import { cn } from "@/lib/utils"
import { skuColumns } from "./product.columns"
import { FormTable } from "../FormTable/FormTable"

// ─── กลุ่มรูป ───────────────────────────────

/** ชุดค่าสองชุดเหมือนกันไหม โดยไม่สนลำดับ */
const sameIds = (a: string[], b: string[]) =>
  a.length === b.length && a.every((id) => b.includes(id))

/** ทุกชุดของค่าที่เลือก เรียงตามลำดับใน variants */
const cartesian = (options: ProductOption[]) =>
  options.reduce<string[][]>(
    (acc, o) => {
      const ids = o.variants.filter((v) => o.selectedVariantIds.includes(v.id)).map((v) => v.id)
      return acc.flatMap((combo) => ids.map((id) => [...combo, id]))
    },
    [[]],
  )

/** กลุ่มรูป = ทุกชุดค่าของตัวเลือกที่ติ๊ก "ใช้รูปตามตัวเลือกนี้" กลุ่มที่มีอยู่แล้วใช้รูปเดิมต่อ */
function buildImageGroups(options: ProductOption[], current: ImageGroup[]): ImageGroup[] {
  const imageOptions = options.filter((o) => o.showImage && o.selectedVariantIds.length > 0)
  if (imageOptions.length === 0) return []

  return cartesian(imageOptions).map((variantIds) => {
    const existing = current.find((g) => sameIds(g.variantIds, variantIds))
    return existing ?? { variantIds, images: [] }
  })
}

// ─── SKU ────────────────────────────────────

/**
 * สร้าง SKU ทุกชุดจากค่าที่เลือก
 * - ชุดค่าตรงกับแถวเดิมพอดี → ใช้แถวเดิม
 * - เพิ่มหรือเอาตัวเลือกออก → คัดลอกราคาและการตั้งค่าจากแถวเดิมที่เกี่ยวข้อง
 */
function buildSkus(options: ProductOption[], current: SkuRow[]): SkuRow[] {
  const active = options.filter((o) => o.selectedVariantIds.length > 0)

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

  // รอบแรก: จับคู่ที่ตรงกันพอดีก่อน
  const exact = combos.map((combo) => {
    const found = byKey.get(toKey(combo.map((v) => v.id)))
    if (found) claimed.add(found)
    return found
  })

  // รอบสอง: สร้างแต่ละแถว
  return combos.map((combo, i) => {
    const variantIds = combo.map((v) => v.id)
    if (exact[i]) return { ...exact[i], variantIds }

    const base: SkuRow = {
      variantIds,
      sku: combo
        .map((v) => v.name)
        .join("-")
        .replace(/\s+/g, "-")
        .toUpperCase()
        .slice(0, 64),
      price: "",
      compareAtPrice: "",
      stock: 0,
      weightGrams: null,
      status: "ACTIVE",
    }

    // SKU เดิมที่เกี่ยวข้อง: ชุดใหม่ครอบชุดเดิม (เพิ่มตัวเลือก) หรือชุดเดิมครอบชุดใหม่ (ลบตัวเลือก)
    const isRelated = (s: SkuRow) =>
      s.variantIds.every((id) => variantIds.includes(id)) || variantIds.every((id) => s.variantIds.includes(id))
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

    // ส่งต่อ id และสต็อกให้ชุดแรกที่เกี่ยวข้อง
    claimed.add(related)
    return { ...base, ...template, ...(related.id && { id: related.id }), stock: related.stock }
  })
}

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

/** ข้อมูลสินค้าจาก API → ค่าในฟอร์ม */
// TODO: ทำตอน get by id (options, imageGroups, skus)
const toFormValues = (product: ProductType.ProductDetail) => ({
  name: product.name,
  slug: product.slug,
  description: product.description ?? "",
  status: product.status,
  category: { label: product.category.name, value: product.category.id },
  tags: product.tags.map((t) => ({ label: t.name, value: t.id })),
  images: product.images.map((img) => ({ url: img.url })),
})

const loadProduct = async (id: string) => toFormValues(await productApi.getByID(id))

/** รูปในฟอร์ม → รูปที่ส่งไป API โดยใช้ลำดับใน array เป็น sortOrder (0 = รูปแรก) */
const toImagesPayload = (images: ProductImage[]) =>
  images.map((img, sortOrder) => ({ url: img.url, alt: null, sortOrder }))

/** ค่าในฟอร์ม → body ที่ส่งไป API */
const toPayload = (v: ProductFormValues): ProductType.ProductForm => ({
  name: v.name,
  slug: v.slug,
  description: v.description || null,
  status: v.status,
  categoryId: v.category!.value,
  tagIds: v.tags.map((t) => t.value),
  images: toImagesPayload(v.images),
  options: v.options.map((o) => ({
    productVariantId: o.productVariantId,
    showImage: o.showImage,
    variantIds: o.selectedVariantIds,
  })),
  // กลุ่มที่ไม่มีรูปไม่ต้องส่ง หน้าร้านจะใช้รูปหลักแทน
  imageGroups: v.imageGroups
    .filter((g) => g.images.length > 0)
    .map((g) => ({ variantIds: g.variantIds, images: toImagesPayload(g.images) })),
  skus: v.skus.map((s) => ({
    variantIds: s.variantIds,
    sku: s.sku,
    price: s.price,
    compareAtPrice: s.compareAtPrice || null,
    initialStock: s.stock,
    weightGrams: s.weightGrams,
    status: s.status,
  })),
})

type StatusPath = "status" | `skus.${number}.status`
type ImagePath = "images" | `imageGroups.${number}.images`

// ─── Form ───────────────────────────────────

function ProductFormComp({ id }: { id?: string }) {
  const isEdit = !!id
  const formId = useId()
  const descId = useId()
  const router = useRouter()
  const queryClient = useQueryClient()
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

  const name = useWatch({ control, name: "name" })
  const images = useWatch({ control, name: "images" })
  const options = useWatch({ control, name: "options" })
  const imageGroups = useWatch({ control, name: "imageGroups" })
  const skus = useWatch({ control, name: "skus" })
  // fields ไม่เปลี่ยนตอนพิมพ์ในตาราง ฟอร์มจึงไม่ re-render ทั้งหน้า
  const { fields: skuFields } = useFieldArray({ control, name: "skus" })

  // id → { name, colorHex } ใช้แสดงป้ายของแต่ละกลุ่มรูป
  const variantById = useMemo(
    () => new Map(options.flatMap((o) => o.variants.map((v) => [v.id, v] as const))),
    [options],
  )
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

  /** หาที่เก็บรูปของกลุ่มจากชุดค่า เช่น [ดำ] → "imageGroups.0.images" ถ้าไม่เจอกลุ่มนั้นคืน null */
  const groupPath = (variantIds: string[]): ImagePath | null => {
    const i = getValues("imageGroups").findIndex((g) => sameIds(g.variantIds, variantIds))
    return i < 0 ? null : `imageGroups.${i}.images`
  }

  const uploadImages = async (getPath: () => ImagePath | null, files: File[]) => {
    const before = getPath()
    if (!before) return

    const remaining = MAX_IMAGES - getValues(before).length
    if (remaining <= 0) return toast.error(`อัปโหลดได้ไม่เกิน ${MAX_IMAGES} รูป`)
    if (files.length > remaining) toast.warning(`เพิ่มได้อีก ${remaining} รูป รูปที่เกินจะไม่ถูกอัปโหลด`)

    try {
      const uploaded = await uploadImageApi("products", files.slice(0, remaining))

      // หาที่เก็บใหม่อีกรอบ เพราะระหว่างรออัปโหลด ผู้ใช้อาจแก้ตัวเลือกจนลำดับกลุ่มเปลี่ยน
      const path = getPath()
      if (!path) return toast.error("ตัวเลือกถูกเปลี่ยนระหว่างอัปโหลด กรุณาอัปโหลดใหม่")

      setValue(path, [...getValues(path), ...uploaded].slice(0, MAX_IMAGES), dirty)
    } catch (error) {
      toast.error(handleError(error))
    }
  }

  const removeImage = (path: ImagePath, index: number) => {
    setValue(path, getValues(path).filter((_, i) => i !== index), dirty)
  }

  const reorderImages = (path: ImagePath, from: number, to: number) => {
    setValue(path, arrayMove(getValues(path), from, to), dirty)
  }

  // ─── ตัวเลือก ──

  const applyOptions = (next: ProductOption[]) => {
    setValue("options", next, dirty)
    setValue("skus", buildSkus(next, getValues("skus")), { shouldDirty: true })
    setValue("imageGroups", buildImageGroups(next, getValues("imageGroups")), { shouldDirty: true })
  }

  const handleOptionsChange = (selected: AutocompleteOption<ProductVariantOption>[]) => {
    const currentOptions = getValues("options")
    // ตัวเลือกที่มีอยู่แล้วใช้ข้อมูลเดิม (ค่าที่เลือกและ showImage ไม่หาย) ตัวใหม่แปลงจาก autocomplete
    applyOptions(
      selected.map(
        (s) =>
          currentOptions.find((o) => o.productVariantId === s.value) ?? {
            productVariantId: s.value,
            name: s.label,
            variants: s.data?.variants ?? [],
            selectedVariantIds: [],
            showImage: false,
          },
      ),
    )
  }

  const toggleShowImage = (index: number) => {
    // ถ้าอัปโหลดรูปตามตัวเลือกไว้แล้ว ให้ถามยืนยันก่อน เพราะรูปจะหายทั้งหมด
    const hasImages = getValues("imageGroups").some((g) => g.images.length > 0)
    if (hasImages && !window.confirm("รูปตามตัวเลือกที่อัปโหลดไว้จะถูกล้างทั้งหมด ต้องการทำต่อไหม?")) return

    const next = getValues("options").map((o, i) => (i === index ? { ...o, showImage: !o.showImage } : o))
    setValue("options", next, dirty)
    // ชุดของตัวเลือกที่มีผลต่อรูปเปลี่ยน กลุ่มเดิมจึงใช้ไม่ได้แล้ว
    setValue("imageGroups", buildImageGroups(next, []), { shouldDirty: true })
  }

  const toggleValue = (index: number, variantId: string) => {
    applyOptions(
      options.map((o, i) => {
        if (i !== index) return o
        const on = o.selectedVariantIds.includes(variantId)
        return {
          ...o,
          // กรองจาก variants เพื่อให้ลำดับตรงกับ sortOrder เสมอ
          selectedVariantIds: o.variants
            .filter((x) => (x.id === variantId ? !on : o.selectedVariantIds.includes(x.id)))
            .map((x) => x.id),
        }
      }),
    )
  }

  const toggleAllValues = (index: number, selectAll: boolean) => {
    applyOptions(
      options.map((o, i) =>
        i === index ? { ...o, selectedVariantIds: selectAll ? o.variants.map((x) => x.id) : [] } : o,
      ),
    )
  }

  const removeOption = (index: number) => applyOptions(options.filter((_, i) => i !== index))

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
            <Button
              type="submit"
              form={formId}
              size="lg"
              className="px-8"
              disabled={isPending || (isEdit && !isDirty)}
            >
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

        {/* ─── รูปหลัก ─── */}
        <CardBody title={`รูปภาพ (${images.length}/${MAX_IMAGES})`}>
          <ImageUpload
            placeholder="อัปโหลดรูป"
            value={images}
            error={!!errors.images}
            helperText={errors.images?.message}
            multiple
            disabled={isPending || images.length >= MAX_IMAGES}
            onSelect={(files) => uploadImages(() => "images", files)}
            onRemove={(i) => removeImage("images", i)}
            onReorder={(from, to) => reorderImages("images", from, to)}
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
              value={options.map(({ productVariantId, name }) => ({ value: productVariantId, label: name }))}
              onChange={handleOptionsChange}
              multiple
              clearable
              disabled={isPending}
              error={!!errors.options?.message}
              helperText={errors.options?.message}
            />

            {options.length > 0 && (
              <div className="space-y-3">
                {options.map((option, index) => {
                  const selected = new Set(option.selectedVariantIds)
                  const allSelected = selected.size === option.variants.length
                  const error = errors.options?.[index]?.selectedVariantIds?.message

                  return (
                    <div key={option.productVariantId} className="space-y-3 rounded-lg border p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-medium">{option.name}</h4>
                        <span className="text-xs text-muted-foreground tabular-nums">
                          เลือก {selected.size}/{option.variants.length}
                        </span>

                        <label className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                          <input
                            type="checkbox"
                            className="size-4 accent-primary"
                            checked={option.showImage}
                            disabled={isPending}
                            onChange={() => toggleShowImage(index)}
                          />
                          ใช้รูปตามตัวเลือกนี้
                        </label>

                        <div className="ml-auto flex gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={isPending}
                            onClick={() => toggleAllValues(index, !allSelected)}
                          >
                            {allSelected ? "ล้างที่เลือก" : "เลือกทั้งหมด"}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-destructive"
                            disabled={isPending}
                            onClick={() => removeOption(index)}
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
                              onClick={() => toggleValue(index, v.id)}
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
                        selected.size === 0 && <p className="text-sm text-muted-foreground">เลือกอย่างน้อย 1 ค่า</p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </CardBody>

        {/* ─── รูปตามตัวเลือก ─── */}
        {imageGroups.length > 0 && (
          <CardBody title={`รูปตามตัวเลือก (${imageGroups.length} กลุ่ม)`}>
            <p className="mb-4 text-sm text-muted-foreground">
              เมื่อลูกค้าเลือกตัวเลือก รูปของกลุ่มนั้นจะแสดงแทนรูปหลัก กลุ่มที่ไม่มีรูปจะใช้รูปหลัก
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              {imageGroups.map((group, gi) => {
                const path = `imageGroups.${gi}.images` as const
                const error = errors.imageGroups?.[gi]?.images

                return (
                  <div key={group.variantIds.join("-")} className="space-y-3 rounded-lg border p-4">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {group.variantIds.map((vid) => {
                        const v = variantById.get(vid)
                        return (
                          <span
                            key={vid}
                            className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-sm"
                          >
                            {v?.colorHex && (
                              <span className="size-3 rounded-full border" style={{ backgroundColor: v.colorHex }} />
                            )}
                            {v?.name}
                          </span>
                        )
                      })}
                      <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                        {group.images.length}/{MAX_IMAGES}
                      </span>
                    </div>

                    <ImageUpload
                      placeholder="อัปโหลดรูป"
                      value={group.images}
                      multiple
                      disabled={isPending || group.images.length >= MAX_IMAGES}
                      error={!!error}
                      helperText={error?.message}
                      onSelect={(files) => uploadImages(() => groupPath(group.variantIds), files)}
                      onRemove={(i) => removeImage(path, i)}
                      onReorder={(from, to) => reorderImages(path, from, to)}
                    />
                  </div>
                )
              })}
            </div>
          </CardBody>
        )}

        {/* ─── SKU ─── */}
        <CardBody title={`SKU (${skuFields.length} รายการ)`}>
          <div className="space-y-3">
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