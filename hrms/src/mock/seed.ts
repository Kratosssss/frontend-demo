import type { HrmsDatabase, Permission } from '@/types/models'

const createdAt = '2026-08-01T08:00:00.000Z'
const stamp = { createdAt, updatedAt: createdAt }

const permissionRows: Array<[string, string, string | null, 'menu' | 'action', string | null]> = [
  ['dashboard:view', '工作台', null, 'menu', '/dashboard'],
  ['employee:view', '员工管理', null, 'menu', '/employees'],
  ['employee:create', '新增员工', 'employee:view', 'action', null],
  ['employee:update', '编辑员工', 'employee:view', 'action', null],
  ['employee:delete', '删除员工', 'employee:view', 'action', null],
  ['department:view', '部门管理', null, 'menu', '/departments'],
  ['department:create', '新增部门', 'department:view', 'action', null],
  ['department:update', '编辑部门', 'department:view', 'action', null],
  ['department:delete', '删除部门', 'department:view', 'action', null],
  ['attendance:view', '考勤管理', null, 'menu', '/attendance'],
  ['attendance:create', '新增考勤', 'attendance:view', 'action', null],
  ['attendance:update', '编辑考勤', 'attendance:view', 'action', null],
  ['attendance:delete', '删除考勤', 'attendance:view', 'action', null],
  ['leave:view', '请假审批', null, 'menu', '/leave'],
  ['leave:create', '发起请假', 'leave:view', 'action', null],
  ['leave:update', '编辑请假', 'leave:view', 'action', null],
  ['leave:approve', '审批请假', 'leave:view', 'action', null],
  ['leave:withdraw', '撤销请假', 'leave:view', 'action', null],
  ['leave:delete', '删除请假', 'leave:view', 'action', null],
  ['user:view', '用户管理', null, 'menu', '/system/users'],
  ['user:create', '新增用户', 'user:view', 'action', null],
  ['user:update', '编辑用户', 'user:view', 'action', null],
  ['user:delete', '删除用户', 'user:view', 'action', null],
  ['user:reset-password', '重置密码', 'user:view', 'action', null],
  ['role:view', '角色管理', null, 'menu', '/system/roles'],
  ['role:create', '新增角色', 'role:view', 'action', null],
  ['role:update', '编辑角色', 'role:view', 'action', null],
  ['role:delete', '删除角色', 'role:view', 'action', null],
  ['permission:view', '权限管理', null, 'menu', '/system/permissions'],
  ['permission:create', '新增权限', 'permission:view', 'action', null],
  ['permission:update', '编辑权限', 'permission:view', 'action', null],
  ['permission:delete', '删除权限', 'permission:view', 'action', null],
]

const permissions: Permission[] = permissionRows.map(([code, name, parentCode, type, routePath], index) => ({
  id: `perm_${index + 1}`,
  code,
  name,
  parentId: parentCode ? `perm_${permissionRows.findIndex(([item]) => item === parentCode) + 1}` : null,
  type,
  routePath,
  sort: index + 1,
  status: 'enabled',
  builtin: true,
  ...stamp,
}))

const allPermissions = permissions.map((item) => item.code)
const hrPermissions = allPermissions.filter((code) =>
  ['dashboard:', 'employee:', 'department:', 'attendance:', 'leave:'].some((prefix) => code.startsWith(prefix)),
)
const employeePermissions = ['dashboard:view', 'attendance:view', 'leave:view', 'leave:create', 'leave:update', 'leave:withdraw']

export const createSeedDatabase = (): HrmsDatabase => ({
  version: 1,
  sessionVersion: crypto.randomUUID(),
  departments: [
    { id: 'dept_hq', code: 'HQ', name: '总经办', parentId: null, managerEmployeeId: 'emp_001', sort: 1, status: 'enabled', ...stamp },
    { id: 'dept_hr', code: 'HR', name: '人力资源部', parentId: null, managerEmployeeId: 'emp_002', sort: 2, status: 'enabled', ...stamp },
    { id: 'dept_rd', code: 'RD', name: '研发中心', parentId: null, managerEmployeeId: 'emp_003', sort: 3, status: 'enabled', ...stamp },
    { id: 'dept_fe', code: 'FE', name: '前端组', parentId: 'dept_rd', managerEmployeeId: 'emp_004', sort: 1, status: 'enabled', ...stamp },
  ],
  employees: [
    { id: 'emp_001', employeeNo: 'HR001', name: '陈明', gender: 'male', mobile: '13800000001', email: 'chenming@example.com', departmentId: 'dept_hq', position: '总经理', hireDate: '2020-03-16', status: 'active', ...stamp },
    { id: 'emp_002', employeeNo: 'HR002', name: '林悦', gender: 'female', mobile: '13800000002', email: 'linyue@example.com', departmentId: 'dept_hr', position: 'HR 经理', hireDate: '2021-05-10', status: 'active', ...stamp },
    { id: 'emp_003', employeeNo: 'HR003', name: '周航', gender: 'male', mobile: '13800000003', email: 'zhouhang@example.com', departmentId: 'dept_rd', position: '技术总监', hireDate: '2021-09-01', status: 'active', ...stamp },
    { id: 'emp_004', employeeNo: 'HR004', name: '苏晚', gender: 'female', mobile: '13800000004', email: 'suwan@example.com', departmentId: 'dept_fe', position: '前端工程师', hireDate: '2023-02-20', status: 'active', ...stamp },
    { id: 'emp_005', employeeNo: 'HR005', name: '许晨', gender: 'male', mobile: '13800000005', email: 'xuchen@example.com', departmentId: 'dept_fe', position: '前端工程师', hireDate: '2025-06-09', status: 'active', ...stamp },
  ],
  attendance: [
    { id: 'att_001', employeeId: 'emp_002', date: '2026-08-10', checkIn: '09:02', checkOut: '18:12', status: 'normal', remark: '', ...stamp },
    { id: 'att_002', employeeId: 'emp_004', date: '2026-08-10', checkIn: '09:18', checkOut: '18:05', status: 'late', remark: '早高峰拥堵', ...stamp },
    { id: 'att_003', employeeId: 'emp_005', date: '2026-08-10', checkIn: '08:55', checkOut: '17:40', status: 'early_leave', remark: '外出就医', ...stamp },
    { id: 'att_004', employeeId: 'emp_004', date: '2026-08-11', checkIn: '08:58', checkOut: '18:10', status: 'normal', remark: '', ...stamp },
  ],
  leaveRequests: [
    { id: 'leave_001', applicantEmployeeId: 'emp_004', type: 'annual', startTime: '2026-08-15T01:00:00.000Z', endTime: '2026-08-16T10:00:00.000Z', duration: 1.5, reason: '家庭出行', status: 'pending', approverUserId: null, approvalComment: '', submittedAt: createdAt, approvedAt: null, ...stamp },
    { id: 'leave_002', applicantEmployeeId: 'emp_005', type: 'sick', startTime: '2026-08-06T01:00:00.000Z', endTime: '2026-08-06T10:00:00.000Z', duration: 1, reason: '感冒就医', status: 'approved', approverUserId: 'user_hr', approvalComment: '同意，注意休息', submittedAt: createdAt, approvedAt: '2026-08-05T09:00:00.000Z', ...stamp },
  ],
  permissions,
  roles: [
    { id: 'role_admin', code: 'SUPER_ADMIN', name: '超级管理员', description: '系统全部权限', permissionCodes: allPermissions, status: 'enabled', builtin: true, ...stamp },
    { id: 'role_hr', code: 'HR_SPECIALIST', name: 'HR 专员', description: '维护人事、考勤并审批请假', permissionCodes: hrPermissions, status: 'enabled', builtin: true, ...stamp },
    { id: 'role_employee', code: 'EMPLOYEE', name: '普通员工', description: '查看本人考勤并维护本人请假', permissionCodes: employeePermissions, status: 'enabled', builtin: true, ...stamp },
  ],
  users: [
    { id: 'user_admin', username: 'admin', displayName: '系统管理员', employeeId: 'emp_001', roleIds: ['role_admin'], status: 'enabled', password: 'admin123', ...stamp },
    { id: 'user_hr', username: 'hr', displayName: '林悦', employeeId: 'emp_002', roleIds: ['role_hr'], status: 'enabled', password: 'hr123456', ...stamp },
    { id: 'user_employee', username: 'employee', displayName: '苏晚', employeeId: 'emp_004', roleIds: ['role_employee'], status: 'enabled', password: 'employee123', ...stamp },
  ],
})
