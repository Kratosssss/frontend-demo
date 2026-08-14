<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useMallStore } from '../../stores/mall'
const store = useMallStore(); const orderId = ref(''); const paid = ref(false)
onLoad((query)=>{orderId.value=String(query?.id||'')})
const order = computed(()=>store.database.orders.find((item)=>item.id===orderId.value)); const pay = async()=>{try{await store.pay(orderId.value);paid.value=true}catch(error){uni.showToast({title:(error as Error).message,icon:'none'})}}
const viewOrder = () => { if (order.value) uni.redirectTo({ url: `/pages/order/index?id=${order.value.id}` }) }
const backHome = () => uni.switchTab({ url: '/pages/home/index' })
</script>
<template><view class="page center" v-if="order"><text class="eyebrow">DEMO PAYMENT</text><view class="serif heading">{{paid?'支付完成':'请确认支付'}}</view><view class="circle">{{paid?'✓':'¥'}}</view><view class="panel amount"><text>{{paid?'模拟支付成功':'本次支付金额'}}</text><view class="price">¥{{order.total}}</view><text class="muted">此操作不会调用真实支付渠道</text></view><view v-if="!paid" class="primary" @click="pay">确认模拟支付</view><view v-else class="primary" @click="viewOrder">查看订单</view><view class="secondary" @click="backHome">返回首页</view></view></template>
<style scoped lang="scss">.center{text-align:center;padding-top:130rpx}.heading{font-size:52rpx;color:#173b2a;margin:22rpx 0}.circle{width:130rpx;height:130rpx;border:1rpx solid #173b2a;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:40rpx auto;font-size:62rpx;color:#173b2a}.amount{display:flex;flex-direction:column;gap:16rpx;margin:0 30rpx 36rpx}.center .secondary{margin-top:20rpx}</style>
