<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import PageHeader from '@/components/common/PageHeader.vue'
import StatusTag from '@/components/common/StatusTag.vue'
import { leaveApi } from '@/api/modules/leave'
import { employeeApi } from '@/api/modules/employees'
import { leaveTypeOptions, labelOf } from '@/constants/options'
import { useAuthStore } from '@/stores/auth'
import type { Employee, LeaveRequest } from '@/types/models'
import { formatDate } from '@/utils/data'
import { confirmAction, promptAction } from '@/utils/dialog'

const auth = useAuthStore()
const loading = ref(false)
const rows = ref<LeaveRequest[]>([])
const employees = ref<Employee[]>([])
const total = ref(0)
const query = reactive({ page: 1, pageSize: 10, scope: auth.hasPermission('leave:approve') ? 'pending' : 'mine', status: '' })
const dialog = reactive({ open: false, mode: 'create' as 'create' | 'edit' | 'view', title: '' })
const formRef = ref<FormInstance>()
const emptyForm = () => ({ id: '', type: 'annual' as LeaveRequest['type'], range: [] as string[], reason: '' })
const form = reactive(emptyForm())
const rules: FormRules = { type: [{ required: true, message: '请选择请假类型', trigger: 'change' }], range: [{ type: 'array', required: true, min: 2, message: '请选择起止时间', trigger: 'change' }], reason: [{ required: true, message: '请填写请假原因', trigger: 'blur' }] }
const canApprove = computed(() => auth.hasPermission('leave:approve'))
const employeeName = (id: string) => employees.value.find((item) => item.id === id)?.name ?? (id === auth.user?.employeeId ? auth.user.displayName : '—')
const load = async () => { loading.value = true; try { const result = await leaveApi.list(query); rows.value = result.list; total.value = result.total } finally { loading.value = false } }
const openDialog = (mode: typeof dialog.mode, row?: LeaveRequest) => { Object.assign(form, emptyForm(), row ? { ...row, range: [row.startTime, row.endTime] } : {}); Object.assign(dialog, { open: true, mode, title: mode === 'create' ? '发起请假' : mode === 'edit' ? '编辑申请' : '申请详情' }) }
const submit = async () => { if (!await formRef.value?.validate()) return; const input = { type: form.type, startTime: form.range[0], endTime: form.range[1], reason: form.reason }; if (dialog.mode === 'create') await leaveApi.create(input); else await leaveApi.update(form.id, input); ElMessage.success('请假申请已保存'); dialog.open = false; await load() }
const review = async (row: LeaveRequest, action: 'approve' | 'reject') => { const value = await promptAction(action === 'approve' ? '可填写审批意见' : '请填写驳回原因', action === 'approve' ? '批准申请' : '驳回申请', { inputValidator: (value) => action === 'approve' || Boolean(value) || '驳回时必须填写原因', confirmButtonText: action === 'approve' ? '批准' : '驳回', cancelButtonText: '取消' }); if (value === null) return; if (action === 'approve') await leaveApi.approve(row.id, value); else await leaveApi.reject(row.id, value); ElMessage.success(action === 'approve' ? '申请已批准' : '申请已驳回'); await load() }
const withdraw = async (row: LeaveRequest) => { if (!await confirmAction('确定撤销这份请假申请吗？', '撤销申请', { type: 'warning' })) return; await leaveApi.withdraw(row.id); ElMessage.success('申请已撤销'); await load() }
const remove = async (row: LeaveRequest) => { if (!await confirmAction('确定删除这条申请记录吗？', '删除记录', { type: 'warning' })) return; await leaveApi.remove(row.id); ElMessage.success('记录已删除'); await load() }
onMounted(async () => { if (auth.hasPermission('employee:view')) { const result = await employeeApi.list({ pageSize: 100 }); employees.value = result.list } await load() })
</script>

<template>
  <div class="page">
    <PageHeader title="请假审批" description="提交请假申请，并跟踪审批状态与意见。"><el-button v-permission="'leave:create'" type="primary" icon="Plus" @click="openDialog('create')">发起请假</el-button></PageHeader>
    <section class="panel filter-bar"><el-segmented v-if="canApprove" v-model="query.scope" :options="[{ label: '待我审批', value: 'pending' }, { label: '全部申请', value: 'all' }, { label: '我的申请', value: 'mine' }]" @change="query.page = 1; load()" /><el-select v-model="query.status" clearable placeholder="全部状态" @change="query.page = 1; load()"><el-option label="待审批" value="pending" /><el-option label="已批准" value="approved" /><el-option label="已驳回" value="rejected" /><el-option label="已撤销" value="withdrawn" /></el-select><el-button type="primary" @click="load">刷新</el-button></section>
    <section class="panel"><el-table v-loading="loading" :data="rows"><el-table-column label="申请人" min-width="100"><template #default="{ row }">{{ employeeName(row.applicantEmployeeId) }}</template></el-table-column><el-table-column label="类型" width="90"><template #default="{ row }">{{ labelOf(leaveTypeOptions, row.type) }}</template></el-table-column><el-table-column label="起止时间" min-width="220"><template #default="{ row }">{{ formatDate(row.startTime) }} 至 {{ formatDate(row.endTime) }}</template></el-table-column><el-table-column prop="duration" label="时长(天)" width="90" /><el-table-column prop="reason" label="原因" min-width="180" show-overflow-tooltip /><el-table-column label="状态" width="100"><template #default="{ row }"><StatusTag :status="row.status" /></template></el-table-column><el-table-column label="操作" width="300" fixed="right"><template #default="{ row }"><div class="table-actions"><el-button link type="primary" @click="openDialog('view', row)">查看</el-button><template v-if="row.status === 'pending' && row.applicantEmployeeId === auth.user?.employeeId"><el-button v-permission="'leave:update'" link type="primary" @click="openDialog('edit', row)">编辑</el-button><el-button v-permission="'leave:withdraw'" link type="warning" @click="withdraw(row)">撤销</el-button></template><template v-if="row.status === 'pending' && canApprove"><el-button link type="success" @click="review(row, 'approve')">批准</el-button><el-button link type="danger" @click="review(row, 'reject')">驳回</el-button></template><el-button v-if="['rejected', 'withdrawn'].includes(row.status)" v-permission="'leave:delete'" link type="danger" @click="remove(row)">删除</el-button></div></template></el-table-column></el-table><div class="pagination"><el-pagination v-model:current-page="query.page" v-model:page-size="query.pageSize" :total="total" layout="total, sizes, prev, pager, next" @change="load" /></div></section>
    <el-dialog v-model="dialog.open" :title="dialog.title" width="620px"><el-form ref="formRef" :model="form" :rules="rules" label-position="top" :disabled="dialog.mode === 'view'"><el-form-item label="请假类型" prop="type"><el-select v-model="form.type" style="width: 100%"><el-option v-for="item in leaveTypeOptions" :key="item.value" :label="item.label" :value="item.value" /></el-select></el-form-item><el-form-item label="起止时间" prop="range"><el-date-picker v-model="form.range" type="datetimerange" value-format="YYYY-MM-DDTHH:mm:ss.sssZ" start-placeholder="开始时间" end-placeholder="结束时间" style="width: 100%" /></el-form-item><el-form-item label="请假原因" prop="reason"><el-input v-model="form.reason" type="textarea" :rows="4" maxlength="300" show-word-limit /></el-form-item><el-alert v-if="dialog.mode === 'view' && rows.find(item => item.id === form.id)?.approvalComment" :title="`审批意见：${rows.find(item => item.id === form.id)?.approvalComment}`" type="info" :closable="false" /></el-form><template #footer><el-button @click="dialog.open = false">{{ dialog.mode === 'view' ? '关闭' : '取消' }}</el-button><el-button v-if="dialog.mode !== 'view'" type="primary" @click="submit">提交</el-button></template></el-dialog>
  </div>
</template>
