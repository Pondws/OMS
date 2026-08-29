"use client"

import { memo, useEffect } from 'react'
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  Input,
  Button,
  Header,
  CardBody,
  Textarea,
  Select,
} from "components"
import { productVariantApi } from 'apis'
import { useRouter } from 'next/navigation'
import { ProductVariantType } from 'types'
import { PRODUCT_VARIANT } from './product-variant.const'

import { toast } from 'sonner'
import { handleError, Helper } from "utils"
import { ArrowLeft, CirclePlus, GripVertical, Save, Trash } from 'lucide-react'
import { STATUS } from '@/consts'

const defaultValues = {
  name: "",
  description: "",
  status: "ACTIVE",
  options: [
    {
      name: ""
    },
  ]
}

const schema = z.object({
  name: z.string().nonempty('กรุณากรอกชื่อตัวเลือกสินค้า'),
  description: z.string(),
  status: z.string(),
  options: z.array(z.object({
    name: z.string().nonempty("กรุณากรอกชื่อตัวเลือก")
  })).min(1, "ต้องมีตัวเลือกอย่างน้อย 1 ตัว")
})

function ProductVariantFormComp(props: { id?: string }) {
  const { id } = props
  const router = useRouter()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    control,
    formState: {
      errors,
      isDirty
    },
    reset,
    getValues,
    setValue,
    watch
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues
  })

  const { fields, append, remove } = useFieldArray({
    name: "options",
    control
  })

  const {
    data,
  } = useQuery({
    queryKey: ["product-variant", id],
    queryFn: () => {
      if (!id) throw new Error("ID is required")
      return productVariantApi.getByID(id)
    },
    enabled: !!id
  })

  useEffect(() => {
    if (data) reset(data)
  }, [data, reset])

  const {
    mutate,
    isPending
  } = useMutation({
    mutationFn: (value: ProductVariantType.ProductVariantForm) => {
      if (id) {
        return productVariantApi.update(id, value)
      } else {
        return productVariantApi.create(value)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-tag"] })
      toast.success("บันทึกข้อมูลสำเร็จ")
      router.push(PRODUCT_VARIANT.path())
    },
    onError: (error) => toast.error(handleError(error)),
  })

  return (
    <div className='p-4'>
      <Header
        routes={[
          { name: PRODUCT_VARIANT.name, path: PRODUCT_VARIANT.path() },
          { name: PRODUCT_VARIANT.text(id ? 'update' : 'create'), path: '' }
        ]}
        title={PRODUCT_VARIANT.name}
        actionButton={
          <>
            <Button
              onClick={() => router.push(PRODUCT_VARIANT.path())}
              size='lg'
              variant='outline'
            >
              <ArrowLeft />
              กลับ
            </Button>
            <Button
              type='submit'
              size='lg'
              disabled={!isDirty || isPending}
              onClick={handleSubmit(values => mutate(values))}
            >
              <Save />
              บันทึก
            </Button>
          </>
        }
      />

      <form className='flex flex-col gap-4'>
        <CardBody
          title='ข้อมูลตัวเลือกสินค้า'
          action={
            <Select
              color={Helper.handleColorStatus(getValues("status"))}
              option={STATUS}
              value={watch("status")}
              onChange={(value) => setValue("status", value)}
            />
          }
        >
          <div className='grid md:grid-cols-2 gap-4'>
            <div className='col-span-2'>
              <Input
                {...register('name')}
                label='ชื่อตัวเลือกสินค้า'
                required
                placeholder='กรอกชื่อตัวเลือกสินค้า'
                helperText={errors.name ? errors.name.message : ''}
                error={!!errors.name}
              />
            </div>

            <div className='col-span-2'>
              <Textarea
                {...register('description')}
                label='คำอธิบาย'
                required
                placeholder='กรอกคำอธิบาย'
                helperText={errors.description ? errors.description.message : ''}
                error={!!errors.description}
              />
            </div>
          </div>
        </CardBody>

        <CardBody title="ตัวเลือกสินค้า">
          <div className='flex flex-col gap-3'>
            {fields.map((field, index) => (
              <div
                key={field.id}
                className='flex items-center gap-2'
              >
                <GripVertical className="cursor-grab" />

                <Input
                  {...register(`options.${index}.name`)}
                  placeholder="กรอกชื่อตัวเลือกสินค้า"
                  helperText={errors.options?.[index]?.name?.message}
                  error={!!errors.options?.[index]?.name}
                  className='flex-1'
                />

                <Button
                  variant="ghost"
                  className="h-9 w-9 p-0"
                  onClick={() => remove(index)}
                  disabled={fields.length <= 1}
                >
                  <Trash />
                </Button>
              </div>
            ))}
          </div>

          <Button
            className='mt-4'
            onClick={() => append({ name: "" })}
          >
            <CirclePlus />
            เพิ่มตัวเลือก
          </Button>
        </CardBody>
      </form>
    </div>
  )
}

export const ProductVariantForm = memo(ProductVariantFormComp)