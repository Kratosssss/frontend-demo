<script setup lang="ts">
import { nextTick, onMounted, reactive, ref } from 'vue'
import { ElMessage, type ElTree, type FormInstance, type FormRules } from 'element-plus'
import PageHeader from '@/components/common/PageHeader.vue'
import StatusTag from '@/components/common/StatusTag.vue'
import { permissionApi, roleApi, type RoleWithCount } from '@/api/modules/system'
import type { Permission, Role } from '@/types/models'
import { confirmAction } from '@/utils/dialog'

type TreeInstance = InstanceType<typeof ElTree>
type PermissionNode = Permission & { children?: PermissionNode[] }
const loading = ref(false)
const rows = ref<RoleWithCount[]>([])
const permissions = ref<Permission[]>([])
const dialog = reactive({ open: false, mode: 'create' as 'create' | 'edit' | 'view', title: '' })
const formRef = ref<FormInstance>()
const treeRef = ref<TreeInstance>()
const emptyForm = () => ({ id: '', code: '', name: '', description: '', permissionCodes: [] as string[], status: 'enabled' as Role['status'], builtin: false })
const form = reactive(emptyForm())
const rules: FormRules = { code: [{ required: true, message: '请输入角色编码', trigger: 'blur' }], name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }] }
const treeData = ref<PermissionNode[]>([])
const buildTree = () => { const map = new Map(permissions.value.map((item) => [item.id, { ...item, children: [] } as PermissionNode])); const roots: PermissionNode[] = []; map.forEach((node) => { const parent = node.parentId ? map.get(node.parentId) : null; if (parent) parent.children!.push(node); else roots.push(node) }); treeData.value = roots }
const load = async () => { loading.value = true; try { rows.value = await roleApi.list() } finally { loading.value = false } }
const openDialog = async (mode: typeof dialog.mode, row?: RoleWithCount) => { Object.assign(form, emptyForm(), row ?? {}); Object.assign(dialog, { open: true, mode, title: mode === 'create' ? '新增角色' : mode === 'edit' ? '编辑角色与权限' : '角色详情' }); await nextTick(); treeRef.value?.setCheckedKeys(form.permissionCodes) }
const submit = async () => { if (!await formRef.value?.validate()) return; form.permissionCodes = (treeRef.value?.getCheckedKeys(false) ?? []) as string[]; if (!form.permissionCodes.length) { ElMessage.warning('请至少分配一个权限'); return } if (dialog.mode === 'create') await roleApi.create(form); else await roleApi.update(form.id, form); ElMessage.success('角色已保存，相关用户重新登录后生效'); dialog.open = false; await load() }
const remove = async (row: RoleWithCount) => { if (!await confirmAction(`确定删除角色“${row.name}”吗？`, '删除角色', { type: 'warning' })) return; await roleApi.remove(row.id); ElMessage.success('角色已删除'); await load() }
onMounted(async () => { permissions.value = await permissionApi.list(); buildTree(); await load() })
</script>

<template>
  <div class="page">
    <PageHeader title="角色管理" description="维护角色信息，并分配菜单与按钮权限。"><el-button v-permission="'role:create'" type="primary" icon="Plus" @click="openDialog('create')">新增角色</el-button></PageHeader>
    <section class="panel"><el-table v-loading="loading" :data="rows"><el-table-column prop="name" label="角色名称" min-width="140" /><el-table-column prop="code" label="角色编码" min-width="150" /><el-table-column prop="description" label="说明" min-width="220" /><el-table-column prop="memberCount" label="成员数" width="90" /><el-table-column label="权限数" width="90"><template #default="{ row }">{{ row.permissionCodes.length }}</template></el-table-column><el-table-column label="状态" width="90"><template #default="{ row }"><StatusTag :status="row.status" /></template></el-table-column><el-table-column label="操作" width="210" fixed="right"><template #default="{ row }"><div class="table-actions"><el-button link type="primary" @click="openDialog('view', row)">查看</el-button><el-button v-permission="'role:update'" link type="primary" @click="openDialog('edit', row)">编辑</el-button><el-button v-if="!row.builtin" v-permission="'role:delete'" link type="danger" @click="remove(row)">删除</el-button></div></template></el-table-column></el-table></section>
    <el-dialog v-model="dialog.open" :title="dialog.title" width="720px"><el-form ref="formRef" :model="form" :rules="rules" label-position="top" :disabled="dialog.mode === 'view'"><el-row :gutter="18"><el-col :sm="12"><el-form-item label="角色编码" prop="code"><el-input v-model="form.code" :disabled="form.builtin" /></el-form-item></el-col><el-col :sm="12"><el-form-item label="角色名称" prop="name"><el-input v-model="form.name" /></el-form-item></el-col></el-row><el-form-item label="角色说明"><el-input v-model="form.description" type="textarea" :rows="2" /></el-form-item><el-form-item label="状态"><el-radio-group v-model="form.status"><el-radio value="enabled">启用</el-radio><el-radio value="disabled" :disabled="form.id === 'role_admin'">停用</el-radio></el-radio-group></el-form-item><el-form-item label="权限分配"><div class="permission-tree"><el-tree ref="treeRef" :data="treeData" node-key="code" show-checkbox default-expand-all check-strictly :props="{ label: 'name', children: 'children' }" /></div></el-form-item></el-form><template #footer><el-button @click="dialog.open = false">{{ dialog.mode === 'view' ? '关闭' : '取消' }}</el-button><el-button v-if="dialog.mode !== 'view'" type="primary" @click="submit">保存</el-button></template></el-dialog>
  </div>
</template>
<style scoped>.permission-tree { width: 100%; max-height: 300px; overflow: auto; padding: 12px; border: 1px solid var(--hrms-border); border-radius: 8px; }</style>
