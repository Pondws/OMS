import { PaginationType } from "types"
import { axios } from 'utils'

const PREFIX_INVENTORY = '/inventory'

export const InventoryApi = {
  getAll: async (params?: PaginationType) => {
    const res = await axios.get(PREFIX_INVENTORY, {
      params
    })
    return res?.data
  },
  getByID: async (id: string) => {
    const res = await axios.get(`${PREFIX_INVENTORY}/${id}`)
    return res?.data?.data
  },
}