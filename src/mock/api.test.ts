import { beforeEach, describe, expect, it } from 'vitest'
import { http } from '@/api/http'
import { installMock } from './index'
import { resetDatabase } from './database'

installMock()

const login = async (username: string, password: string) => {
  const response = await http.post('/auth/login', { username, password })
  return response.data.data.token as string
}

const config = (token: string) => ({ headers: { Authorization: `Bearer ${token}` } })

describe('mock API business rules', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    resetDatabase()
  })

  it('rejects page and write APIs without the matching permission', async () => {
    const token = await login('employee', 'employee123')
    await expect(http.get('/employees', config(token))).rejects.toMatchObject({ response: { status: 403 } })
    await expect(http.post('/attendance', { employeeId: 'emp_004', date: '2026-08-12', status: 'normal' }, config(token))).rejects.toMatchObject({ response: { status: 403 } })
  })

  it('protects linked departments and duplicate attendance records', async () => {
    const token = await login('admin', 'admin123')
    await expect(http.delete('/departments/dept_fe', config(token))).rejects.toMatchObject({ response: { status: 400 } })
    await expect(http.post('/attendance', { employeeId: 'emp_004', date: '2026-08-10', status: 'normal', checkIn: '09:00', checkOut: '18:00', remark: '' }, config(token))).rejects.toMatchObject({ response: { status: 400 } })
  })

  it('limits ordinary employee leave reads to their own records', async () => {
    const token = await login('employee', 'employee123')
    const response = await http.get('/leave-requests', { ...config(token), params: { scope: 'all' } })
    expect(response.data.data.list.every((item: { applicantEmployeeId: string }) => item.applicantEmployeeId === 'emp_004')).toBe(true)
  })

  it('invalidates the active token when demo data is reset', async () => {
    const token = await login('admin', 'admin123')
    await http.post('/mock/reset', {}, config(token))
    await expect(http.get('/auth/me', config(token))).rejects.toMatchObject({ response: { status: 401 } })
  })
})
