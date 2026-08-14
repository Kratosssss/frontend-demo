<script setup lang="ts">
import type { Product } from '../types/domain'
defineProps<{ product: Product }>()
const go = (id: string) => uni.navigateTo({ url: `/pages/product/index?id=${id}` })
</script>

<template>
  <view class="product-card" @click="go(product.id)">
    <image class="image" :src="product.image" mode="aspectFill" />
    <view class="tags"><text v-for="tag in product.tags.slice(0, 2)" :key="tag">{{ tag }}</text></view>
    <view class="name serif">{{ product.name }}</view>
    <view class="sub">{{ product.subtitle }}</view>
    <view class="price">¥{{ product.skus[0].price }}</view>
  </view>
</template>

<style scoped lang="scss">
.product-card { width: 100%; overflow:hidden; }
.image { width:100%; height: 310rpx; border-radius: 20rpx; background:#ded6c5; }
.tags { display:flex; gap:8rpx; margin-top:12rpx; }
.tags text { font-size:20rpx; color:#71836a; padding:4rpx 10rpx; background:#e8eadf; border-radius:999rpx; }
.name { color:#173b2a; font-size:30rpx; margin-top:10rpx; }
.sub { color:#71836a; font-size:22rpx; margin:8rpx 0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
</style>
