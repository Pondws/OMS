import { Spinner } from "components"

export function Loading() {
  return <div className="flex justify-center items-center h-screen">
    <Spinner className="size-16 animate-spin" />
  </div>
}