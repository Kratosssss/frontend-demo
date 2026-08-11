<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import PageHeader from '@/components/common/PageHeader.vue'
import StatusTag from '@/components/common/StatusTag.vue'
import { employeeApi } from '@/api/modules/employees'
import { departmentApi } from '@/api/modules/departments'
import { genderOptions, labelOf } from '@/constants/options'
import type { Department, Employee } from '@/types/models'
import { formatDate } from '@/utils/data'
import { confirmAction } from '@/utils/dialog'

const loading = ref(false)
const rows = ref<Employee[]>([])
const departments = ref<Department[]>([])
const total = ref(0)
const query = reactive({ page: 1, pageSize: 10, keyword: '', departmentId: '', status: '' })
const dialog = reactive({ open: false, mode: 'create' as 'create' | 'edit' | 'view', title: '' })
const formRef = ref<FormInstance>()
const emptyForm = () => ({ id: '', employeeNo: '', name: '', gender: 'male' as Employee['gender'], mobile: '', email: '', departmentId: '', position: '', hireDate: '', status: 'active' as Employee['status'] })
const form = reactive(emptyForm())
const rules: FormRules = {
  employeeNo: [{ required: true, message: '请输入工号', trigger: 'blur' }], name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  departmentId: [{ required: true, message: '请选择部门', trigger: 'change' }], position: [{ required: true, message: '请输入岗位', trigger: 'blur' }],
  hireDate: [{ required: true, message: '请选择入职日期', trigger: 'change' }],
  mobile: [{ pattern: /^1\d{10}$/, message: '请输入 11 位手机号', trigger: 'blur' }],
  email: [{ type: 'email', message: '邮箱格式不正确', trigger: 'blur' }],
}
const departmentName = (id: string) => departments.value.find((item) => item.id === id)?.name ?? '—'
const load = async () => {
  loading.value = true
  try { const result = await employeeApi.list(query); rows.value = result.list; total.value = result.total } finally { loading.value = false }
}
const openDialog = (mode: typeof dialog.mode, row?: Employee) => {
  Object.assign(form, emptyForm(), row ?? {})
  Object.assign(dialog, { open: true, mode, title: mode === 'create' ? '新增员工' : mode === 'edit' ? '编辑员工' : '员工详情' })
}
const submit = async () => {
  if (!await formRef.value?.validate()) return
  if (dialog.mode === 'create') await employeeApi.create(form)
  else await employeeApi.update(form.id, form)
  ElMessage.success(dialog.mode === 'create' ? '员工已新增' : '员工已更新')
  dialog.open = false; await load()
}
const remove = async (row: Employee) => {
  if (!await confirmAction(`确定删除员工“${row.name}”吗？有关联记录时系统会阻止删除。`, '删除员工', { type: 'warning' })) return
  await employeeApi.remove(row.id); ElMessage.success('员工已删除'); await load()
}
const search = () => { query.page = 1; load() }
onMounted(async () => { departments.value = await departmentApi.list(); await load() })
</script>

<template>
  <div class="page">
    <PageHeader title="员工管理" description="维护员工档案、组织归属和在职状态。"><el-button v-permission="'employee:create'" type="primary" icon="Plus" @click="openDialog('create')">新增员工</el-button></PageHeader>
    <section class="panel filter-bar">
      <el-input v-model="query.keyword" clearable placeholder="搜索工号、姓名、岗位" prefix-icon="Search" @keyup.enter="search" />
      <el-select v-model="query.departmentId" clearable placeholder="全部部门"><el-option v-for="item in departments" :key="item.id" :label="item.name" :value="item.id" /></el-select>
      <el-select v-model="query.status" clearable placeholder="全部状态"><el-option label="在职" value="active" /><el-option label="停用" value="inactive" /></el-select>
      <el-button type="primary" @click="search">查询</el-button><el-button @click="Object.assign(query, { keyword: '', departmentId: '', status: '', page: 1 }); load()">重置</el-button>
    </section>
    <section class="panel">
      <el-table v-loading="loading" :data="rows" row-key="id">
        <el-table-column prop="employeeNo" label="工号" width="110" /><el-table-column prop="name" label="姓名" width="100" />
        <el-table-column label="部门" min-width="130"><template #default="{ row }">{{ departmentName(row.departmentId) }}</template></el-table-column>
        <el-table-column prop="position" label="岗位" min-width="140" /><el-table-column prop="mobile" label="手机" width="130" />
        <el-table-column label="入职日期" width="130"><template #default="{ row }">{{ formatDate(row.hireDate) }}</template></el-table-column>
        <el-table-column label="状态" width="90"><template #default="{ row }"><StatusTag :status="row.status" /></template></el-table-column>
        <el-table-column label="操作" width="210" fixed="right"><template #default="{ row }"><div class="table-actions"><el-button link type="primary" @click="openDialog('view', row)">查看</el-button><el-button v-permission="'employee:update'" link type="primary" @click="openDialog('edit', row)">编辑</el-button><el-button v-permission="'employee:delete'" link type="danger" @click="remove(row)">删除</el-button></div></template></el-table-column>
      </el-table>
      <div class="pagination"><el-pagination v-model:current-page="query.page" v-model:page-size="query.pageSize" :total="total" layout="total, sizes, prev, pager, next" @change="load" /></div>
    </section>
    <el-dialog v-model="dialog.open" :title="dialog.title" width="680px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" :disabled="dialog.mode === 'view'">
        <el-row :gutter="18"><el-col :sm="12"><el-form-item label="工号" prop="employeeNo"><el-input v-model="form.employeeNo" /></el-form-item></el-col><el-col :sm="12"><el-form-item label="姓名" prop="name"><el-input v-model="form.name" /></el-form-item></el-col></el-row>
        <el-row :gutter="18"><el-col :sm="12"><el-form-item label="性别"><el-select v-model="form.gender" style="width: 100%"><el-option v-for="item in genderOptions" :key="item.value" :label="item.label" :value="item.value" /></el-select></el-form-item></el-col><el-col :sm="12"><el-form-item label="所属部门" prop="departmentId"><el-select v-model="form.departmentId" style="width: 100%"><el-option v-for="item in departments" :key="item.id" :label="item.name" :value="item.id" /></el-select></el-form-item></el-col></el-row>
        <el-row :gutter="18"><el-col :sm="12"><el-form-item label="岗位" prop="position"><el-input v-model="form.position" /></el-form-item></el-col><el-col :sm="12"><el-form-item label="入职日期" prop="hireDate"><el-date-picker v-model="form.hireDate" value-format="YYYY-MM-DD" style="width: 100%" /></el-form-item></el-col></el-row>
        <el-row :gutter="18"><el-col :sm="12"><el-form-item label="手机" prop="mobile"><el-input v-model="form.mobile" /></el-form-item></el-col><el-col :sm="12"><el-form-item label="邮箱" prop="email"><el-input v-model="form.email" /></el-form-item></el-col></el-row>
        <el-form-item label="状态"><el-radio-group v-model="form.status"><el-radio value="active">在职</el-radio><el-radio value="inactive">停用</el-radio></el-radio-group></el-form-item>
        <el-alert v-if="dialog.mode === 'view'" :title="`性别：${labelOf(genderOptions, form.gender)} · 邮箱：${form.email || '未填写'}`" type="info" :closable="false" />
      </el-form>
      <template #footer><el-button @click="dialog.open = false">{{ dialog.mode === 'view' ? '关闭' : '取消' }}</el-button><el-button v-if="dialog.mode !== 'view'" type="primary" @click="submit">保存</el-button></template>
    </el-dialog>
  </div>
</template>
