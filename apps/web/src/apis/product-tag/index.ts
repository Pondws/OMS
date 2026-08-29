import { PaginationType, ProductTagType } from "types"
import { axios } from 'utils'

const PREFIX_PRODUCT_TAG = '/product-tag'

export const productTagApi = {
  getAll: async (params?: PaginationType) => {
    const res = await axios.get(PREFIX_PRODUCT_TAG, {
      params
    })
    return { data: res?.data?.data, totalRows: res?.data?.totalRows }
  },
  create: async (data: ProductTagType.ProductTagForm) => {
    const res = await axios.post(PREFIX_PRODUCT_TAG, data)
    return res?.data?.data
  },
  getByID: async (id: string) => {
    const res = await axios.get(`${PREFIX_PRODUCT_TAG}/${id}`)
    return res?.data?.data
  },
  update: async (id: string, data: ProductTagType.ProductTagForm) => {
    const res = await axios.put(`${PREFIX_PRODUCT_TAG}/${id}`, data)
    return res?.data?.data
  },
  deleteByID: async (id: string) => {
    const res = await axios.delete(`${PREFIX_PRODUCT_TAG}/${id}`)
    return res?.data?.data
  },
}