import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { authApi } from '@/api/modules/auth'
import type { SafeUser } from '@/types/models'

const TOKEN_KEY = 'hrms_token'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY) ?? '')
  const user = ref<SafeUser | null>(null)
  const permissions = ref<string[]>([])
  const ready = ref(false)
  const isLoggedIn = computed(() => Boolean(token.value && user.value))

  const saveToken = (value: string, remember: boolean) => {
    localStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(TOKEN_KEY)
    ;(remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, value)
    token.value = value
  }

  const clearSession = () => {
    localStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(TOKEN_KEY)
    token.value = ''
    user.value = null
    permissions.value = []
  }

  const login = async (input: { username: string; password: string; remember: boolean }) => {
    const result = await authApi.login(input)
    saveToken(result.token, input.remember)
    user.value = result.user
    permissions.value = result.permissions
  }

  const restore = async () => {
    if (!token.value) { ready.value = true; return }
    try {
      const result = await authApi.me()
      user.value = result.user
      permissions.value = result.permissions
    } catch {
      clearSession()
    } finally {
      ready.value = true
    }
  }

  const logout = async () => {
    try { await authApi.logout() } finally { clearSession() }
  }

  const hasPermission = (code?: string) => !code || permissions.value.includes(code)

  return { token, user, permissions, ready, isLoggedIn, login, restore, logout, clearSession, hasPermission }
})
