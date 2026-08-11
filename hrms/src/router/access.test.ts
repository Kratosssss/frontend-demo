import { decideRouteAccess } from './access'

describe('route access decisions', () => {
  it('allows public pages', () => expect(decideRouteAccess({ isPublic: true, isLoggedIn: false, hasPermission: false })).toBe('allow'))
  it('redirects anonymous users to login', () => expect(decideRouteAccess({ isPublic: false, isLoggedIn: false, hasPermission: false })).toBe('login'))
  it('distinguishes authenticated users without permission', () => expect(decideRouteAccess({ isPublic: false, isLoggedIn: true, hasPermission: false })).toBe('forbidden'))
  it('allows authenticated users with permission', () => expect(decideRouteAccess({ isPublic: false, isLoggedIn: true, hasPermission: true })).toBe('allow'))
})
