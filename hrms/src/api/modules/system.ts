import { apiData, http } from '@/api/http'
import type { PageParams, PageResult } from '@/api/types'
import type { HrmsUser, Permission, Role, SafeUser } from '@/types/models'

export type RoleWithCount = Role & { memberCount: number }

export const userApi = {
  list: (params: PageParams = {}) => apiData<PageResult<SafeUser>>(http.get('/users', { params })),
  create: (input: Partial<HrmsUser>) => apiData<SafeUser>(http.post('/users', input)),
  update: (id: string, input: Partial<HrmsUser>) => apiData<SafeUser>(http.put(`/users/${id}`, input)),
  resetPassword: (id: string, password = '123456') => apiData<null>(http.post(`/users/${id}/reset-password`, { password })),
  remove: (id: string) => apiData<null>(http.delete(`/users/${id}`)),
}

export const roleApi = {
  list: () => apiData<RoleWithCount[]>(http.get('/roles')),
  create: (input: Partial<Role>) => apiData<Role>(http.post('/roles', input)),
  update: (id: string, input: Partial<Role>) => apiData<Role>(http.put(`/roles/${id}`, input)),
  remove: (id: string) => apiData<null>(http.delete(`/roles/${id}`)),
}

export const permissionApi = {
  list: () => apiData<Permission[]>(http.get('/permissions')),
  create: (input: Partial<Permission>) => apiData<Permission>(http.post('/permissions', input)),
  update: (id: string, input: Partial<Permission>) => apiData<Permission>(http.put(`/permissions/${id}`, input)),
  remove: (id: string) => apiData<null>(http.delete(`/permissions/${id}`)),
}
