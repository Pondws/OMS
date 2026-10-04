import {
  isNil
} from "lodash"

export const Helper = {
  handleColorStatus: (
    status: "ACTIVE" | "INACTIVE" | undefined
  ) => {
    switch (status) {
      case "ACTIVE":
        return [
          "border-success",
          "text-success",
          "font-semibold"
        ].join(" ")

      case "INACTIVE":
        return [
          "border-muted-foreground",
          "text-muted-foreground",
          "font-semibold"
        ].join(" ")

      default:
        return [
          "border-input",
          "bg-background",
          "text-foreground",
          "hover:bg-accent",
          "focus:ring-ring/30",
        ].join(" ")
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