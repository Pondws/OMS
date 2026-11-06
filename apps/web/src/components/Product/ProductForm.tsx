"use client"

import { memo, useEffect } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch, Controller } from "react-hook-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowLeft, Save } from "lucide-react"

import {
  Input,
  Button,
  Header,
  CardBody,
  Select,
  Autocomplete,
} from "components"

import { productCategoryApi, productTagApi } from "apis"
import { ProductTagType } from "types"
import { PRODUCT } from "./product.const"
import { handleError, Helper } from "utils"
import { STATUS } from "consts"

const optionSchema = z.object({
  label: z.string(),
  value: z.string(),
})

const schema = z.object({
  name: z.string().trim().min(1, "กรุณากรอกชื่อสินค้า"),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  productCategory: optionSchema.nullable(),
  productTags: z.array(optionSchema),
})

type FormValues = z.infer<typeof schema>

const defaultValues: FormValues = {
  status: "ACTIVE",
  name: "",
  productCategory: null,
  productTags: [],
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
    formState: { errors, isDirty },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  const value = useWatch({ control })

  // Get detail for Edit
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

      <CardBody
        title="ข้อมูลหมวดหมู่สินค้า"
        action={
          <Select
            className={Helper.handleColorStatus(value?.status)}
            options={STATUS}
            value={value.status}
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
            name="productCategory"
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
            name="productTags"
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
    </div>
  )
}

export const ProductForm = memo(ProductFormComp)
