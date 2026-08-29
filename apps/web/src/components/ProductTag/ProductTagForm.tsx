"use client"

import { memo, useEffect } from 'react'
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  Input,
  Button,
  Header,
} from "components"
import { productTagApi } from 'apis'
import { useRouter } from 'next/navigation'
import { ProductTagType } from 'types'
import { PRODUCT_TAG } from './product-tag.const'

import { toast } from 'sonner'
import { handleError } from "utils"
import { ArrowLeft, Save } from 'lucide-react'

const defaultValues = {
  name: '',
}

const schema = z.object({
  name: z.string().nonempty('Name is required'),
})

function ProductTagFormComp(props: { id?: string }) {
  const { id } = props
  const router = useRouter()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isDirty
    },
    reset,
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues
  })

  const {
    data,
  } = useQuery({
    queryKey: ["product-tag", id],
    queryFn: () => {
      if (!id) throw new Error("ID is required")
      return productTagApi.getByID(id)
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
        return productTagApi.update(id, value)
      } else {
        return productTagApi.create(value)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-tag"] })
      toast.success("บันทึกข้อมูลสำเร็จ")
      router.push(PRODUCT_TAG.path())
    },
    onError: (error) => toast.error(handleError(error)),
  })

  return (
    <div className='p-4'>
      <Header
        routes={[
          { name: PRODUCT_TAG.name, path: PRODUCT_TAG.path() },
          { name: PRODUCT_TAG.text(id ? 'update' : 'create'), path: '' }
        ]}
        title={PRODUCT_TAG.name}
        actionButton={
          <>
            <Button
              onClick={() => router.push(PRODUCT_TAG.path())}
              size='lg'
              // className='min-w-9'
              variant='outline'
            >
              <ArrowLeft />
              กลับ
            </Button>
            <Button
              type='submit'
              size='lg'
              // className='min-w-9'
              disabled={!isDirty || isPending}
              onClick={handleSubmit(values => mutate(values))}
            >
              <Save />
              บันทึก
            </Button>
          </>
        }
      />

      <form>
        <div className='grid md:grid-cols-2'>
          <div className='col-span-1'>
            <Input
              {...register('name')}
              label='Name'
              placeholder='Please fill Name'
              helperText={errors.name ? errors.name.message : ''}
              error={!!errors.name}
            />
          </div>
        </div>
      </form>
    </div>
  )
}

export const ProductTagForm = memo(ProductTagFormComp)