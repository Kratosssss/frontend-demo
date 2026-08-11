import { apiData, http } from '@/api/http'
import type { PageParams, PageResult } from '@/api/types'
import type { Employee } from '@/types/models'

export const employeeApi = {
  list: (params: PageParams = {}) => apiData<PageResult<Employee>>(http.get('/employees', { params })),
  create: (input: Partial<Employee>) => apiData<Employee>(http.post('/employees', input)),
  update: (id: string, input: Partial<Employee>) => apiData<Employee>(http.put(`/employees/${id}`, input)),
  remove: (id: string) => apiData<null>(http.delete(`/employees/${id}`)),
}
