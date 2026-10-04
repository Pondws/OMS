import {
  isNil
} from "lodash"

export const Helper = {
  handleColorStatus: (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "border-green-500/25 text-green-600"
      case "INACTIVE":
        return "border-gray-500/25 text-gray-500"
      default:
        return "border-gray-300 bg-white text-black hover:bg-gray-100 focus:bg-gray-200 focus:ring-gray-300"
    }
  },
  createQueryString: (values: Record<string, unknown>) => {
    const params = new URLSearchParams()

    Object.entries(values).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        params.set(key, String(value))
      }
    })

    return params.toString()
  },
  omitEmptyField: (value: unknown) => {
    return isNil(value) || value === ""
  }
}