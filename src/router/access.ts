export type AccessDecision = 'allow' | 'login' | 'forbidden'

export const decideRouteAccess = (input: {
  isPublic: boolean
  isLoggedIn: boolean
  hasPermission: boolean
}): AccessDecision => {
  if (input.isPublic) return 'allow'
  if (!input.isLoggedIn) return 'login'
  return input.hasPermission ? 'allow' : 'forbidden'
}
