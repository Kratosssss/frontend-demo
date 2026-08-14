<script setup lang="ts">
import { computed } from 'vue'
import { useMallStore } from '../../stores/mall'
const store = useMallStore(); const amount = computed(()=>store.quote?.goodsTotal ?? 0)
const choose = (id:string) => { store.selectCoupon(id); uni.navigateBack() }
const skip = () => { store.selectCoupon(''); uni.navigateBack() }
</script>
<template><view class="page"><text class="eyebrow">QIWU COUPONS</text><view class="section-title">选择优惠券</view><view class="notice">订单商品 ¥{{amount}}，仅展示当前可用优惠券</view><view v-for="coupon in store.database.coupons" :key="coupon.id" class="coupon" :class="{disabled:coupon.used || amount<coupon.threshold}" @click="!coupon.used && amount>=coupon.threshold && choose(coupon.id)"><view><text class="discount">¥{{coupon.discount}}</text><text>满 ¥{{coupon.threshold}} 可用</text></view><view><b>{{coupon.name}}</b><text v-if="coupon.used">已使用</text><text v-else-if="amount<coupon.threshold">还差 ¥{{coupon.threshold-amount}}</text><text v-else>可使用 ›</text></view></view><view class="secondary" @click="skip">不使用优惠券</view></view></template>
<style scoped lang="scss">.coupon{margin:22rpx 0;padding:25rpx;background:#173b2a;color:#fffdf8;border-radius:16rpx;display:grid;grid-template-columns:180rpx 1fr;gap:20rpx;align-items:center}.coupon>view{display:flex;flex-direction:column;gap:8rpx;font-size:23rpx}.discount{font-size:60rpx;font-family:'Noto Serif SC','Songti SC',serif;color:#e8c7a4}.disabled{opacity:.42}.secondary{margin-top:36rpx}</style>
