import { AuthType } from "types"
import { axios } from 'utils'

export const authApi = {
  login: async (data: AuthType.LoginProps) => {
    const res = await axios.post('auth/login', data)
    return res.data.data
  },
  getMe: async () => {
    const res = await axios.get('/me')
    return res.data
  },
  logout: async () => {
    const res = await axios.post('/logout')
    return res.data.data
  }
}