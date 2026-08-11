<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import PageHeader from '@/components/common/PageHeader.vue'
import StatusTag from '@/components/common/StatusTag.vue'
import { departmentApi } from '@/api/modules/departments'
import { employeeApi } from '@/api/modules/employees'
import type { Department, Employee } from '@/types/models'
import { confirmAction } from '@/utils/dialog'

type DepartmentNode = Department & { children?: DepartmentNode[] }
const loading = ref(false)
const rows = ref<Department[]>([])
const employees = ref<Employee[]>([])
const query = reactive({ keyword: '', status: '' })
const dialog = reactive({ open: false, mode: 'create' as 'create' | 'edit' | 'view', title: '' })
const formRef = ref<FormInstance>()
const emptyForm = () => ({ id: '', code: '', name: '', parentId: null as string | null, managerEmployeeId: null as string | null, sort: 1, status: 'enabled' as Department['status'] })
const form = reactive(emptyForm())
const rules: FormRules = { code: [{ required: true, message: '请输入部门编码', trigger: 'blur' }], name: [{ required: true, message: '请输入部门名称', trigger: 'blur' }] }
const treeRows = computed(() => {
  const nodes = new Map(rows.value.map((item) => [item.id, { ...item, children: [] } as DepartmentNode]))
  const roots: DepartmentNode[] = []
  nodes.forEach((node) => { const parent = node.parentId ? nodes.get(node.parentId) : null; if (parent) parent.children!.push(node); else roots.push(node) })
  return roots
})
const employeeName = (id: string | null) => employees.value.find((item) => item.id === id)?.name ?? '未设置'
const parentName = (id: string | null) => rows.value.find((item) => item.id === id)?.name ?? '顶级部门'
const load = async () => { loading.value = true; try { rows.value = await departmentApi.list(query) } finally { loading.value = false } }
const openDialog = (mode: typeof dialog.mode, row?: Department) => { Object.assign(form, emptyForm(), row ?? {}); Object.assign(dialog, { open: true, mode, title: mode === 'create' ? '新增部门' : mode === 'edit' ? '编辑部门' : '部门详情' }) }
const submit = async () => { if (!await formRef.value?.validate()) return; if (dialog.mode === 'create') await departmentApi.create(form); else await departmentApi.update(form.id, form); ElMessage.success('部门信息已保存'); dialog.open = false; await load() }
const remove = async (row: Department) => { if (!await confirmAction(`确定删除“${row.name}”吗？`, '删除部门', { type: 'warning' })) return; await departmentApi.remove(row.id); ElMessage.success('部门已删除'); await load() }
onMounted(async () => { const result = await employeeApi.list({ pageSize: 100 }); employees.value = result.list; await load() })
</script>

<template>
  <div class="page">
    <PageHeader title="部门管理" description="维护组织层级、负责人和部门状态。"><el-button v-permission="'department:create'" type="primary" icon="Plus" @click="openDialog('create')">新增部门</el-button></PageHeader>
    <section class="panel filter-bar"><el-input v-model="query.keyword" clearable placeholder="搜索部门编码或名称" prefix-icon="Search" @keyup.enter="load" /><el-select v-model="query.status" clearable placeholder="全部状态"><el-option label="启用" value="enabled" /><el-option label="停用" value="disabled" /></el-select><el-button type="primary" @click="load">查询</el-button><el-button @click="Object.assign(query, { keyword: '', status: '' }); load()">重置</el-button></section>
    <section class="panel"><el-table v-loading="loading" :data="treeRows" row-key="id" default-expand-all><el-table-column prop="name" label="部门名称" min-width="190" /><el-table-column prop="code" label="编码" width="120" /><el-table-column label="负责人" min-width="130"><template #default="{ row }">{{ employeeName(row.managerEmployeeId) }}</template></el-table-column><el-table-column prop="sort" label="排序" width="80" /><el-table-column label="状态" width="90"><template #default="{ row }"><StatusTag :status="row.status" /></template></el-table-column><el-table-column label="操作" width="210" fixed="right"><template #default="{ row }"><div class="table-actions"><el-button link type="primary" @click="openDialog('view', row)">查看</el-button><el-button v-permission="'department:update'" link type="primary" @click="openDialog('edit', row)">编辑</el-button><el-button v-permission="'department:delete'" link type="danger" @click="remove(row)">删除</el-button></div></template></el-table-column></el-table></section>
    <el-dialog v-model="dialog.open" :title="dialog.title" width="600px"><el-form ref="formRef" :model="form" :rules="rules" label-position="top" :disabled="dialog.mode === 'view'"><el-row :gutter="18"><el-col :sm="12"><el-form-item label="部门编码" prop="code"><el-input v-model="form.code" /></el-form-item></el-col><el-col :sm="12"><el-form-item label="部门名称" prop="name"><el-input v-model="form.name" /></el-form-item></el-col></el-row><el-row :gutter="18"><el-col :sm="12"><el-form-item label="上级部门"><el-select v-model="form.parentId" clearable style="width: 100%" placeholder="顶级部门"><el-option v-for="item in rows.filter(item => item.id !== form.id)" :key="item.id" :label="item.name" :value="item.id" /></el-select></el-form-item></el-col><el-col :sm="12"><el-form-item label="负责人"><el-select v-model="form.managerEmployeeId" clearable filterable style="width: 100%"><el-option v-for="item in employees" :key="item.id" :label="item.name" :value="item.id" /></el-select></el-form-item></el-col></el-row><el-row :gutter="18"><el-col :sm="12"><el-form-item label="排序"><el-input-number v-model="form.sort" :min="1" :max="999" /></el-form-item></el-col><el-col :sm="12"><el-form-item label="状态"><el-radio-group v-model="form.status"><el-radio value="enabled">启用</el-radio><el-radio value="disabled">停用</el-radio></el-radio-group></el-form-item></el-col></el-row><el-alert v-if="dialog.mode === 'view'" :title="`上级部门：${parentName(form.parentId)} · 负责人：${employeeName(form.managerEmployeeId)}`" type="info" :closable="false" /></el-form><template #footer><el-button @click="dialog.open = false">{{ dialog.mode === 'view' ? '关闭' : '取消' }}</el-button><el-button v-if="dialog.mode !== 'view'" type="primary" @click="submit">保存</el-button></template></el-dialog>
  </div>
</template>
