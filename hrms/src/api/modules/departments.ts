import { apiData, http } from '@/api/http'
import type { Department } from '@/types/models'

export const departmentApi = {
  list: (params: Record<string, unknown> = {}) => apiData<Department[]>(http.get('/departments', { params })),
  create: (input: Partial<Department>) => apiData<Department>(http.post('/departments', input)),
  update: (id: string, input: Partial<Department>) => apiData<Department>(http.put(`/departments/${id}`, input)),
  remove: (id: string) => apiData<null>(http.delete(`/departments/${id}`)),
}
