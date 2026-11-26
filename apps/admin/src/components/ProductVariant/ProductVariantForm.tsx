"use client"

import { memo, useEffect, useId } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, FormProvider, useFieldArray, useForm, useFormContext, useWatch } from "react-hook-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { ArrowDown, ArrowLeft, ArrowUp, CirclePlus, Save, Trash } from "lucide-react"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button, CardBody, Header, Input, Select } from "components"
import { productVariantApi } from "apis"
import { STATUS } from "consts"
import { ProductVariantType } from "types"
import { Helper, handleError } from "utils"
import { PRODUCT_VARIANT } from "./product-variant.const"
import {
  DEFAULT_HEX,
  DEFAULT_VALUES,
  DISPLAY_TYPE_LABEL,
  EMPTY_OPTION,
  productVariantSchema,
  toFormValues,
  toPayload,
  type ProductVariantFormValues,
} from "./product-variant.schema"

// ─── รูปแบบการแสดงในหน้าร้าน ───────────────

const DISPLAY_TYPE_OPTIONS: {
  value: ProductVariantType.DisplayType
  description: string
  preview: React.ReactNode
}[] = [
  {
    value: "TEXT",
    description: "กรอกแค่ชื่อตัวเลือก เหมาะกับไซส์ วัสดุ",
    preview: (
      <span className="flex gap-1.5" aria-hidden>
        <span className="rounded-md border px-2.5 py-0.5 text-xs">S</span>
        <span className="rounded-md border border-primary bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">M</span>
        <span className="rounded-md border px-2.5 py-0.5 text-xs">L</span>
      </span>
    ),
  },
  {
    value: "CIRCLE",
    description: "กรอกชื่อและรหัสสีให้แต่ละตัวเลือก",
    preview: (
      <span className="flex gap-2 pt-0.5" aria-hidden>
        <span className="size-4 rounded-full bg-zinc-900 ring-2 ring-zinc-900 ring-offset-2" />
        <span className="size-4 rounded-full border border-black/15 bg-white" />
        <span className="size-4 rounded-full bg-blue-900" />
      </span>
    ),
  },
]

function DisplayTypeField() {
  const radioId = useId()
  const { control } = useFormContext<ProductVariantFormValues>()

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-3 text-sm font-medium">รูปแบบการแสดงในหน้าร้าน</legend>
      <Controller
        control={control}
        name="type"
        render={({ field }) => (
          <RadioGroup
            value={field.value}
            onValueChange={(value) => field.onChange(value as ProductVariantType.DisplayType)}
            className="grid gap-3 sm:grid-cols-2"
          >
            {DISPLAY_TYPE_OPTIONS.map((opt) => {
              const descId = `${radioId}-${opt.value}-desc`
              return (
                <label
                  key={opt.value}
                  className="relative flex cursor-pointer items-start gap-3 rounded-md border border-input p-4 shadow-xs outline-none has-data-checked:border-primary has-data-checked:bg-accent/40"
                >
                  <RadioGroupItem
                    value={opt.value}
                    aria-describedby={descId}
                    className="mt-0.5 size-5 [&_[data-slot=radio-group-indicator]>span]:size-2.5"
                  />
                  <div className="grid gap-1.5">
                    <span className="text-sm font-medium">{DISPLAY_TYPE_LABEL[opt.value]}</span>
                    <span id={descId} className="text-xs text-muted-foreground">{opt.description}</span>
                    {opt.preview}
                  </div>
                </label>
              )
            })}
          </RadioGroup>
        )}
      />
    </fieldset>
  )
}

// ─── แถวของค่าแต่ละค่า ───────────────────────

type OptionRowProps = {
  index: number
  isCircle: boolean
  isFirst: boolean
  isLast: boolean
  canRemove: boolean
  onMoveUp: () => void
  onMoveDown: () => void
  onRemove: () => void
}

function OptionRow({ index, isCircle, isFirst, isLast, canRemove, onMoveUp, onMoveDown, onRemove }: OptionRowProps) {
  const { control, register, formState: { errors } } = useFormContext<ProductVariantFormValues>()
  const no = index + 1
  const nameError = errors.options?.[index]?.name

  return (
    <li className="flex items-start gap-2">
      <span className="w-6 shrink-0 pt-2 text-right text-sm tabular-nums text-muted-foreground">{no}</span>

      {isCircle && (
        <Controller
          control={control}
          name={`options.${index}.colorHex`}
          render={({ field, fieldState }) => (
            <div className="flex w-44 shrink-0 gap-1.5">
              <input
                type="color"
                aria-label={`เลือกสีของตัวเลือกที่ ${no}`}
                value={Helper.safeHex(field.value, DEFAULT_HEX)}
                onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                className="h-9 w-10 shrink-0 cursor-pointer rounded-md border border-input bg-background p-1"
              />
              <Input
                value={field.value}
                onChange={(e) => field.onChange(Helper.normalizeHex(e.target.value))}
                onBlur={field.onBlur}
                aria-label={`รหัสสีของตัวเลือกที่ ${no}`}
                placeholder="#000000"
                className="font-mono uppercase"
                helperText={fieldState.error?.message}
                error={!!fieldState.error}
              />
            </div>
          )}
        />
      )}

      <div className="min-w-0 flex-1">
        <Input
          {...register(`options.${index}.name`)}
          aria-label={`ชื่อตัวเลือกที่ ${no}`}
          placeholder={isCircle ? "เช่น แดง" : "เช่น S, M, L"}
          helperText={nameError?.message}
          error={!!nameError}
        />
      </div>

      <div className="flex shrink-0">
        <Button type="button" variant="ghost" className="size-9 p-0" aria-label={`เลื่อนตัวเลือกที่ ${no} ขึ้น`} disabled={isFirst} onClick={onMoveUp}>
          <ArrowUp />
        </Button>
        <Button type="button" variant="ghost" className="size-9 p-0" aria-label={`เลื่อนตัวเลือกที่ ${no} ลง`} disabled={isLast} onClick={onMoveDown}>
          <ArrowDown />
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="size-9 p-0 text-destructive hover:text-destructive"
          aria-label={`ลบตัวเลือกที่ ${no}`}
          disabled={!canRemove}
          onClick={onRemove}
        >
          <Trash />
        </Button>
      </div>
    </li>
  )
}

// ─── Form ───────────────────────────────────

function ProductVariantFormComp({ id }: { id?: string }) {
  const isEdit = !!id
  const formId = useId()
  const router = useRouter()
  const queryClient = useQueryClient()
  const backToList = () => router.push(PRODUCT_VARIANT.path())

  const form = useForm<ProductVariantFormValues>({
    resolver: zodResolver(productVariantSchema),
    defaultValues: DEFAULT_VALUES,
  })
  const { control, register, handleSubmit, reset, formState: { errors, isDirty } } = form

  const { fields, append, remove, move } = useFieldArray({ control, name: "options" })
  const isCircle = useWatch({ control, name: "type" }) === "CIRCLE"
  const listError = errors.options?.root?.message ?? errors.options?.message

  const { data } = useQuery({
    queryKey: PRODUCT_VARIANT.queryKey.detail(id ?? ""),
    queryFn: () => productVariantApi.getByID(id!),
    enabled: isEdit,
  })

  useEffect(() => {
    if (data) reset(toFormValues(data))
  }, [data, reset])

  const { mutate: save, isPending } = useMutation({
    mutationFn: (payload: ProductVariantType.ProductVariantForm) =>
      isEdit ? productVariantApi.update(id!, payload) : productVariantApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_VARIANT.queryKey.all })
      toast.success("บันทึกข้อมูลสำเร็จ")
      backToList()
    },
    onError: (error) => toast.error(handleError(error)),
  })

  return (
    <FormProvider {...form}>
      <div className="p-4">
        <Header
          routes={[
            { name: PRODUCT_VARIANT.name, path: PRODUCT_VARIANT.path() },
            { name: PRODUCT_VARIANT.text(isEdit ? "update" : "create"), path: "" },
          ]}
          title={PRODUCT_VARIANT.name}
          actionButton={
            <>
              <Button type="button" size="lg" variant="outline" onClick={backToList}>
                <ArrowLeft />
                กลับ
              </Button>
              <Button type="submit" form={formId} size="lg" disabled={isPending || (isEdit && !isDirty)}>
                <Save />
                {isPending ? "กำลังบันทึก..." : "บันทึก"}
              </Button>
            </>
          }
        />

        <form
          id={formId}
          onSubmit={handleSubmit((values) => save(toPayload(values)))}
          className="flex flex-col gap-4"
          noValidate
        >
          <CardBody
            title="ข้อมูลตัวเลือกสินค้า"
            action={
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select
                    options={STATUS}
                    value={field.value}
                    onChange={(value) => {
                      if (value === "ACTIVE" || value === "INACTIVE") field.onChange(value)
                    }}
                  />
                )}
              />
            }
          >
            <div className="flex flex-col gap-6">
              <Input
                {...register("name")}
                label="ชื่อตัวเลือกสินค้า"
                required
                placeholder="เช่น สี, ไซส์, วัสดุ"
                helperText={errors.name?.message}
                error={!!errors.name}
              />
              <DisplayTypeField />
            </div>
          </CardBody>

          <CardBody title="ตัวเลือกสินค้า">
            <p className="mb-3 text-sm text-muted-foreground">
              {isCircle
                ? "กรอกชื่อและรหัสสี ลำดับในรายการนี้คือลำดับที่แสดงในหน้าร้าน"
                : "ชื่อตัวเลือกคือข้อความบนปุ่ม ลำดับในรายการนี้คือลำดับที่แสดงในหน้าร้าน"}
            </p>

            <ol className="flex flex-col gap-2">
              {fields.map((field, index) => (
                <OptionRow
                  key={field.id}
                  index={index}
                  isCircle={isCircle}
                  isFirst={index === 0}
                  isLast={index === fields.length - 1}
                  canRemove={fields.length > 1}
                  onMoveUp={() => move(index, index - 1)}
                  onMoveDown={() => move(index, index + 1)}
                  onRemove={() => remove(index)}
                />
              ))}
            </ol>

            {listError && <p className="mt-2 text-sm text-destructive">{listError}</p>}

            <Button type="button" variant="outline" className="mt-4" onClick={() => append(EMPTY_OPTION)}>
              <CirclePlus />
              เพิ่มตัวเลือก
            </Button>
          </CardBody>
        </form>
      </div>
    </FormProvider>
  )
}

export const ProductVariantForm = memo(ProductVariantFormComp)