"use client"

import { memo, useEffect } from 'react'
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch } from "react-hook-form"
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  Input,
  Button,
  Header,
  CardBody,
  Select,
} from "components"
import { productCategoryApi } from 'apis'
import { useRouter } from 'next/navigation'
import { ProductTagType } from 'types'
import { PRODUCT_CATEGORY } from './product-category.const'

import { toast } from 'sonner'
import { handleError, Helper } from "utils"
import { ArrowLeft, Save } from 'lucide-react'
import { STATUS } from 'consts'

const schema = z.object({
  name: z.string().nonempty('Name is required'),
  status: z.enum(["ACTIVE", "INACTIVE"])
})

type FormValues = z.infer<typeof schema>

const defaultValues: FormValues = {
  name: '',
  status: "ACTIVE"
}

function ProductCategoryFormComp(props: { id?: string }) {
  const { id } = props
  const router = useRouter()
  const queryClient = useQueryClient()

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: {
      errors,
      isDirty
    },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues
  })

  const value = useWatch({
    control
  })

  const {
    data
  } = useQuery({
    queryKey: ["product-tag", id],
    queryFn: () => {
      if (!id) throw new Error("ไม่พบ ID")
      return productCategoryApi.getByID(id)
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
    mutationFn: (value: ProductTagType.ProductTagForm) => {
      if (id) {
        return productCategoryApi.update(id, value)
      } else {
        return productCategoryApi.create(value)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-tag"] })
      toast.success("บันทึกข้อมูลสำเร็จ")
      router.push(PRODUCT_CATEGORY.path())
    },
    onError: (error) => toast.error(handleError(error)),
  })

  return (
    <div className='p-4'>
      <Header
        routes={[
          { name: PRODUCT_CATEGORY.name, path: PRODUCT_CATEGORY.path() },
          { name: PRODUCT_CATEGORY.text(id ? 'update' : 'create'), path: '' }
        ]}
        title={PRODUCT_CATEGORY.text(id ? 'update' : 'create')}
        actionButton={
          <>
            <Button
              onClick={() => router.push(PRODUCT_CATEGORY.path())}
              size='lg'
              className='px-8'
              variant='outline'
            >
              <ArrowLeft />
              กลับ
            </Button>
            <Button
              type='submit'
              size='lg'
              className='px-8'
              disabled={!isDirty || isPending}
              onClick={handleSubmit(values => mutate(values))}
            >
              <Save />
              บันทึก
            </Button>
          </>
        }
      />

      <CardBody
        title='ข้อมูลหมวดหมู่สินค้า'
        action={
          <Select
            className={Helper.handleColorStatus(value?.status)}
            options={STATUS}
            value={value.status}
            onChange={(value) => {
              if (value === "ACTIVE" || value === "INACTIVE") {
                setValue("status", value)
              }
            }}
          />
        }
      >
        <div className='grid md:grid-cols-2'>
          <div className='col-span-1'>
            <Input
              {...register('name')}
              label='ชื่อหมวดหมู่สินค้า'
              placeholder='กรุณากรอกชื่อหมวดหมู่สินค้า'
              helperText={errors.name ? errors.name.message : ''}
              error={!!errors.name}
            />
          </div>
        </div>
      </CardBody>
    </div>
  )
}

export const ProductCategoryForm = memo(ProductCategoryFormComp)