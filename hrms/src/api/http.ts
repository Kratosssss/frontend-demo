import axios from 'axios'
import { ElMessage } from 'element-plus'
import type { ApiResponse } from './types'

export const http = axios.create({ baseURL: '/api', timeout: 10_000 })

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('hrms_token') ?? sessionStorage.getItem('hrms_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message ?? error.message ?? '请求失败'
    if (error.response?.status === 401 && !location.pathname.includes('/login')) {
      localStorage.removeItem('hrms_token')
      sessionStorage.removeItem('hrms_token')
      if (import.meta.env.MODE !== 'test') location.href = `/login?redirect=${encodeURIComponent(location.pathname)}`
    } else {
      ElMessage.error(message)
    }
    return Promise.reject(error)
  },
)

export const apiData = async <T>(promise: Promise<{ data: ApiResponse<T> }>) => (await promise).data.data
