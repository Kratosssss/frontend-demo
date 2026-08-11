import { createToken, hasPermission, resolveUser, toSafeUser, userPermissions } from './auth'
import { createSeedDatabase } from './seed'

describe('mock authorization', () => {
  it('resolves role permissions and excludes disabled permissions', () => {
    const db = createSeedDatabase()
    const employee = db.users.find((item) => item.id === 'user_employee')!
    expect(userPermissions(employee, db)).toContain('leave:create')
    expect(hasPermission(employee, db, 'employee:view')).toBe(false)
    db.permissions.find((item) => item.code === 'leave:create')!.status = 'disabled'
    expect(hasPermission(employee, db, 'leave:create')).toBe(false)
  })

  it('never exposes the mock password in a safe user', () => {
    const db = createSeedDatabase()
    expect(toSafeUser(db.users[0], db)).not.toHaveProperty('password')
  })

  it('invalidates old tokens after the session version changes', () => {
    const db = createSeedDatabase()
    const token = createToken(db.users[0], db)
    expect(resolveUser(token, db)?.id).toBe('user_admin')
    db.sessionVersion = crypto.randomUUID()
    expect(resolveUser(token, db)).toBeNull()
  })
})
