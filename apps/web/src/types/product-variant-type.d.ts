import { Status } from "type"

export namespace ProductVariantType {
  export interface GetProductVariant {
    id: string
    name: string
    createdAt: string
    updatedAt: string
  }
  export interface ProductVariantForm {
    name: string
    description: string
    status: Status
    options: ProductVariantType[]
  }

  type ProductVariantType = {
    name: string
  }
}