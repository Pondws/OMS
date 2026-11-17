"use client"

import { memo, useEffect } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch, Controller } from "react-hook-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowLeft, Check, Save } from "lucide-react"
import { arrayMove } from "@dnd-kit/sortable"

import {
  Input,
  Button,
  Header,
  CardBody,
  Select,
  Autocomplete,
  ImageUpload
} from "components"

import {
  productCategoryApi,
  productTagApi,
  uploadImageApi,
  productVariantApi
} from "apis"
import { ProductTagType } from "types"
import { PRODUCT } from "./product.const"
import { handleError, Helper } from "utils"
import { STATUS } from "consts"
import { cn } from "@/lib/utils"

const MAX_IMAGES = 5

const optionSchema = z.object({
  label: z.string(),
  value: z.string(),
})

const skuSchema = z.object({
  price: z.number(),
  sku: z.string()
})

const variantValueSchema = z.object({
  id: z.string(),
  name: z.string(),
})

const productOptionSchema = optionSchema.extend({
  variants: z.array(variantValueSchema),
  selectedIds: z.array(z.string()).min(1, "เลือกอย่างน้อย 1 ค่า"),
})

const productSchema = z.object({
  name: z.string().trim().min(1, "กรุณากรอกชื่อสินค้า"),
  slug: z
    .string()
    .trim()
    .min(1, "กรุณากรอก slug")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "ใช้ได้เฉพาะ a-z, 0-9 และ - เท่านั้น"),
  description: z.string().trim(),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  category: optionSchema
    .nullable(),
  tags: z.array(optionSchema),
  images: z
    .array(z.object({ url: z.string(), path: z.string() }))
    .max(MAX_IMAGES, `อัปโหลดได้ไม่เกิน ${MAX_IMAGES} รูป`),
  options: z.array(productOptionSchema),
  sku: z.array(skuSchema)
})

type FormValues = z.infer<typeof productSchema>

const defaultValues: FormValues = {
  name: "",
  slug: "",
  description: "",
  status: "ACTIVE",
  category: null,
  tags: [],
  images: [],
  options: [],
  sku: []
}

function ProductFormComp(props: { id?: string }) {
  const { id } = props
  const router = useRouter()
  const queryClient = useQueryClient()

  const {
    control,
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isDirty },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(productSchema),
    defaultValues,
  })

  const status = useWatch({ control, name: "status" })
  const images = useWatch({ control, name: "images" })
  const options = useWatch({ control, name: "options" })
  const skus = useWatch({ control, name: "sku" })

  const { data } = useQuery({
    queryKey: ["product", id],
    queryFn: () => {
      if (!id) throw new Error("ไม่พบ ID")
      return productCategoryApi.getByID(id)
    },
    enabled: !!id,
  })

  useEffect(() => {
    if (data) reset(data)
  }, [data, reset])

  const {
    mutate,
    isPending
  } = useMutation({
    mutationFn: (values: ProductTagType.ProductTagForm) => {
      if (id) {
        return productCategoryApi.update(id, values)
      }

      return productCategoryApi.create(values)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-tag"] })
      toast.success("บันทึกข้อมูลสำเร็จ")
      router.push(PRODUCT.path())
    },
    onError: (error) => toast.error(handleError(error)),
  })

  const handleUploadImages = async (files: File[]) => {
    try {
      const images = await uploadImageApi('products', files)
      setValue("images", [...getValues("images"), ...images],
        { shouldDirty: true }
      )
    } catch (error) {
      console.error(error)
    }
  }

  const handleRemoveImage = (index: number) => {
    setValue(
      "images",
      getValues("images").filter((_, i) => i !== index),
      { shouldDirty: true }
    )
  }

  // const applyOptions = (next: any[]) => {
  //   setValue("options", next, { shouldDirty: true, shouldValidate: true })
  //   // setValue("sku", buildSkus(next, getValues("sku")), { shouldDirty: true })
  // }

  // const toggleValue = (optionIndex: number, variantId: string) => {
  //   applyOptions(
  //     getValues("options").map((opt, i) => {
  //       if (i !== optionIndex) return opt
  //       const on = opt.selectedIds.includes(variantId)
  //       return {
  //         ...opt,
  //         // เรียงตามลำดับ variants เสมอ ไม่ใช่ตามลำดับที่กด
  //         selectedIds: opt.variants
  //           .map((v) => v.id)
  //           .filter((vid) => (vid === variantId ? !on : opt.selectedIds.includes(vid))),
  //       }
  //     })
  //   )
  // }

  const onSubmit = (values: FormValues) => {
    mutate({
      name: values.name,
      // status: values.status,
      // productCategoryID: values.productCategory?.value ?? "",
      // productTagIDs: values.productTags.map((tag) => tag.value),
    })
  }

  return (
    <div className="p-4">
      <Header
        routes={[
          { name: PRODUCT.name, path: PRODUCT.path() },
          { name: PRODUCT.text(id ? "update" : "create"), path: "" },
        ]}
        title={PRODUCT.text(id ? "update" : "create")}
        actionButton={
          <>
            <Button
              onClick={() => router.push(PRODUCT.path())}
              size="lg"
              className="px-8"
              variant="outline"
            >
              <ArrowLeft />
              กลับ
            </Button>

            <Button
              type="submit"
              size="lg"
              className="px-8"
              disabled={!isDirty || isPending}
              onClick={handleSubmit(onSubmit)}
            >
              <Save />
              บันทึก
            </Button>
          </>
        }
      />

      <div className="space-y-4">
        <CardBody
        title="ข้อมูลหมวดหมู่สินค้า"
        action={
          <Select
            className={Helper.handleColorStatus(status)}
            options={STATUS}
            value={status}
            onChange={(status) => {
              if (status === "ACTIVE" || status === "INACTIVE") {
                setValue("status", status, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            }}
          />
        }
      >
        <div className="grid md:grid-cols-2 gap-4">
          <Input
            {...register("name")}
            label="ชื่อสินค้า"
            placeholder="กรุณากรอกชื่อสินค้า"
            helperText={errors.name?.message}
            error={!!errors.name}
          />

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

          <div className="md:col-span-2">
            {/* <Input
              {...register("description")}
              label="รายละเอียดสินค้า"
              placeholder="กรอกรายละเอียดสินค้า (ไม่บังคับ)"
              helperText={errors.description?.message}
              error={!!errors.description}
            /> */}
          </div>

          <div className="md:col-span-2">
            <ImageUpload
              label="รูปสินค้า"
              placeholder="อัปโหลดรูป"
              value={images}
              error={!!errors.images}
              multiple
              disabled={isPending}
              onSelect={handleUploadImages}
              onRemove={handleRemoveImage}
              onReorder={(from, to) =>
                setValue("images", arrayMove(images, from, to), {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              primaryBadge="รูปหลัก"
            />
          </div>
        </div>
      </CardBody>

      <CardBody title="ตัวเลือกสินค้า">
        <Controller
          control={control}
          name="options"
          render={({ field, fieldState }) => (
            <Autocomplete
              label="ตัวเลือกสินค้า"
              placeholder="เลือกตัวเลือกสินค้า"
              options={(search) => productVariantApi.getOptions({ search })}
              value={field.value}
              onChange={field.onChange}
              multiple
              clearable
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            />
          )}
        />

        {/* {options.length > 0 && (
          <div className="divide-y rounded-md">
            {options.map((option, index) => {
              const error = errors.options?.[index]?.selectedIds?.message
              return (
                <div
                  key={option.value}
                  className="grid gap-2 p-3 sm:grid-cols-[120px_1fr]"
                >
                  <span
                    className={cn(
                      "pt-1 text-sm font-medium",
                      error && "text-destructive"
                    )}
                  >
                    {option.label}
                  </span>
                  <div>
                    <div className="flex flex-wrap gap-2">
                      {option.variants.map((v) => {
                        const on = option?.selectedIds?.includes(v.id)
                        return (
                          <Button
                            key={v.id}
                            disabled={isPending}
                            onClick={() => toggleValue(index, v.id)}
                            
                            // className={cn(
                            //   // "inline-flex cursor-pointer items-center gap-1 rounded-full border px-3 py-1 text-sm transition-colors",
                            //   // "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            //   // "disabled:cursor-not-allowed disabled:opacity-50",
                            //   on
                            //     ? "border-primary bg-primary/10 text-primary"
                            //     : "text-muted-foreground hover:bg-muted"
                            // )}
                          >
                            {on && <Check className="size-3.5" />}
                            {v.name}
                          </Button>
                        )
                      })}
                      {option.variants.length === 0 && (
                        <span className="text-sm text-muted-foreground">
                          ตัวเลือกนี้ยังไม่มีค่า
                        </span>
                      )}
                    </div>
                    {error && (
                      <p className="mt-1 text-xs text-destructive">{error}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )} */}
      </CardBody>
      </div>
    </div>
  )
}

export const ProductForm = memo(ProductFormComp)
