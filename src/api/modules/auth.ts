import { apiData, http } from '@/api/http'
import type { SafeUser } from '@/types/models'

export interface SessionInfo { user: SafeUser; permissions: string[] }
export interface LoginResult extends SessionInfo { token: string }

export const authApi = {
  login: (input: { username: string; password: string }) => apiData<LoginResult>(http.post('/auth/login', input)),
  me: () => apiData<SessionInfo>(http.get('/auth/me')),
  logout: () => apiData<null>(http.post('/auth/logout')),
  reset: () => apiData<null>(http.post('/mock/reset')),
}
