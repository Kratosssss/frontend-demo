import MockAdapter from 'axios-mock-adapter'
import { http } from '@/api/http'
import { hasPermission, resolveUser, toSafeUser, userPermissions } from '../auth'
import { readDatabase, resetDatabase, updateDatabase } from '../database'
import { createToken } from '../auth'
import { calcDuration, newId, nowIso, paginate } from '@/utils/data'
import type { AxiosRequestConfig } from 'axios'
import type { HrmsDatabase, HrmsUser, LeaveStatus } from '@/types/models'

type MockReply = [number, unknown]
const ok = <T>(data: T, message = '操作成功'): MockReply => [200, { code: 0, message, data }]
const fail = (status: number, message: string): MockReply => [status, { code: status, message, data: null }]
const bodyOf = <T>(config: AxiosRequestConfig) => JSON.parse(config.data || '{}') as T
const paramsOf = (config: AxiosRequestConfig) => config.params ?? {}
const tokenOf = (config: AxiosRequestConfig) => String(config.headers?.Authorization ?? '').replace(/^Bearer\s+/, '')

const authorize = (config: AxiosRequestConfig, permission?: string) => {
  const db = readDatabase()
  const user = resolveUser(tokenOf(config), db)
  if (!user) return { error: fail(401, '登录状态已失效，请重新登录') }
  if (permission && !hasPermission(user, db, permission)) return { error: fail(403, '没有执行此操作的权限') }
  return { db, user }
}

const includesKeyword = (values: unknown[], keyword = '') =>
  !keyword || values.some((value) => String(value ?? '').toLowerCase().includes(keyword.toLowerCase()))

const duplicate = <T extends { id: string }>(items: T[], key: keyof T, value: unknown, exceptId?: string) =>
  items.some((item) => item.id !== exceptId && item[key] === value)

const current = (db: HrmsDatabase, user: HrmsUser) => ({
  user: toSafeUser(user, db),
  permissions: userPermissions(user, db),
})

export const installMock = () => {
  const mock = new MockAdapter(http, { delayResponse: 180 })

  mock.onPost('/auth/login').reply((config) => {
    const { username, password } = bodyOf<{ username: string; password: string }>(config)
    const db = readDatabase()
    const user = db.users.find((item) => item.username === username && item.password === password)
    if (!user) return fail(400, '用户名或密码错误')
    if (user.status !== 'enabled') return fail(403, '账号已停用')
    const enabledRole = db.roles.some((role) => user.roleIds.includes(role.id) && role.status === 'enabled')
    if (!enabledRole) return fail(403, '账号没有可用角色')
    return ok({ token: createToken(user, db), ...current(db, user) }, '登录成功')
  })

  mock.onGet('/auth/me').reply((config) => {
    const auth = authorize(config)
    if (auth.error) return auth.error
    return ok(current(auth.db!, auth.user!))
  })

  mock.onPost('/auth/logout').reply(() => ok(null, '已退出登录'))

  mock.onPost('/mock/reset').reply((config) => {
    const auth = authorize(config)
    if (auth.error) return auth.error
    resetDatabase()
    return ok(null, '演示数据已恢复，请重新登录')
  })

  mock.onGet('/employees').reply((config) => {
    const auth = authorize(config, 'employee:view')
    if (auth.error) return auth.error
    const { page = 1, pageSize = 10, keyword = '', departmentId, status } = paramsOf(config)
    const list = auth.db!.employees.filter((item) =>
      includesKeyword([item.employeeNo, item.name, item.mobile, item.email, item.position], keyword)
      && (!departmentId || item.departmentId === departmentId)
      && (!status || item.status === status),
    )
    return ok(paginate(list, Number(page), Number(pageSize)))
  })

  mock.onPost('/employees').reply((config) => {
    const auth = authorize(config, 'employee:create')
    if (auth.error) return auth.error
    const input = bodyOf<any>(config)
    if (duplicate(auth.db!.employees, 'employeeNo', input.employeeNo)) return fail(400, '工号已存在')
    let created: any
    updateDatabase((db) => {
      created = { ...input, id: newId('emp'), createdAt: nowIso(), updatedAt: nowIso() }
      db.employees.push(created)
    })
    return ok(created, '员工已新增')
  })

  mock.onPut(/^\/employees\/.+/).reply((config) => {
    const auth = authorize(config, 'employee:update')
    if (auth.error) return auth.error
    const id = config.url!.split('/').pop()!
    const input = bodyOf<any>(config)
    if (duplicate(auth.db!.employees, 'employeeNo', input.employeeNo, id)) return fail(400, '工号已存在')
    let updated: any
    updateDatabase((db) => {
      const index = db.employees.findIndex((item) => item.id === id)
      if (index >= 0) db.employees[index] = updated = { ...db.employees[index], ...input, id, updatedAt: nowIso() }
    })
    return updated ? ok(updated, '员工已更新') : fail(404, '员工不存在')
  })

  mock.onDelete(/^\/employees\/.+/).reply((config) => {
    const auth = authorize(config, 'employee:delete')
    if (auth.error) return auth.error
    const id = config.url!.split('/').pop()!
    const hasReferences = auth.db!.users.some((item) => item.employeeId === id)
      || auth.db!.attendance.some((item) => item.employeeId === id)
      || auth.db!.leaveRequests.some((item) => item.applicantEmployeeId === id)
    if (hasReferences) return fail(400, '员工已关联账号或业务记录，请改为停用')
    updateDatabase((db) => { db.employees = db.employees.filter((item) => item.id !== id) })
    return ok(null, '员工已删除')
  })

  mock.onGet('/departments').reply((config) => {
    const auth = authorize(config, 'department:view')
    if (auth.error) return auth.error
    const { keyword = '', status } = paramsOf(config)
    return ok(auth.db!.departments
      .filter((item) => includesKeyword([item.code, item.name], keyword) && (!status || item.status === status))
      .sort((a, b) => a.sort - b.sort))
  })

  mock.onPost('/departments').reply((config) => {
    const auth = authorize(config, 'department:create')
    if (auth.error) return auth.error
    const input = bodyOf<any>(config)
    if (duplicate(auth.db!.departments, 'code', input.code)) return fail(400, '部门编码已存在')
    let created: any
    updateDatabase((db) => {
      created = { ...input, id: newId('dept'), createdAt: nowIso(), updatedAt: nowIso() }
      db.departments.push(created)
    })
    return ok(created, '部门已新增')
  })

  mock.onPut(/^\/departments\/.+/).reply((config) => {
    const auth = authorize(config, 'department:update')
    if (auth.error) return auth.error
    const id = config.url!.split('/').pop()!
    const input = bodyOf<any>(config)
    if (input.parentId === id) return fail(400, '上级部门不能选择自身')
    if (duplicate(auth.db!.departments, 'code', input.code, id)) return fail(400, '部门编码已存在')
    let updated: any
    updateDatabase((db) => {
      const index = db.departments.findIndex((item) => item.id === id)
      if (index >= 0) db.departments[index] = updated = { ...db.departments[index], ...input, id, updatedAt: nowIso() }
    })
    return updated ? ok(updated, '部门已更新') : fail(404, '部门不存在')
  })

  mock.onDelete(/^\/departments\/.+/).reply((config) => {
    const auth = authorize(config, 'department:delete')
    if (auth.error) return auth.error
    const id = config.url!.split('/').pop()!
    if (auth.db!.departments.some((item) => item.parentId === id) || auth.db!.employees.some((item) => item.departmentId === id)) {
      return fail(400, '部门存在子部门或员工，请先处理关联数据')
    }
    updateDatabase((db) => { db.departments = db.departments.filter((item) => item.id !== id) })
    return ok(null, '部门已删除')
  })

  mock.onGet('/attendance').reply((config) => {
    const auth = authorize(config, 'attendance:view')
    if (auth.error) return auth.error
    const { page = 1, pageSize = 10, employeeId, departmentId, status, startDate, endDate } = paramsOf(config)
    const isEmployee = !hasPermission(auth.user!, auth.db!, 'attendance:create')
    const permittedEmployeeId = isEmployee ? auth.user!.employeeId : employeeId
    const list = auth.db!.attendance.filter((item) => {
      const employee = auth.db!.employees.find((row) => row.id === item.employeeId)
      return (!permittedEmployeeId || item.employeeId === permittedEmployeeId)
        && (!departmentId || employee?.departmentId === departmentId)
        && (!status || item.status === status)
        && (!startDate || item.date >= startDate)
        && (!endDate || item.date <= endDate)
    }).sort((a, b) => b.date.localeCompare(a.date))
    return ok(paginate(list, Number(page), Number(pageSize)))
  })

  mock.onPost('/attendance').reply((config) => {
    const auth = authorize(config, 'attendance:create')
    if (auth.error) return auth.error
    const input = bodyOf<any>(config)
    if (auth.db!.attendance.some((item) => item.employeeId === input.employeeId && item.date === input.date)) return fail(400, '该员工当天已有考勤记录')
    let created: any
    updateDatabase((db) => {
      created = { ...input, id: newId('att'), createdAt: nowIso(), updatedAt: nowIso() }
      db.attendance.push(created)
    })
    return ok(created, '考勤记录已新增')
  })

  mock.onPut(/^\/attendance\/.+/).reply((config) => {
    const auth = authorize(config, 'attendance:update')
    if (auth.error) return auth.error
    const id = config.url!.split('/').pop()!
    const input = bodyOf<any>(config)
    if (auth.db!.attendance.some((item) => item.id !== id && item.employeeId === input.employeeId && item.date === input.date)) return fail(400, '该员工当天已有考勤记录')
    let updated: any
    updateDatabase((db) => {
      const index = db.attendance.findIndex((item) => item.id === id)
      if (index >= 0) db.attendance[index] = updated = { ...db.attendance[index], ...input, id, updatedAt: nowIso() }
    })
    return updated ? ok(updated, '考勤记录已更新') : fail(404, '考勤记录不存在')
  })

  mock.onDelete(/^\/attendance\/.+/).reply((config) => {
    const auth = authorize(config, 'attendance:delete')
    if (auth.error) return auth.error
    const id = config.url!.split('/').pop()!
    updateDatabase((db) => { db.attendance = db.attendance.filter((item) => item.id !== id) })
    return ok(null, '考勤记录已删除')
  })

  mock.onGet('/leave-requests').reply((config) => {
    const auth = authorize(config, 'leave:view')
    if (auth.error) return auth.error
    const { page = 1, pageSize = 10, scope = 'all', status } = paramsOf(config)
    let list = auth.db!.leaveRequests
    const canApprove = hasPermission(auth.user!, auth.db!, 'leave:approve')
    if (!canApprove || scope === 'mine') list = list.filter((item) => item.applicantEmployeeId === auth.user!.employeeId)
    if (scope === 'pending') list = list.filter((item) => item.status === 'pending')
    if (status) list = list.filter((item) => item.status === status)
    return ok(paginate([...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt)), Number(page), Number(pageSize)))
  })

  mock.onPost('/leave-requests').reply((config) => {
    const auth = authorize(config, 'leave:create')
    if (auth.error) return auth.error
    if (!auth.user!.employeeId) return fail(400, '当前用户未关联员工')
    const input = bodyOf<any>(config)
    if (new Date(input.endTime) <= new Date(input.startTime)) return fail(400, '结束时间必须晚于开始时间')
    let created: any
    updateDatabase((db) => {
      created = { ...input, id: newId('leave'), applicantEmployeeId: auth.user!.employeeId, duration: calcDuration(input.startTime, input.endTime), status: 'pending', approverUserId: null, approvalComment: '', submittedAt: nowIso(), approvedAt: null, createdAt: nowIso(), updatedAt: nowIso() }
      db.leaveRequests.push(created)
    })
    return ok(created, '请假申请已提交')
  })

  mock.onPut(/^\/leave-requests\/[^/]+$/).reply((config) => {
    const auth = authorize(config, 'leave:update')
    if (auth.error) return auth.error
    const id = config.url!.split('/').pop()!
    const input = bodyOf<any>(config)
    const original = auth.db!.leaveRequests.find((item) => item.id === id)
    if (!original) return fail(404, '申请不存在')
    if (original.applicantEmployeeId !== auth.user!.employeeId || original.status !== 'pending') return fail(400, '只能编辑自己的待审批申请')
    if (new Date(input.endTime) <= new Date(input.startTime)) return fail(400, '结束时间必须晚于开始时间')
    let updated: any
    updateDatabase((db) => {
      const index = db.leaveRequests.findIndex((item) => item.id === id)
      db.leaveRequests[index] = updated = { ...db.leaveRequests[index], ...input, duration: calcDuration(input.startTime, input.endTime), id, updatedAt: nowIso() }
    })
    return ok(updated, '申请已更新')
  })

  mock.onPost(/^\/leave-requests\/[^/]+\/(approve|reject)$/).reply((config) => {
    const auth = authorize(config, 'leave:approve')
    if (auth.error) return auth.error
    const segments = config.url!.split('/')
    const id = segments[2]
    const action = segments[3]
    const original = auth.db!.leaveRequests.find((item) => item.id === id)
    if (!original || original.status !== 'pending') return fail(400, '只能处理待审批申请')
    const { comment = '' } = bodyOf<{ comment?: string }>(config)
    let updated: any
    updateDatabase((db) => {
      const index = db.leaveRequests.findIndex((item) => item.id === id)
      db.leaveRequests[index] = updated = { ...db.leaveRequests[index], status: (action === 'approve' ? 'approved' : 'rejected') as LeaveStatus, approverUserId: auth.user!.id, approvalComment: comment, approvedAt: nowIso(), updatedAt: nowIso() }
    })
    return ok(updated, action === 'approve' ? '申请已批准' : '申请已驳回')
  })

  mock.onPost(/^\/leave-requests\/[^/]+\/withdraw$/).reply((config) => {
    const auth = authorize(config, 'leave:withdraw')
    if (auth.error) return auth.error
    const id = config.url!.split('/')[2]
    const original = auth.db!.leaveRequests.find((item) => item.id === id)
    if (!original || original.applicantEmployeeId !== auth.user!.employeeId || original.status !== 'pending') return fail(400, '只能撤销自己的待审批申请')
    let updated: any
    updateDatabase((db) => {
      const index = db.leaveRequests.findIndex((item) => item.id === id)
      db.leaveRequests[index] = updated = { ...db.leaveRequests[index], status: 'withdrawn' as LeaveStatus, updatedAt: nowIso() }
    })
    return ok(updated, '申请已撤销')
  })

  mock.onDelete(/^\/leave-requests\/.+/).reply((config) => {
    const auth = authorize(config, 'leave:delete')
    if (auth.error) return auth.error
    const id = config.url!.split('/').pop()!
    const original = auth.db!.leaveRequests.find((item) => item.id === id)
    if (!original || !['rejected', 'withdrawn'].includes(original.status)) return fail(400, '只能删除已驳回或已撤销的申请')
    updateDatabase((db) => { db.leaveRequests = db.leaveRequests.filter((item) => item.id !== id) })
    return ok(null, '申请记录已删除')
  })

  mock.onGet('/users').reply((config) => {
    const auth = authorize(config, 'user:view')
    if (auth.error) return auth.error
    const { page = 1, pageSize = 10, keyword = '', status } = paramsOf(config)
    const list = auth.db!.users.filter((item) => includesKeyword([item.username, item.displayName], keyword) && (!status || item.status === status)).map((item) => toSafeUser(item, auth.db!))
    return ok(paginate(list, Number(page), Number(pageSize)))
  })

  mock.onPost('/users').reply((config) => {
    const auth = authorize(config, 'user:create')
    if (auth.error) return auth.error
    const input = bodyOf<any>(config)
    if (duplicate(auth.db!.users, 'username', input.username)) return fail(400, '用户名已存在')
    if (input.employeeId && auth.db!.users.some((item) => item.employeeId === input.employeeId)) return fail(400, '员工已关联其他账号')
    let created: any
    updateDatabase((db) => {
      const raw = { ...input, password: input.password || '123456', id: newId('user'), createdAt: nowIso(), updatedAt: nowIso() }
      db.users.push(raw)
      created = toSafeUser(raw, db)
    })
    return ok(created, '用户已新增')
  })

  mock.onPut(/^\/users\/[^/]+$/).reply((config) => {
    const auth = authorize(config, 'user:update')
    if (auth.error) return auth.error
    const id = config.url!.split('/').pop()!
    const input = bodyOf<any>(config)
    if (id === auth.user!.id && input.status === 'disabled') return fail(400, '不能停用当前登录用户')
    if (duplicate(auth.db!.users, 'username', input.username, id)) return fail(400, '用户名已存在')
    if (input.employeeId && auth.db!.users.some((item) => item.id !== id && item.employeeId === input.employeeId)) return fail(400, '员工已关联其他账号')
    let updated: any
    updateDatabase((db) => {
      const index = db.users.findIndex((item) => item.id === id)
      if (index >= 0) {
        db.users[index] = { ...db.users[index], ...input, id, updatedAt: nowIso() }
        updated = toSafeUser(db.users[index], db)
      }
    })
    return updated ? ok(updated, '用户已更新') : fail(404, '用户不存在')
  })

  mock.onPost(/^\/users\/[^/]+\/reset-password$/).reply((config) => {
    const auth = authorize(config, 'user:reset-password')
    if (auth.error) return auth.error
    const id = config.url!.split('/')[2]
    const { password = '123456' } = bodyOf<{ password?: string }>(config)
    updateDatabase((db) => {
      const user = db.users.find((item) => item.id === id)
      if (user) { user.password = password; user.updatedAt = nowIso() }
    })
    return ok(null, '密码已重置')
  })

  mock.onDelete(/^\/users\/.+/).reply((config) => {
    const auth = authorize(config, 'user:delete')
    if (auth.error) return auth.error
    const id = config.url!.split('/').pop()!
    if (id === auth.user!.id || id === 'user_admin') return fail(400, '不能删除当前用户或内置管理员')
    updateDatabase((db) => { db.users = db.users.filter((item) => item.id !== id) })
    return ok(null, '用户已删除')
  })

  mock.onGet('/roles').reply((config) => {
    const auth = authorize(config, 'role:view')
    if (auth.error) return auth.error
    const list = auth.db!.roles.map((item) => ({ ...item, memberCount: auth.db!.users.filter((user) => user.roleIds.includes(item.id)).length }))
    return ok(list)
  })

  mock.onPost('/roles').reply((config) => {
    const auth = authorize(config, 'role:create')
    if (auth.error) return auth.error
    const input = bodyOf<any>(config)
    if (duplicate(auth.db!.roles, 'code', input.code)) return fail(400, '角色编码已存在')
    let created: any
    updateDatabase((db) => {
      created = { ...input, builtin: false, id: newId('role'), createdAt: nowIso(), updatedAt: nowIso() }
      db.roles.push(created)
    })
    return ok(created, '角色已新增')
  })

  mock.onPut(/^\/roles\/.+/).reply((config) => {
    const auth = authorize(config, 'role:update')
    if (auth.error) return auth.error
    const id = config.url!.split('/').pop()!
    const input = bodyOf<any>(config)
    if (id === 'role_admin' && input.status === 'disabled') return fail(400, '内置超级管理员角色不能停用')
    if (duplicate(auth.db!.roles, 'code', input.code, id)) return fail(400, '角色编码已存在')
    let updated: any
    updateDatabase((db) => {
      const index = db.roles.findIndex((item) => item.id === id)
      if (index >= 0) db.roles[index] = updated = { ...db.roles[index], ...input, id, updatedAt: nowIso() }
    })
    return updated ? ok(updated, '角色已更新') : fail(404, '角色不存在')
  })

  mock.onDelete(/^\/roles\/.+/).reply((config) => {
    const auth = authorize(config, 'role:delete')
    if (auth.error) return auth.error
    const id = config.url!.split('/').pop()!
    const role = auth.db!.roles.find((item) => item.id === id)
    if (role?.builtin) return fail(400, '内置角色不能删除')
    if (auth.db!.users.some((item) => item.roleIds.includes(id))) return fail(400, '角色已绑定用户，不能删除')
    updateDatabase((db) => { db.roles = db.roles.filter((item) => item.id !== id) })
    return ok(null, '角色已删除')
  })

  mock.onGet('/permissions').reply((config) => {
    const auth = authorize(config, 'permission:view')
    if (auth.error) return auth.error
    return ok([...auth.db!.permissions].sort((a, b) => a.sort - b.sort))
  })

  mock.onPost('/permissions').reply((config) => {
    const auth = authorize(config, 'permission:create')
    if (auth.error) return auth.error
    const input = bodyOf<any>(config)
    if (duplicate(auth.db!.permissions, 'code', input.code)) return fail(400, '权限编码已存在')
    let created: any
    updateDatabase((db) => {
      created = { ...input, builtin: false, id: newId('perm'), createdAt: nowIso(), updatedAt: nowIso() }
      db.permissions.push(created)
    })
    return ok(created, '权限已新增')
  })

  mock.onPut(/^\/permissions\/.+/).reply((config) => {
    const auth = authorize(config, 'permission:update')
    if (auth.error) return auth.error
    const id = config.url!.split('/').pop()!
    const input = bodyOf<any>(config)
    if (duplicate(auth.db!.permissions, 'code', input.code, id)) return fail(400, '权限编码已存在')
    let updated: any
    updateDatabase((db) => {
      const index = db.permissions.findIndex((item) => item.id === id)
      if (index >= 0) db.permissions[index] = updated = { ...db.permissions[index], ...input, id, updatedAt: nowIso() }
    })
    return updated ? ok(updated, '权限已更新') : fail(404, '权限不存在')
  })

  mock.onDelete(/^\/permissions\/.+/).reply((config) => {
    const auth = authorize(config, 'permission:delete')
    if (auth.error) return auth.error
    const id = config.url!.split('/').pop()!
    const permission = auth.db!.permissions.find((item) => item.id === id)
    if (permission?.builtin) return fail(400, '内置权限不能删除')
    if (permission && auth.db!.roles.some((item) => item.permissionCodes.includes(permission.code))) return fail(400, '权限已分配给角色，不能删除')
    updateDatabase((db) => { db.permissions = db.permissions.filter((item) => item.id !== id) })
    return ok(null, '权限已删除')
  })

  mock.onGet('/dashboard/summary').reply((config) => {
    const auth = authorize(config, 'dashboard:view')
    if (auth.error) return auth.error
    const db = auth.db!
    const activeEmployees = db.employees.filter((item) => item.status === 'active')
    const today = [...db.attendance].sort((a, b) => b.date.localeCompare(a.date))[0]?.date
    const todayAttendance = db.attendance.filter((item) => item.date === today)
    const departmentStats = db.departments.filter((item) => item.status === 'enabled').map((item) => ({ name: item.name, value: activeEmployees.filter((employee) => employee.departmentId === item.id).length })).filter((item) => item.value > 0)
    const attendanceStats = ['normal', 'late', 'early_leave', 'absent', 'leave'].map((status) => ({ status, value: todayAttendance.filter((item) => item.status === status).length }))
    const trend = Array.from({ length: 6 }, (_, index) => ({ month: `${index + 3}月`, value: Math.max(1, activeEmployees.length - 5 + index) }))
    const canApprove = hasPermission(auth.user!, db, 'leave:approve')
    const pendingLeaves = db.leaveRequests.filter((item) => item.status === 'pending' && (canApprove || item.applicantEmployeeId === auth.user!.employeeId))
    return ok({
      metrics: { employees: activeEmployees.length, departments: db.departments.filter((item) => item.status === 'enabled').length, attendanceRate: todayAttendance.length ? Math.round((todayAttendance.filter((item) => item.status === 'normal').length / todayAttendance.length) * 100) : 100, pendingLeaves: pendingLeaves.length },
      trend,
      departmentStats,
      attendanceStats,
      pendingLeaves: pendingLeaves.slice(0, 5).map((item) => ({ ...item, applicantName: db.employees.find((employee) => employee.id === item.applicantEmployeeId)?.name ?? '未知员工' })),
      recentEmployees: (canApprove ? [...activeEmployees] : activeEmployees.filter((item) => item.id === auth.user!.employeeId)).sort((a, b) => b.hireDate.localeCompare(a.hireDate)).slice(0, 5),
    })
  })

  mock.onAny().reply(() => fail(404, '接口不存在'))
}
