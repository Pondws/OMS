import axios from "axios"

const axiosBase = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  withCredentials: true
})

export {
  axiosBase as axios
}