<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import PageHeader from '@/components/common/PageHeader.vue'
import StatusTag from '@/components/common/StatusTag.vue'
import { permissionApi } from '@/api/modules/system'
import type { Permission } from '@/types/models'
import { confirmAction } from '@/utils/dialog'

type PermissionNode = Permission & { children?: PermissionNode[] }
const loading = ref(false)
const rows = ref<Permission[]>([])
const query = reactive({ keyword: '', type: '' })
const dialog = reactive({ open: false, mode: 'create' as 'create' | 'edit' | 'view', title: '' })
const formRef = ref<FormInstance>()
const emptyForm = () => ({ id: '', code: '', name: '', parentId: null as string | null, type: 'action' as Permission['type'], routePath: null as string | null, sort: 1, status: 'enabled' as Permission['status'], builtin: false })
const form = reactive(emptyForm())
const rules: FormRules = { code: [{ required: true, message: '请输入权限编码', trigger: 'blur' }, { pattern: /^[a-z][a-z-]*:[a-z][a-z-]*$/, message: '格式应为 resource:action', trigger: 'blur' }], name: [{ required: true, message: '请输入权限名称', trigger: 'blur' }] }
const visibleRows = computed(() => rows.value.filter((item) => (!query.keyword || [item.name, item.code].some((value) => value.toLowerCase().includes(query.keyword.toLowerCase()))) && (!query.type || item.type === query.type)))
const treeRows = computed(() => { const map = new Map(visibleRows.value.map((item) => [item.id, { ...item, children: [] } as PermissionNode])); const roots: PermissionNode[] = []; map.forEach((node) => { const parent = node.parentId ? map.get(node.parentId) : null; if (parent) parent.children!.push(node); else roots.push(node) }); return roots })
const load = async () => { loading.value = true; try { rows.value = await permissionApi.list() } finally { loading.value = false } }
const openDialog = (mode: typeof dialog.mode, row?: Permission) => { Object.assign(form, emptyForm(), row ?? {}); Object.assign(dialog, { open: true, mode, title: mode === 'create' ? '新增权限' : mode === 'edit' ? '编辑权限' : '权限详情' }) }
const submit = async () => { if (!await formRef.value?.validate()) return; if (form.type === 'action') form.routePath = null; if (dialog.mode === 'create') await permissionApi.create(form); else await permissionApi.update(form.id, form); ElMessage.success('权限信息已保存'); dialog.open = false; await load() }
const remove = async (row: Permission) => { if (!await confirmAction(`确定删除权限“${row.name}”吗？`, '删除权限', { type: 'warning' })) return; await permissionApi.remove(row.id); ElMessage.success('权限已删除'); await load() }
onMounted(load)
</script>

<template>
  <div class="page">
    <PageHeader title="权限管理" description="维护菜单与按钮权限编码，内置权限受保护。"><el-button v-permission="'permission:create'" type="primary" icon="Plus" @click="openDialog('create')">新增权限</el-button></PageHeader>
    <section class="panel filter-bar"><el-input v-model="query.keyword" clearable placeholder="搜索权限名称或编码" prefix-icon="Search" /><el-select v-model="query.type" clearable placeholder="全部类型"><el-option label="菜单" value="menu" /><el-option label="按钮" value="action" /></el-select></section>
    <section class="panel"><el-table v-loading="loading" :data="treeRows" row-key="id" default-expand-all><el-table-column prop="name" label="权限名称" min-width="180" /><el-table-column prop="code" label="权限编码" min-width="200"><template #default="{ row }"><code>{{ row.code }}</code></template></el-table-column><el-table-column label="类型" width="90"><template #default="{ row }"><el-tag :type="row.type === 'menu' ? 'primary' : 'info'">{{ row.type === 'menu' ? '菜单' : '按钮' }}</el-tag></template></el-table-column><el-table-column prop="routePath" label="路由" min-width="150"><template #default="{ row }">{{ row.routePath || '—' }}</template></el-table-column><el-table-column prop="sort" label="排序" width="70" /><el-table-column label="状态" width="90"><template #default="{ row }"><StatusTag :status="row.status" /></template></el-table-column><el-table-column label="操作" width="190" fixed="right"><template #default="{ row }"><div class="table-actions"><el-button link type="primary" @click="openDialog('view', row)">查看</el-button><el-button v-permission="'permission:update'" link type="primary" @click="openDialog('edit', row)">编辑</el-button><el-button v-if="!row.builtin" v-permission="'permission:delete'" link type="danger" @click="remove(row)">删除</el-button></div></template></el-table-column></el-table></section>
    <el-dialog v-model="dialog.open" :title="dialog.title" width="620px"><el-form ref="formRef" :model="form" :rules="rules" label-position="top" :disabled="dialog.mode === 'view'"><el-row :gutter="18"><el-col :sm="12"><el-form-item label="权限名称" prop="name"><el-input v-model="form.name" /></el-form-item></el-col><el-col :sm="12"><el-form-item label="权限编码" prop="code"><el-input v-model="form.code" :disabled="form.builtin" placeholder="resource:action" /></el-form-item></el-col></el-row><el-row :gutter="18"><el-col :sm="12"><el-form-item label="权限类型"><el-radio-group v-model="form.type"><el-radio value="menu">菜单</el-radio><el-radio value="action">按钮</el-radio></el-radio-group></el-form-item></el-col><el-col :sm="12"><el-form-item label="上级权限"><el-select v-model="form.parentId" clearable style="width: 100%"><el-option v-for="item in rows.filter(item => item.type === 'menu' && item.id !== form.id)" :key="item.id" :label="item.name" :value="item.id" /></el-select></el-form-item></el-col></el-row><el-row :gutter="18"><el-col :sm="12"><el-form-item label="路由路径"><el-input v-model="form.routePath" :disabled="form.type !== 'menu'" placeholder="/path" /></el-form-item></el-col><el-col :sm="12"><el-form-item label="排序"><el-input-number v-model="form.sort" :min="1" :max="999" /></el-form-item></el-col></el-row><el-form-item label="状态"><el-radio-group v-model="form.status"><el-radio value="enabled">启用</el-radio><el-radio value="disabled">停用</el-radio></el-radio-group></el-form-item></el-form><template #footer><el-button @click="dialog.open = false">{{ dialog.mode === 'view' ? '关闭' : '取消' }}</el-button><el-button v-if="dialog.mode !== 'view'" type="primary" @click="submit">保存</el-button></template></el-dialog>
  </div>
</template>
<style scoped>code { padding: 3px 6px; border-radius: 5px; color: #344054; background: #f2f4f7; }</style>
