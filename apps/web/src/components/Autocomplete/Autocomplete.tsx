"use client"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"

import { useDebounce } from "hooks"

type AutocompleteOption = {
  value: string
  label: string
}

export type options = (
  search: string
) => AutocompleteOption[] | Promise<AutocompleteOption[]>

type AutocompleteProps = {
  value?: string[]
  onChange?: (value: string[]) => void
  options: options
  exclude?: string[]
  placeholder?: string
  loading?: boolean
  disabled?: boolean
  className?: string
}

export function Autocomplete({
  value,
  onChange,
  options,
  exclude,
  placeholder,
  loading,
  disabled,
  className
}: AutocompleteProps) {
  return (
    <Combobox items={options}>
      <ComboboxInput placeholder="Select a framework" />
      <ComboboxContent>
        <ComboboxEmpty>No items found.</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item.value} value={item.value}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
