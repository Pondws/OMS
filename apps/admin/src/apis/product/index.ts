import { PaginationType, ProductType } from "types"
import { axios } from 'utils'

const PREFIX_PRODUCT = '/products'

export const productApi = {
  getAll: async (params?: PaginationType) => {
    const res = await axios.get(PREFIX_PRODUCT, {
      params
    })
    return res?.data?.data
  },
  create: async (data: ProductType.ProductForm) => {
    const res = await axios.post(PREFIX_PRODUCT, data)
    return res?.data?.data
  },
  getByID: async (id: string) => {
    const res = await axios.get(`${PREFIX_PRODUCT}/${id}`)
    return res?.data?.data
  },
  update: async (id: string, data: ProductType.ProductForm) => {
    const res = await axios.put(`${PREFIX_PRODUCT}/${id}`, data)
    return res?.data?.data
  },
  deleteByID: async (id: string) => {
    const res = await axios.delete(`${PREFIX_PRODUCT}/${id}`)
    return res?.data?.data
  },
}