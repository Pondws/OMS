import { useEffect, useState } from "react"
import debounce from "lodash/debounce"

export function useDebounce<T>(
  value: T,
  delay: 300
) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const update = debounce(() => {
      setDebouncedValue(value)
    }, delay)

    update()

    return () => {
      update.cancel()
    }
  }, [value, delay])

  return debouncedValue
}