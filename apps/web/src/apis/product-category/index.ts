import { PaginationType, ProductTagType, GetSearchOptions } from "types"
import { axios } from 'utils'

const PREFIX_PRODUCT_CATEGORY = '/product-categories'

export const productCategoryApi = {
  getAll: async (params?: PaginationType) => {
    const res = await axios.get(PREFIX_PRODUCT_CATEGORY, {
      params
    })
    return res?.data
  },
  create: async (data: ProductTagType.ProductTagForm) => {
    const res = await axios.post(PREFIX_PRODUCT_CATEGORY, data)
    return res?.data?.data
  },
  getByID: async (id: string) => {
    const res = await axios.get(`${PREFIX_PRODUCT_CATEGORY}/${id}`)
    return res?.data
  },
  getOptions: async (query: GetSearchOptions) => {
    const res = await axios.get(
      `${PREFIX_PRODUCT_CATEGORY}/options`,
      {
        params: query,
      }
    )
    return res?.data
  },
  update: async (id: string, data: ProductTagType.ProductTagForm) => {
    const res = await axios.put(`${PREFIX_PRODUCT_CATEGORY}/${id}`, data)
    return res?.data?.data
  },
  deleteByID: async (id: string) => {
    const res = await axios.delete(`${PREFIX_PRODUCT_CATEGORY}/${id}`)
    return res?.data?.data
  },
}