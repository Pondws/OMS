import axios from "axios"

const axiosBase = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  withCredentials: true
})

// axiosBase.interceptors.request.use((config) => {
//   const token = lo
// })

export {
  axiosBase as axios
}