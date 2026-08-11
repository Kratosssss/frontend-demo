import type { RouteRecordRaw } from 'vue-router'

export const appRoutes: RouteRecordRaw[] = [
  { path: '/dashboard', name: 'dashboard', component: () => import('@/views/dashboard/DashboardView.vue'), meta: { title: '工作台', permission: 'dashboard:view', icon: 'DataBoard' } },
  { path: '/employees', name: 'employees', component: () => import('@/views/employees/EmployeesView.vue'), meta: { title: '员工管理', permission: 'employee:view', icon: 'User' } },
  { path: '/departments', name: 'departments', component: () => import('@/views/departments/DepartmentsView.vue'), meta: { title: '部门管理', permission: 'department:view', icon: 'OfficeBuilding' } },
  { path: '/attendance', name: 'attendance', component: () => import('@/views/attendance/AttendanceView.vue'), meta: { title: '考勤管理', permission: 'attendance:view', icon: 'Calendar' } },
  { path: '/leave', name: 'leave', component: () => import('@/views/leave/LeaveView.vue'), meta: { title: '请假审批', permission: 'leave:view', icon: 'DocumentChecked' } },
  { path: '/system/users', name: 'users', component: () => import('@/views/system/users/UsersView.vue'), meta: { title: '用户管理', permission: 'user:view', icon: 'Avatar' } },
  { path: '/system/roles', name: 'roles', component: () => import('@/views/system/roles/RolesView.vue'), meta: { title: '角色管理', permission: 'role:view', icon: 'UserFilled' } },
  { path: '/system/permissions', name: 'permissions', component: () => import('@/views/system/permissions/PermissionsView.vue'), meta: { title: '权限管理', permission: 'permission:view', icon: 'Lock' } },
]
