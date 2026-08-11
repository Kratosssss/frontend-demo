import { apiData, http } from '@/api/http'
import type { PageParams, PageResult } from '@/api/types'
import type { AttendanceRecord } from '@/types/models'

export const attendanceApi = {
  list: (params: PageParams = {}) => apiData<PageResult<AttendanceRecord>>(http.get('/attendance', { params })),
  create: (input: Partial<AttendanceRecord>) => apiData<AttendanceRecord>(http.post('/attendance', input)),
  update: (id: string, input: Partial<AttendanceRecord>) => apiData<AttendanceRecord>(http.put(`/attendance/${id}`, input)),
  remove: (id: string) => apiData<null>(http.delete(`/attendance/${id}`)),
}
