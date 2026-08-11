import { apiData, http } from '@/api/http'
import type { AttendanceStatus, Employee, LeaveRequest } from '@/types/models'

export interface DashboardSummary {
  metrics: { employees: number; departments: number; attendanceRate: number; pendingLeaves: number }
  trend: Array<{ month: string; value: number }>
  departmentStats: Array<{ name: string; value: number }>
  attendanceStats: Array<{ status: AttendanceStatus; value: number }>
  pendingLeaves: Array<LeaveRequest & { applicantName: string }>
  recentEmployees: Employee[]
}

export const dashboardApi = {
  summary: () => apiData<DashboardSummary>(http.get('/dashboard/summary')),
}
