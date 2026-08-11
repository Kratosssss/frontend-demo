<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import PageHeader from '@/components/common/PageHeader.vue'
import StatusTag from '@/components/common/StatusTag.vue'
import { userApi, roleApi, type RoleWithCount } from '@/api/modules/system'
import { employeeApi } from '@/api/modules/employees'
import { useAuthStore } from '@/stores/auth'
import type { Employee, SafeUser } from '@/types/models'
import { confirmAction, promptAction } from '@/utils/dialog'

const auth = useAuthStore()
const loading = ref(false)
const rows = ref<SafeUser[]>([])
const employees = ref<Employee[]>([])
const roles = ref<RoleWithCount[]>([])
const total = ref(0)
const query = reactive({ page: 1, pageSize: 10, keyword: '', status: '' })
const dialog = reactive({ open: false, mode: 'create' as 'create' | 'edit' | 'view', title: '' })
const formRef = ref<FormInstance>()
const emptyForm = () => ({ id: '', username: '', displayName: '', employeeId: null as string | null, roleIds: [] as string[], status: 'enabled' as SafeUser['status'], password: '' })
const form = reactive(emptyForm())
const rules: FormRules = { username: [{ required: true, message: '请输入用户名', trigger: 'blur' }], displayName: [{ required: true, message: '请输入显示名', trigger: 'blur' }], roleIds: [{ type: 'array', required: true, min: 1, message: '至少选择一个角色', trigger: 'change' }] }
const employeeName = (id: string | null) => employees.value.find((item) => item.id === id)?.name ?? '未关联'
const load = async () => { loading.value = true; try { const result = await userApi.list(query); rows.value = result.list; total.value = result.total } finally { loading.value = false } }
const openDialog = (mode: typeof dialog.mode, row?: SafeUser) => { Object.assign(form, emptyForm(), row ?? {}); Object.assign(dialog, { open: true, mode, title: mode === 'create' ? '新增用户' : mode === 'edit' ? '编辑用户' : '用户详情' }) }
const submit = async () => { if (!await formRef.value?.validate()) return; if (dialog.mode === 'create') await userApi.create(form); else await userApi.update(form.id, form); ElMessage.success('用户信息已保存'); dialog.open = false; await Promise.all([load(), loadRoles()]) }
const loadRoles = async () => { roles.value = await roleApi.list() }
const remove = async (row: SafeUser) => { if (!await confirmAction(`确定删除账号“${row.username}”吗？`, '删除用户', { type: 'warning' })) return; await userApi.remove(row.id); ElMessage.success('用户已删除'); await Promise.all([load(), loadRoles()]) }
const resetPassword = async (row: SafeUser) => { const value = await promptAction('请输入新密码（至少 6 位）', `重置 ${row.username} 的密码`, { inputValue: '123456', inputType: 'password', inputPattern: /^.{6,}$/, inputErrorMessage: '密码至少 6 位' }); if (value === null) return; await userApi.resetPassword(row.id, value); ElMessage.success('密码已重置') }
onMounted(async () => { const [employeeResult] = await Promise.all([employeeApi.list({ pageSize: 100 }), loadRoles()]); employees.value = employeeResult.list; await load() })
</script>

<template>
  <div class="page">
    <PageHeader title="用户管理" description="维护登录账号、关联员工、角色和账号状态。"><el-button v-permission="'user:create'" type="primary" icon="Plus" @click="openDialog('create')">新增用户</el-button></PageHeader>
    <section class="panel filter-bar"><el-input v-model="query.keyword" clearable placeholder="搜索用户名或显示名" prefix-icon="Search" @keyup.enter="query.page = 1; load()" /><el-select v-model="query.status" clearable placeholder="全部状态"><el-option label="启用" value="enabled" /><el-option label="停用" value="disabled" /></el-select><el-button type="primary" @click="query.page = 1; load()">查询</el-button><el-button @click="Object.assign(query, { keyword: '', status: '', page: 1 }); load()">重置</el-button></section>
    <section class="panel"><el-table v-loading="loading" :data="rows"><el-table-column prop="username" label="用户名" min-width="120" /><el-table-column prop="displayName" label="显示名" min-width="120" /><el-table-column label="关联员工" min-width="120"><template #default="{ row }">{{ employeeName(row.employeeId) }}</template></el-table-column><el-table-column label="角色" min-width="180"><template #default="{ row }"><el-tag v-for="name in row.roleNames" :key="name" class="role-tag" effect="plain">{{ name }}</el-tag></template></el-table-column><el-table-column label="状态" width="90"><template #default="{ row }"><StatusTag :status="row.status" /></template></el-table-column><el-table-column label="操作" width="300" fixed="right"><template #default="{ row }"><div class="table-actions"><el-button link type="primary" @click="openDialog('view', row)">查看</el-button><el-button v-permission="'user:update'" link type="primary" @click="openDialog('edit', row)">编辑</el-button><el-button v-permission="'user:reset-password'" link type="warning" @click="resetPassword(row)">重置密码</el-button><el-button v-if="row.id !== auth.user?.id" v-permission="'user:delete'" link type="danger" @click="remove(row)">删除</el-button></div></template></el-table-column></el-table><div class="pagination"><el-pagination v-model:current-page="query.page" v-model:page-size="query.pageSize" :total="total" layout="total, sizes, prev, pager, next" @change="load" /></div></section>
    <el-dialog v-model="dialog.open" :title="dialog.title" width="620px"><el-form ref="formRef" :model="form" :rules="rules" label-position="top" :disabled="dialog.mode === 'view'"><el-row :gutter="18"><el-col :sm="12"><el-form-item label="用户名" prop="username"><el-input v-model="form.username" /></el-form-item></el-col><el-col :sm="12"><el-form-item label="显示名" prop="displayName"><el-input v-model="form.displayName" /></el-form-item></el-col></el-row><el-row :gutter="18"><el-col :sm="12"><el-form-item label="关联员工"><el-select v-model="form.employeeId" clearable filterable style="width: 100%"><el-option v-for="item in employees" :key="item.id" :label="`${item.name} (${item.employeeNo})`" :value="item.id" /></el-select></el-form-item></el-col><el-col v-if="dialog.mode === 'create'" :sm="12"><el-form-item label="初始密码"><el-input v-model="form.password" type="password" placeholder="默认 123456" show-password /></el-form-item></el-col></el-row><el-form-item label="角色" prop="roleIds"><el-checkbox-group v-model="form.roleIds"><el-checkbox v-for="role in roles.filter(item => item.status === 'enabled')" :key="role.id" :value="role.id">{{ role.name }}</el-checkbox></el-checkbox-group></el-form-item><el-form-item label="状态"><el-radio-group v-model="form.status"><el-radio value="enabled">启用</el-radio><el-radio value="disabled" :disabled="form.id === auth.user?.id">停用</el-radio></el-radio-group></el-form-item></el-form><template #footer><el-button @click="dialog.open = false">{{ dialog.mode === 'view' ? '关闭' : '取消' }}</el-button><el-button v-if="dialog.mode !== 'view'" type="primary" @click="submit">保存</el-button></template></el-dialog>
  </div>
</template>
<style scoped>.role-tag + .role-tag { margin-left: 6px; }</style>
