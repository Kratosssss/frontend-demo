<script setup lang="ts">
import { computed } from "vue";
import { useMallStore } from "../../stores/mall";
import GlobalHeader from "../../components/GlobalHeader.vue";
const store = useMallStore();
const amount = computed(() => store.quote?.goodsTotal || 0);
const choose = (id: string) => {
  store.selectCoupon(id);
  uni.navigateBack();
};
const skipCoupon = () => {
  store.selectCoupon("");
  uni.navigateBack();
};
const label = (c: { state: string; threshold: number }) =>
  c.state === "reserved"
    ? "已预占"
    : c.state === "used"
      ? "已使用"
      : amount.value < c.threshold
        ? `还差 ¥${c.threshold - amount.value}`
        : "可使用";
</script>
<template>
  <view class="page object-page">
    <GlobalHeader />
    <h1 class="page-title">选择优惠券</h1>
    <p class="lede">
      订单商品 ¥{{ amount }}；每单最多使用一张固定 Demo 优惠券。
    </p>
    <button
      v-for="c in store.database.coupons"
      :key="c.id"
      class="coupon"
      :disabled="c.state !== 'available' || amount < c.threshold"
      @click="choose(c.id)"
    >
      <b>−¥{{ c.discount }}</b><span>{{ c.name
      }}<small>满 ¥{{ c.threshold }} 可用 · {{ label(c) }}</small></span><em>{{ label(c) }}</em>
    </button><button class="button" @click="skipCoupon">不使用优惠券</button>
  </view>
</template>
<style scoped lang="scss">
.coupon {
  display: grid;
  grid-template-columns: 130px 1fr auto;
  align-items: center;
  width: 100%;
  border: 2px solid #101010;
  background: #fff;
  padding: 18px;
  margin: 16px 0;
  text-align: left;
  font: inherit;
}
.coupon:not([disabled]) {
  cursor: pointer;
}
.coupon:disabled {
  color: #777;
  border-color: #aaa;
}
.coupon > b {
  font-size: 28px;
  color: #1737ff;
}
.coupon small {
  display: block;
  color: #666;
  margin-top: 5px;
}
.coupon em {
  font-style: normal;
  font-weight: 700;
}
</style>
