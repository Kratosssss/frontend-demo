import { apiData, http } from '@/api/http'
import type { PageParams, PageResult } from '@/api/types'
import type { LeaveRequest } from '@/types/models'

export const leaveApi = {
  list: (params: PageParams = {}) => apiData<PageResult<LeaveRequest>>(http.get('/leave-requests', { params })),
  create: (input: Partial<LeaveRequest>) => apiData<LeaveRequest>(http.post('/leave-requests', input)),
  update: (id: string, input: Partial<LeaveRequest>) => apiData<LeaveRequest>(http.put(`/leave-requests/${id}`, input)),
  approve: (id: string, comment: string) => apiData<LeaveRequest>(http.post(`/leave-requests/${id}/approve`, { comment })),
  reject: (id: string, comment: string) => apiData<LeaveRequest>(http.post(`/leave-requests/${id}/reject`, { comment })),
  withdraw: (id: string) => apiData<LeaveRequest>(http.post(`/leave-requests/${id}/withdraw`)),
  remove: (id: string) => apiData<null>(http.delete(`/leave-requests/${id}`)),
}
