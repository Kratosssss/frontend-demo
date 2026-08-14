<script setup lang="ts">
import type { OrderStatus } from '../types/domain'
const props = defineProps<{ status: OrderStatus }>()
const labels: Record<OrderStatus, string> = { pending_payment: '待付款', pending_shipment: '待发货', in_transit: '运输中', completed: '已完成', cancelled: '已取消', after_sale: '售后处理中' }
</script>
<template><text class="status">{{ labels[props.status] }}</text></template>
<style scoped>.status{color:#c96842;font-size:25rpx;font-weight:700}</style>
