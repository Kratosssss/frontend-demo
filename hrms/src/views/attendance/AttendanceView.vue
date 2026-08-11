<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import PageHeader from '@/components/common/PageHeader.vue'
import StatusTag from '@/components/common/StatusTag.vue'
import { attendanceApi } from '@/api/modules/attendance'
import { employeeApi } from '@/api/modules/employees'
import { departmentApi } from '@/api/modules/departments'
import { attendanceStatusOptions } from '@/constants/options'
import { useAuthStore } from '@/stores/auth'
import type { AttendanceRecord, Department, Employee } from '@/types/models'
import { confirmAction } from '@/utils/dialog'

const auth = useAuthStore()
const loading = ref(false)
const rows = ref<AttendanceRecord[]>([])
const employees = ref<Employee[]>([])
const departments = ref<Department[]>([])
const total = ref(0)
const query = reactive({ page: 1, pageSize: 10, departmentId: '', status: '', dates: [] as string[] })
const dialog = reactive({ open: false, mode: 'create' as 'create' | 'edit' | 'view', title: '' })
const formRef = ref<FormInstance>()
const emptyForm = () => ({ id: '', employeeId: '', date: '', checkIn: null as string | null, checkOut: null as string | null, status: 'normal' as AttendanceRecord['status'], remark: '' })
const form = reactive(emptyForm())
const rules: FormRules = { employeeId: [{ required: true, message: '请选择员工', trigger: 'change' }], date: [{ required: true, message: '请选择日期', trigger: 'change' }], status: [{ required: true, message: '请选择状态', trigger: 'change' }] }
const employeeName = (id: string) => employees.value.find((item) => item.id === id)?.name ?? (id === auth.user?.employeeId ? auth.user.displayName : '—')
const departmentName = (employeeId: string) => { const employee = employees.value.find((item) => item.id === employeeId); return departments.value.find((item) => item.id === employee?.departmentId)?.name ?? '—' }
const load = async () => { loading.value = true; try { const result = await attendanceApi.list({ ...query, startDate: query.dates?.[0], endDate: query.dates?.[1] }); rows.value = result.list; total.value = result.total } finally { loading.value = false } }
const openDialog = (mode: typeof dialog.mode, row?: AttendanceRecord) => { Object.assign(form, emptyForm(), row ?? {}); Object.assign(dialog, { open: true, mode, title: mode === 'create' ? '新增考勤' : mode === 'edit' ? '编辑考勤' : '考勤详情' }) }
const submit = async () => { if (!await formRef.value?.validate()) return; if (dialog.mode === 'create') await attendanceApi.create(form); else await attendanceApi.update(form.id, form); ElMessage.success('考勤记录已保存'); dialog.open = false; await load() }
const remove = async (row: AttendanceRecord) => { if (!await confirmAction('确定删除这条考勤记录吗？', '删除考勤', { type: 'warning' })) return; await attendanceApi.remove(row.id); ElMessage.success('考勤记录已删除'); await load() }
onMounted(async () => {
  if (auth.hasPermission('employee:view')) { const result = await employeeApi.list({ pageSize: 100 }); employees.value = result.list }
  if (auth.hasPermission('department:view')) departments.value = await departmentApi.list()
  await load()
})
</script>

<template>
  <div class="page">
    <PageHeader title="考勤管理" :description="auth.hasPermission('attendance:create') ? '查询并维护员工每日考勤与异常说明。' : '查看本人的考勤记录与异常状态。'"><el-button v-permission="'attendance:create'" type="primary" icon="Plus" @click="openDialog('create')">新增考勤</el-button></PageHeader>
    <section class="panel filter-bar"><el-date-picker v-model="query.dates" type="daterange" value-format="YYYY-MM-DD" start-placeholder="开始日期" end-placeholder="结束日期" style="width: 260px" /><el-select v-if="departments.length" v-model="query.departmentId" clearable placeholder="全部部门"><el-option v-for="item in departments" :key="item.id" :label="item.name" :value="item.id" /></el-select><el-select v-model="query.status" clearable placeholder="全部状态"><el-option v-for="item in attendanceStatusOptions" :key="item.value" :label="item.label" :value="item.value" /></el-select><el-button type="primary" @click="query.page = 1; load()">查询</el-button><el-button @click="Object.assign(query, { dates: [], departmentId: '', status: '', page: 1 }); load()">重置</el-button></section>
    <section class="panel"><el-table v-loading="loading" :data="rows"><el-table-column prop="date" label="日期" width="120" /><el-table-column label="员工" min-width="110"><template #default="{ row }">{{ employeeName(row.employeeId) }}</template></el-table-column><el-table-column v-if="departments.length" label="部门" min-width="130"><template #default="{ row }">{{ departmentName(row.employeeId) }}</template></el-table-column><el-table-column prop="checkIn" label="上班" width="90"><template #default="{ row }">{{ row.checkIn || '—' }}</template></el-table-column><el-table-column prop="checkOut" label="下班" width="90"><template #default="{ row }">{{ row.checkOut || '—' }}</template></el-table-column><el-table-column label="状态" width="100"><template #default="{ row }"><StatusTag :status="row.status" /></template></el-table-column><el-table-column prop="remark" label="异常说明" min-width="180"><template #default="{ row }">{{ row.remark || '—' }}</template></el-table-column><el-table-column label="操作" width="190" fixed="right"><template #default="{ row }"><div class="table-actions"><el-button link type="primary" @click="openDialog('view', row)">查看</el-button><el-button v-permission="'attendance:update'" link type="primary" @click="openDialog('edit', row)">编辑</el-button><el-button v-permission="'attendance:delete'" link type="danger" @click="remove(row)">删除</el-button></div></template></el-table-column></el-table><div class="pagination"><el-pagination v-model:current-page="query.page" v-model:page-size="query.pageSize" :total="total" layout="total, sizes, prev, pager, next" @change="load" /></div></section>
    <el-dialog v-model="dialog.open" :title="dialog.title" width="600px"><el-form ref="formRef" :model="form" :rules="rules" label-position="top" :disabled="dialog.mode === 'view'"><el-row :gutter="18"><el-col :sm="12"><el-form-item label="员工" prop="employeeId"><el-select v-model="form.employeeId" filterable style="width: 100%"><el-option v-for="item in employees" :key="item.id" :label="`${item.name} (${item.employeeNo})`" :value="item.id" /></el-select></el-form-item></el-col><el-col :sm="12"><el-form-item label="日期" prop="date"><el-date-picker v-model="form.date" value-format="YYYY-MM-DD" style="width: 100%" /></el-form-item></el-col></el-row><el-row :gutter="18"><el-col :sm="12"><el-form-item label="上班时间"><el-time-select v-model="form.checkIn" start="07:00" step="00:05" end="12:00" clearable style="width: 100%" /></el-form-item></el-col><el-col :sm="12"><el-form-item label="下班时间"><el-time-select v-model="form.checkOut" start="15:00" step="00:05" end="23:00" clearable style="width: 100%" /></el-form-item></el-col></el-row><el-form-item label="考勤状态" prop="status"><el-radio-group v-model="form.status"><el-radio v-for="item in attendanceStatusOptions" :key="item.value" :value="item.value">{{ item.label }}</el-radio></el-radio-group></el-form-item><el-form-item label="异常说明"><el-input v-model="form.remark" type="textarea" :rows="3" maxlength="200" show-word-limit /></el-form-item></el-form><template #footer><el-button @click="dialog.open = false">{{ dialog.mode === 'view' ? '关闭' : '取消' }}</el-button><el-button v-if="dialog.mode !== 'view'" type="primary" @click="submit">保存</el-button></template></el-dialog>
  </div>
</template>
