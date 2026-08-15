<script setup lang="ts">
import { computed, ref } from "vue";
import { useMallStore } from "../../stores/mall";
import GlobalHeader from "../../components/GlobalHeader.vue";
import OrderStatus from "../../components/OrderStatus.vue";
const store = useMallStore();
const filter = ref("all");
const filters = [
  ["all", "全部"],
  ["pending_payment", "待付款"],
  ["pending_shipment", "待发货"],
  ["in_transit", "运输中"],
  ["completed", "已完成"],
  ["after_sale", "售后"],
];
const orders = computed(() =>
  store.database.orders.filter(
    (o) => filter.value === "all" || o.status === filter.value,
  ),
);
const detail = (id: string) =>
  uni.navigateTo({ url: `/pages/order/index?id=${id}` });
</script>
<template>
  <view class="page object-page">
    <GlobalHeader />
    <h1 class="page-title">你好，演示用户</h1>
    <p class="lede">手机号 138 **** 0000 · 数据仅用于本次 Demo</p>
    <view class="filters">
      <button
        v-for="f in filters"
        :key="f[0]"
        :class="{ active: filter === f[0] }"
        @click="filter = f[0]"
      >
        {{ f[1] }}
      </button>
    </view><view v-if="orders.length" class="orders">
      <button
        v-for="o in orders"
        :key="o.id"
        class="order"
        @click="detail(o.id)"
      >
        <view>
          <OrderStatus :status="o.status" />
          <p>{{ o.number }} · {{ o.createdAt }}</p>
        </view><view>
          <b>{{ o.lines[0].product.name }}</b>
          <p>{{ o.lines[0].sku.name }} × {{ o.lines[0].quantity }}</p>
        </view><b class="price">¥{{ o.total }}</b><span>查看 →</span>
      </button>
    </view><view v-else class="empty">
      <h2>暂无对应订单</h2>
      <button class="button signal" @click="filter = 'all'">
        查看全部订单
      </button>
    </view>
    <p class="notice">
      订单、支付与售后状态均可追溯；Demo 数据不会发送物流或扣款。
    </p>
  </view>
</template>
<style scoped lang="scss">
.filters {
  display: flex;
  gap: 8px;
  overflow: auto;
  margin: 26px 0;
}
.filters button {
  white-space: nowrap;
  border: 1px solid #101010;
  border-radius: 999px;
  background: #fff;
  padding: 8px 12px;
  font: inherit;
}
.filters .active {
  background: #d9ff43;
}
.orders {
  border-top: 1px solid #101010;
}
.order {
  width: 100%;
  display: grid;
  grid-template-columns: 1.1fr 1fr auto auto;
  gap: 16px;
  align-items: center;
  border: 0;
  border-bottom: 1px solid #101010;
  background: transparent;
  padding: 16px 0;
  text-align: left;
  font: inherit;
  cursor: pointer;
}
.order p {
  margin: 5px 0;
  color: #666;
}
.notice {
  margin-top: 30px;
}
@media (max-width: 700px) {
  .order {
    grid-template-columns: 1fr auto;
  }
  .order > span {
    display: none;
  }
}
</style>
