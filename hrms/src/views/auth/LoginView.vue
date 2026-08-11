<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const formRef = ref<FormInstance>()
const loading = ref(false)
const form = reactive({ username: 'admin', password: 'admin123', remember: true })
const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}
const accounts = [
  { label: '超级管理员', username: 'admin', password: 'admin123', desc: '全部模块与系统权限' },
  { label: 'HR 专员', username: 'hr', password: 'hr123456', desc: '人事、考勤与审批' },
  { label: '普通员工', username: 'employee', password: 'employee123', desc: '本人考勤与请假' },
]
const fill = (account: typeof accounts[number]) => Object.assign(form, { username: account.username, password: account.password })
const submit = async () => {
  if (!await formRef.value?.validate()) return
  loading.value = true
  try {
    await auth.login(form)
    await router.replace(String(route.query.redirect ?? '/dashboard'))
  } finally { loading.value = false }
}
</script>

<template>
  <main class="login-page">
    <section class="intro">
      <div class="intro__content">
        <div class="logo"><span>H</span> HRMS</div>
        <h1>让人事管理<br><em>更清晰、更高效</em></h1>
        <p>覆盖组织、员工、考勤、审批与权限的企业级管理后台演示。</p>
        <ul><li><el-icon><CircleCheckFilled /></el-icon>完整业务 CRUD 闭环</li><li><el-icon><CircleCheckFilled /></el-icon>菜单、路由、按钮三层权限</li><li><el-icon><CircleCheckFilled /></el-icon>本地持久化，可随时恢复</li></ul>
      </div>
    </section>
    <section class="login-panel">
      <div class="login-card">
        <header><p>欢迎回来</p><h2>登录 HRMS</h2><span>请选择演示身份，或输入账号密码。</span></header>
        <div class="accounts">
          <button v-for="account in accounts" :key="account.username" type="button" :class="{ active: form.username === account.username }" @click="fill(account)"><b>{{ account.label }}</b><small>{{ account.desc }}</small></button>
        </div>
        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @keyup.enter="submit">
          <el-form-item label="用户名" prop="username"><el-input v-model="form.username" size="large" prefix-icon="User" /></el-form-item>
          <el-form-item label="密码" prop="password"><el-input v-model="form.password" type="password" size="large" prefix-icon="Lock" show-password /></el-form-item>
          <div class="remember"><el-checkbox v-model="form.remember">记住登录</el-checkbox><span>仅用于本地 Mock 演示</span></div>
          <el-button type="primary" size="large" :loading="loading" class="submit" @click="submit">登录系统</el-button>
        </el-form>
        <footer>演示环境 · 数据仅保存在当前浏览器</footer>
      </div>
    </section>
  </main>
</template>

<style scoped>
.login-page { display: grid; min-height: 100vh; grid-template-columns: minmax(360px, 1fr) minmax(520px, 1fr); background: #fff; }
.intro { display: grid; position: relative; overflow: hidden; place-items: center; padding: 64px; color: #fff; background: #111827; }
.intro::after { position: absolute; width: 420px; height: 420px; right: -180px; bottom: -180px; border: 80px solid rgb(37 99 235 / 18%); border-radius: 50%; content: ''; }
.intro__content { position: relative; z-index: 1; max-width: 520px; }
.logo { display: flex; align-items: center; gap: 10px; font-size: 18px; font-weight: 700; letter-spacing: .06em; }
.logo span { display: grid; width: 36px; height: 36px; place-items: center; border-radius: 9px; background: var(--hrms-primary); }
h1 { margin: 90px 0 22px; font-size: clamp(38px, 4vw, 58px); line-height: 1.18; letter-spacing: -.03em; }
h1 em { color: #75a7ff; font-style: normal; }
.intro p { max-width: 480px; color: #aeb8c7; font-size: 17px; line-height: 1.8; }
ul { display: grid; margin: 44px 0 0; padding: 0; gap: 18px; list-style: none; } li { display: flex; align-items: center; gap: 10px; color: #d5dae2; } li .el-icon { color: #60a5fa; }
.login-panel { display: grid; place-items: center; padding: 50px; }
.login-card { width: min(100%, 440px); }
header p { margin: 0 0 8px; color: var(--hrms-primary); font-weight: 600; } h2 { margin: 0 0 10px; font-size: 32px; } header span { color: var(--hrms-muted); }
.accounts { display: grid; margin: 28px 0; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.accounts button { padding: 12px 8px; border: 1px solid var(--hrms-border); border-radius: 8px; color: var(--hrms-text); background: #fff; cursor: pointer; text-align: left; }
.accounts button.active { border-color: var(--hrms-primary); box-shadow: 0 0 0 2px rgb(37 99 235 / 12%); }
.accounts b, .accounts small { display: block; } .accounts small { overflow: hidden; margin-top: 5px; color: var(--hrms-muted); font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }
.remember { display: flex; align-items: center; justify-content: space-between; margin-top: -4px; color: var(--hrms-muted); font-size: 12px; }
.submit { width: 100%; margin-top: 20px; } footer { margin-top: 30px; color: #98a2b3; font-size: 12px; text-align: center; }
@media (max-width: 860px) { .login-page { grid-template-columns: 1fr; } .intro { display: none; } .login-panel { padding: 32px 20px; } }
</style>
