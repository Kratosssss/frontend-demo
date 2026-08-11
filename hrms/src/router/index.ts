import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import { appRoutes } from './routes'
import { useAuthStore } from '@/stores/auth'
import { decideRouteAccess } from './access'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/dashboard' },
    { path: '/login', name: 'login', component: () => import('@/views/auth/LoginView.vue'), meta: { title: '登录', public: true } },
    { path: '/', component: AppLayout, children: appRoutes },
    { path: '/403', name: 'forbidden', component: () => import('@/views/error/ForbiddenView.vue'), meta: { title: '无权限' } },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/views/error/NotFoundView.vue'), meta: { title: '页面不存在', public: true } },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  document.title = `${String(to.meta.title ?? 'HRMS')} - HRMS`
  if (!auth.ready) await auth.restore()
  const permission = to.meta.permission as string | undefined
  const decision = decideRouteAccess({ isPublic: Boolean(to.meta.public), isLoggedIn: auth.isLoggedIn, hasPermission: auth.hasPermission(permission) })
  if (decision === 'login') return { path: '/login', query: { redirect: to.fullPath } }
  if (decision === 'forbidden') return '/403'
  return to.path === '/login' && auth.isLoggedIn ? '/dashboard' : true
})
