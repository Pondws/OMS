import { PaginationType, ProductVariantType } from "types"
import { axios } from 'utils'

const PREFIX_PRODUCT_VARIANT = '/product-variant'

export const productVariantApi = {
  getAll: async (params?: PaginationType) => {
    const res = await axios.get(PREFIX_PRODUCT_VARIANT, {
      params
    })
    return { data: res?.data?.data, totalRows: res?.data?.totalRows }
  },
  create: async (data: ProductVariantType.ProductVariantForm) => {
    const res = await axios.post(PREFIX_PRODUCT_VARIANT, data)
    return res?.data?.data
  },
  getByID: async (id: string) => {
    const res = await axios.get(`${PREFIX_PRODUCT_VARIANT}/${id}`)
    return res?.data?.data
  },
  update: async (id: string, data: ProductVariantType.ProductVariantForm) => {
    const res = await axios.put(`${PREFIX_PRODUCT_VARIANT}/${id}`, data)
    return res?.data?.data
  },
  deleteByID: async (id: string) => {
    const res = await axios.delete(`${PREFIX_PRODUCT_VARIANT}/${id}`)
    return res?.data?.data
  },
}