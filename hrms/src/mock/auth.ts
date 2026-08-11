import type { HrmsDatabase, HrmsUser, SafeUser } from '@/types/models'

export const createToken = (user: HrmsUser, db: HrmsDatabase) => btoa(`${user.id}:${db.sessionVersion}`)

export const resolveUser = (token: string | undefined, db: HrmsDatabase) => {
  if (!token) return null
  try {
    const [userId, sessionVersion] = atob(token).split(':')
    if (sessionVersion !== db.sessionVersion) return null
    const user = db.users.find((item) => item.id === userId && item.status === 'enabled')
    return user ?? null
  } catch {
    return null
  }
}

export const userPermissions = (user: HrmsUser, db: HrmsDatabase) => {
  const enabledCodes = new Set(db.permissions.filter((item) => item.status === 'enabled').map((item) => item.code))
  return [...new Set(db.roles
    .filter((role) => user.roleIds.includes(role.id) && role.status === 'enabled')
    .flatMap((role) => role.permissionCodes))]
    .filter((code) => enabledCodes.has(code))
}

export const hasPermission = (user: HrmsUser, db: HrmsDatabase, code: string) => userPermissions(user, db).includes(code)

export const toSafeUser = (user: HrmsUser, db: HrmsDatabase): SafeUser => {
  const { password: _password, ...safe } = user
  return {
    ...safe,
    roleNames: db.roles.filter((role) => user.roleIds.includes(role.id)).map((role) => role.name),
  }
}
