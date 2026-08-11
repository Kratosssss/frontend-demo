<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { appRoutes } from '@/router/routes'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import { authApi } from '@/api/modules/auth'
import { confirmAction } from '@/utils/dialog'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const app = useAppStore()
const visibleRoutes = computed(() => appRoutes.filter((item) => auth.hasPermission(item.meta?.permission as string)))
const routeGroups = computed(() => [
  { label: '', routes: visibleRoutes.value.filter((item) => ['/dashboard'].includes(item.path)) },
  { label: '人力资源', routes: visibleRoutes.value.filter((item) => ['/employees', '/departments'].includes(item.path)) },
  { label: '考勤与审批', routes: visibleRoutes.value.filter((item) => ['/attendance', '/leave'].includes(item.path)) },
  { label: '系统管理', routes: visibleRoutes.value.filter((item) => item.path.startsWith('/system')) },
].filter((item) => item.routes.length))

const isMobile = () => window.innerWidth < 768
const syncResponsive = () => { if (window.innerWidth < 1100 && !isMobile()) app.collapsed = true }
onMounted(() => { syncResponsive(); window.addEventListener('resize', syncResponsive) })
onUnmounted(() => window.removeEventListener('resize', syncResponsive))

const go = (path: string) => { router.push(path); app.mobileOpen = false }
const logout = async () => { await auth.logout(); await router.replace('/login') }
const resetDemo = async () => {
  if (!await confirmAction('这会清除当前所有演示改动并退出登录，确定继续吗？', '恢复演示数据', { type: 'warning', confirmButtonText: '恢复并退出', cancelButtonText: '取消' })) return
  await authApi.reset()
  auth.clearSession()
  ElMessage.success('演示数据已恢复')
  await router.replace('/login')
}
</script>

<template>
  <div class="layout">
    <aside class="sidebar" :class="{ collapsed: app.collapsed }">
      <div class="brand"><span class="brand__mark">H</span><span v-show="!app.collapsed">HRMS</span></div>
      <el-menu :default-active="route.path" :collapse="app.collapsed" background-color="#111827" text-color="#aeb8c7" active-text-color="#fff" @select="go">
        <template v-for="group in routeGroups" :key="group.label">
          <div v-if="group.label && !app.collapsed" class="menu-label">{{ group.label }}</div>
          <el-menu-item v-for="item in group.routes" :key="item.path" :index="item.path">
            <el-icon><component :is="item.meta?.icon" /></el-icon><template #title>{{ item.meta?.title }}</template>
          </el-menu-item>
        </template>
      </el-menu>
    </aside>

    <el-drawer v-model="app.mobileOpen" direction="ltr" size="248px" :with-header="false" class="mobile-drawer">
      <div class="brand"><span class="brand__mark">H</span><span>HRMS</span></div>
      <el-menu :default-active="route.path" background-color="#111827" text-color="#aeb8c7" active-text-color="#fff" @select="go">
        <template v-for="group in routeGroups" :key="group.label">
          <div v-if="group.label" class="menu-label">{{ group.label }}</div>
          <el-menu-item v-for="item in group.routes" :key="item.path" :index="item.path">
            <el-icon><component :is="item.meta?.icon" /></el-icon><template #title>{{ item.meta?.title }}</template>
          </el-menu-item>
        </template>
      </el-menu>
    </el-drawer>

    <section class="workspace">
      <header class="topbar">
        <div class="topbar__left">
          <el-button text class="menu-toggle" aria-label="打开或折叠菜单" @click="isMobile() ? (app.mobileOpen = true) : app.toggleCollapsed()"><el-icon size="20"><Fold /></el-icon></el-button>
          <el-breadcrumb separator="/"><el-breadcrumb-item>HRMS</el-breadcrumb-item><el-breadcrumb-item>{{ route.meta.title }}</el-breadcrumb-item></el-breadcrumb>
        </div>
        <el-dropdown trigger="click">
          <button class="user-menu"><span class="avatar">{{ auth.user?.displayName.slice(0, 1) }}</span><span class="user-meta"><b>{{ auth.user?.displayName }}</b><small>{{ auth.user?.roleNames.join(' / ') }}</small></span><el-icon><ArrowDown /></el-icon></button>
          <template #dropdown><el-dropdown-menu><el-dropdown-item @click="resetDemo"><el-icon><RefreshLeft /></el-icon>恢复演示数据</el-dropdown-item><el-dropdown-item divided @click="logout"><el-icon><SwitchButton /></el-icon>退出登录</el-dropdown-item></el-dropdown-menu></template>
        </el-dropdown>
      </header>
      <main class="main"><router-view /></main>
    </section>
  </div>
</template>

<style scoped>
.layout { display: flex; min-height: 100vh; }
.sidebar { position: sticky; top: 0; width: 236px; height: 100vh; overflow-y: auto; flex: none; color: white; background: var(--hrms-sidebar); transition: width .2s; }
.sidebar.collapsed { width: 64px; }
.brand { display: flex; height: 64px; align-items: center; gap: 10px; padding: 0 18px; color: #fff; font-size: 18px; font-weight: 700; letter-spacing: .04em; }
.brand__mark { display: grid; width: 30px; height: 30px; flex: none; place-items: center; border-radius: 8px; background: var(--hrms-primary); }
.sidebar .el-menu, :deep(.mobile-drawer .el-menu) { border-right: 0; }
.menu-label { padding: 22px 20px 8px; color: #687386; font-size: 11px; font-weight: 600; letter-spacing: .08em; }
.workspace { min-width: 0; flex: 1; }
.topbar { position: sticky; z-index: 10; top: 0; display: flex; height: 64px; align-items: center; justify-content: space-between; padding: 0 24px; border-bottom: 1px solid var(--hrms-border); background: rgb(255 255 255 / 95%); backdrop-filter: blur(10px); }
.topbar__left { display: flex; align-items: center; gap: 10px; }
.user-menu { display: flex; align-items: center; gap: 10px; padding: 6px; border: 0; color: var(--hrms-text); background: transparent; cursor: pointer; }
.avatar { display: grid; width: 34px; height: 34px; place-items: center; border-radius: 50%; color: #fff; background: var(--hrms-primary); font-weight: 600; }
.user-meta { display: flex; flex-direction: column; align-items: flex-start; line-height: 1.25; }
.user-meta small { margin-top: 3px; color: var(--hrms-muted); }
.main { padding: 24px; }
:deep(.mobile-drawer .el-drawer__body) { padding: 0; background: var(--hrms-sidebar); }
@media (max-width: 767px) { .sidebar { display: none; } .topbar { padding: 0 12px; } .main { padding: 16px 12px; } .user-meta, .topbar :deep(.el-breadcrumb__inner:first-child) { display: none; } }
</style>
