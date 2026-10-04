import axios from "axios"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  withCredentials: true
})

api.interceptors.response.use(
  (response) => response,
  
  async (error) => {
    const originalRequest = error.config

    console.log("originalRequest", error)

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true

      try {
        await api.post("/auth/refresh")

        return api(originalRequest)
      } catch {
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  }
)


export {
  api as axios
}