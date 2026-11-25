import { Status } from "type"
import { ProductVariantType } from "types"

export interface Image {
  id: string
  url: string
  alt: string | null
  sortOrder: number
}

export interface ImageInput {
  url: string
  alt: string | null
  sortOrder: number
}
export namespace ProductType {
  export interface ProductDetail {
    id: string
    name: string
    slug: string
    description: string | null
    status: Status
    category: { id: string; name: string }
    tags: { id: string; name: string }[]
    // TODO: ตอนทำ get by id ต้องให้ backend ส่งรูปแบบนี้ (ตอนนี้ backend ยังส่ง ProductOption ดิบ)
    options: {
      productVariantId: string
      name: string
      type: ProductVariantType.DisplayType
      showImage: boolean
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
    images: Image[]
    imageGroups: { id: string; variantIds: string[]; images: Image[] }[]
  }

  export interface ProductForm {
    name: string
    slug: string
    description: string | null
    status: Status
    categoryId: string
    tagIds: string[]
    options: {
      productVariantId: string
      showImage: boolean
      variantIds: string[]
    }[]
    skus: {
      sku: string
      price: string
      compareAtPrice: string | null
      initialStock: number
      weightGrams: number | null
      status: Status
      variantIds: string[]
    }[]
    images: ImageInput[]
    imageGroups: { variantIds: string[]; images: ImageInput[] }[]
  }
}