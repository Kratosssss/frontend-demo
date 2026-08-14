<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useMallStore } from '../../stores/mall'
const store = useMallStore(); const id=ref(''); const reason=ref('不适合当前使用场景，希望申请退货。'); onLoad((query)=>{id.value=String(query?.id||'')})
const submit=async()=>{try{await store.requestAfterSale(id.value,reason.value);uni.showToast({title:'申请已提交',icon:'success'});setTimeout(()=>uni.redirectTo({url:`/pages/order/index?id=${id.value}`}),500)}catch(error){uni.showToast({title:(error as Error).message,icon:'none'})}}
</script>
<template><view class="page"><text class="eyebrow">AFTER SALES / DEMO</text><view class="section-title">申请售后</view><view class="notice">这是演示流程，不会发起真实退款或物流取件。</view><view class="panel"><text class="serif">售后原因</text><textarea v-model="reason" placeholder="请描述遇到的问题"/><text class="muted">提交后订单将进入“售后处理中”状态。</text></view><view class="primary" @click="submit">提交模拟申请</view></view></template>
<style scoped lang="scss">.panel{margin-top:26rpx}.panel .serif{font-size:30rpx;color:#173b2a}.panel textarea{width:100%;height:230rpx;margin:24rpx 0;padding:18rpx 0;border-top:1rpx solid #ded9cd;border-bottom:1rpx solid #ded9cd;font-size:27rpx;box-sizing:border-box}</style>
