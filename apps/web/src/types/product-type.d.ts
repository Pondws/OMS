import { Status } from "type"
import { ProductVariantType } from "types"

export namespace ProductType {
  /** GET /products/:id */
  export interface ProductDetail {
    id: string
    name: string
    slug: string
    description: string | null
    status: Status
    category: { id: string; name: string }
    tags: { id: string; name: string }[]
    options: {
      productVariantId: string
      name: string
      type: ProductVariantType.DisplayType
      values: { id: string; name: string; colorHex: string | null; sortOrder: number }[]
    }[]
    skus: {
      id: string
      sku: string
      price: string
      compareAtPrice: string | null
      stock: number
      weightGrams: number | null
      status: Status
      variantIds: string[]
    }[]
    images: { id: string; url: string; alt: string | null; optionValueId: string | null }[]
  }

  /** body ของ create / update */
  export interface ProductForm {
    name: string
    slug: string
    description: string | null
    status: Status
    categoryId: string
    tagIds: string[]
    options: { productVariantId: string }[]
    skus: {
      id?: string
      sku: string
      price: string
      compareAtPrice: string | null
      stock: number
      weightGrams: number | null
      status: Status
      variantIds: string[]
    }[]
    images: { url: string; alt: string | null; optionValueId: string | null }[]
  }
}