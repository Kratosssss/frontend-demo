export type EntityStatus = 'enabled' | 'disabled'
export type EmployeeStatus = 'active' | 'inactive'
export type Gender = 'male' | 'female' | 'other'
export type AttendanceStatus = 'normal' | 'late' | 'early_leave' | 'absent' | 'leave'
export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'withdrawn'
export type LeaveType = 'annual' | 'sick' | 'personal' | 'other'
export type PermissionType = 'menu' | 'action'

export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
}

export interface Employee extends BaseEntity {
  employeeNo: string
  name: string
  gender: Gender
  mobile: string
  email: string
  departmentId: string
  position: string
  hireDate: string
  status: EmployeeStatus
}

export interface Department extends BaseEntity {
  code: string
  name: string
  parentId: string | null
  managerEmployeeId: string | null
  sort: number
  status: EntityStatus
}

export interface AttendanceRecord extends BaseEntity {
  employeeId: string
  date: string
  checkIn: string | null
  checkOut: string | null
  status: AttendanceStatus
  remark: string
}

export interface LeaveRequest extends BaseEntity {
  applicantEmployeeId: string
  type: LeaveType
  startTime: string
  endTime: string
  duration: number
  reason: string
  status: LeaveStatus
  approverUserId: string | null
  approvalComment: string
  submittedAt: string | null
  approvedAt: string | null
}

export interface HrmsUser extends BaseEntity {
  username: string
  displayName: string
  employeeId: string | null
  roleIds: string[]
  status: EntityStatus
  password?: string
}

export interface SafeUser extends Omit<HrmsUser, 'password'> {
  roleNames: string[]
}

export interface Role extends BaseEntity {
  code: string
  name: string
  description: string
  permissionCodes: string[]
  status: EntityStatus
  builtin: boolean
}

export interface Permission extends BaseEntity {
  code: string
  name: string
  parentId: string | null
  type: PermissionType
  routePath: string | null
  sort: number
  status: EntityStatus
  builtin: boolean
}

export interface HrmsDatabase {
  version: number
  sessionVersion: string
  employees: Employee[]
  departments: Department[]
  attendance: AttendanceRecord[]
  leaveRequests: LeaveRequest[]
  users: HrmsUser[]
  roles: Role[]
  permissions: Permission[]
}
