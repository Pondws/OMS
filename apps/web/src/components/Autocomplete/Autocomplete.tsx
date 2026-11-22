"use client"

import { useId, useState } from "react"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
  ComboboxTrigger
} from "@/components/ui/combobox"
import { Label } from "@/components/ui/label"
import { InputGroupButton } from '@/components/ui/input-group'
import { useDebounce } from "hooks"

export type AutocompleteOption<TData = unknown> = {
  value: string
  label: string
  data?: TData
  disabled?: boolean
  description?: string
}

type OptionsLoader<TData> = (search: string) => AutocompleteOption<TData>[] | Promise<AutocompleteOption<TData>[]>

type BaseProps<TData> = {
  label?: string
  /**
   * - Array    → const options, filtered in the browser
   * - Function → API search, called with the (debounced) search text
   */
  options: AutocompleteOption<TData>[] | OptionsLoader<TData>
  /** Hide these values from the list */
  exclude?: string[]
  placeholder?: string
  emptyText?: string
  loading?: boolean
  disabled?: boolean
  /** Show a clear (x) button when there is a value (single mode) */
  clearable?: boolean
  error?: boolean
  helperText?: string
  className?: string
  debounceMs?: number
}

type SingleProps<TData> = BaseProps<TData> & {
  multiple?: false
  value?: AutocompleteOption<TData> | null
  onChange?: (value: AutocompleteOption | null) => void
}

type MultipleProps<TData> = BaseProps<TData> & {
  multiple: true
  value?: AutocompleteOption<TData>[]
  onChange?: (value: AutocompleteOption<TData>[]) => void
}

export type AutocompleteProps<TData = unknown> = SingleProps<TData> | MultipleProps<TData>

const isSameOption = (a: AutocompleteOption, b: AutocompleteOption) =>
  a.value === b.value
const getLabel = (item: AutocompleteOption) => item.label
const getValue = (item: AutocompleteOption) => item.value

export function Autocomplete<TData = unknown>(props: AutocompleteProps<TData>) {
  const {
    label,
    options,
    exclude = [],
    placeholder = "Select options...",
    emptyText = "No items found.",
    loading = false,
    disabled = false,
    clearable = false,
    error = false,
    helperText,
    className,
    debounceMs = 300,
  } = props

  const id = useId()
  const anchor = useComboboxAnchor()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, debounceMs)

  const isAsync = typeof options === "function"

  // API search: React Query handles caching, race conditions & loading state
  const query = useQuery({
    queryKey: ["autocomplete", id, debouncedSearch],
    queryFn: () => (options as OptionsLoader<TData>)(debouncedSearch),
    enabled: isAsync && open,
    placeholderData: keepPreviousData, // keep old list while typing
  })

  const items: AutocompleteOption<TData>[] = (isAsync ? (query.data ?? []) : options).filter(
    (item) => !exclude.includes(item.value)
  )
  const isLoading = loading || query.isFetching

  return (
    <div className="grid gap-2">
      {label && <Label htmlFor={id}>{label}</Label>}

      <Combobox
        id={id}
        items={items}
        // API mode: the server already filtered → turn off client filter
        filter={isAsync ? null : undefined}
        multiple={props.multiple ?? false}
        value={props.multiple ? (props.value ?? []) : (props.value ?? null)}
        onValueChange={(next, details) => {
          // Base UI clears everything on Escape — too easy to do by accident
          if (details.reason === "escape-key") return details.cancel()

          if (props.multiple) {
            props.onChange?.(Array.isArray(next) ? (next as AutocompleteOption<TData>[]) : [])
          } else {
            props.onChange?.(Array.isArray(next) ? null : (next as AutocompleteOption<TData> | null))
          }
        }}
        onInputValueChange={(text, details) => {
          // Only search when the user types (not when an item fills the input)
          if (details.reason === "input-change") setSearch(text)
        }}
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen)
          if (!nextOpen) setSearch("") // show the full list next time
        }}
        isItemEqualToValue={isSameOption}
        itemToStringLabel={getLabel}
        itemToStringValue={getValue}
        disabled={disabled}
        autoHighlight
      >
        {props.multiple ? (
          <ComboboxChips ref={anchor} className={className}>
            <ComboboxValue>
              {(selected: AutocompleteOption<TData>[]) => (
                <>
                  {selected.map((item) => (
                    <ComboboxChip key={item.value} showRemove={!disabled}>
                      {item.label}
                    </ComboboxChip>
                  ))}
                  <ComboboxChipsInput
                    placeholder={selected.length ? undefined : placeholder}
                  />
                </>
              )}
            </ComboboxValue>
            <InputGroupButton
              size="icon-xs"
              variant="ghost"
              render={<ComboboxTrigger />}
              data-slot="input-group-button"
              className="group-has-data-[slot=combobox-clear]/input-group:hidden data-pressed:bg-transparent"
              disabled={disabled}
            />
          </ComboboxChips>
        ) : (
          <div ref={anchor}>
            <ComboboxInput
              placeholder={placeholder}
              className="w-full"
              disabled={disabled}
              showClear={clearable}
              aria-invalid={error || undefined}
            />
          </div>
        )}

        <ComboboxContent anchor={anchor}>
          <ComboboxEmpty>{isLoading ? "Loading..." : emptyText}</ComboboxEmpty>

          <ComboboxList>
            {(item: AutocompleteOption<TData>) => (
              <ComboboxItem key={item.value} value={item} disabled={item.disabled}>
                <div>
                  <div>{item.label}</div>
                  {item.description && (
                    <div className="text-xs text-muted-foreground">
                      {item.description}
                    </div>
                  )}
                </div>
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>

      {helperText && (
        <p className={error ? "text-sm text-destructive" : "text-sm text-muted-foreground"}>
          {helperText}
        </p>
      )}
    </div>
  )
}