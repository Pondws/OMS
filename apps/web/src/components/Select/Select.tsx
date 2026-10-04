"use client"

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Label } from "@/components/ui/label"
import {
  SelectBase,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
// import { Switch } from "@/components/ui/switch"

type SelectOption = {
  label: string
  value: string
}

type SelectProps = {
  className?: string
  placeholder?: string
  options: SelectOption[]
  value?: string
  onChange?: (value: string | null) => void
}

export function Select({
  className,
  placeholder,
  options,
  value,
  onChange,
}: SelectProps) {
  return (
    // <FieldGroup className="w-full max-w-xs">
    //   <Field>
    <SelectBase
      items={options}
      value={value}
      onValueChange={onChange}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>

      <SelectContent
        alignItemWithTrigger={false}
      >
        <SelectGroup>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </SelectBase>
    //   </Field>
    // </FieldGroup>
  )
}
