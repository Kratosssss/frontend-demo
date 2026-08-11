<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ status: string }>()
const map: Record<string, { label: string; type: 'success' | 'warning' | 'danger' | 'info' | 'primary' }> = {
  enabled: { label: '启用', type: 'success' }, active: { label: '在职', type: 'success' },
  disabled: { label: '停用', type: 'info' }, inactive: { label: '停用', type: 'info' },
  normal: { label: '正常', type: 'success' }, late: { label: '迟到', type: 'warning' },
  early_leave: { label: '早退', type: 'warning' }, absent: { label: '缺勤', type: 'danger' }, leave: { label: '请假', type: 'primary' },
  pending: { label: '待审批', type: 'warning' }, approved: { label: '已批准', type: 'success' },
  rejected: { label: '已驳回', type: 'danger' }, withdrawn: { label: '已撤销', type: 'info' },
}
const current = computed(() => map[props.status] ?? { label: props.status, type: 'info' as const })
</script>

<template><el-tag :type="current.type" effect="light">{{ current.label }}</el-tag></template>
