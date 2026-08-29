export namespace ProductTagType {
  export interface GetProductTag {
    id: string
    name: string
    createdAt: string
    updatedAt: string
  }
  export interface ProductTagForm {
    name: string
  }
}