<script setup lang="ts">
import { computed } from 'vue'
import { products, categories } from '../../data/seed'
import ProductCard from '../../components/ProductCard.vue'
const featured = computed(() => products.slice(0, 4))
const goCatalog = (categoryId = '') => uni.navigateTo({ url: `/pages/catalog/index${categoryId ? `?category=${categoryId}` : ''}` })
const goCart = () => uni.switchTab({ url: '/pages/cart/index' })
</script>
<template>
  <view class="page home">
    <view class="top"><view><text class="eyebrow">QIWU / 2026 AUTUMN</text><view class="wordmark serif">栖物</view></view><text class="bag" @click="goCart">购物袋</text></view>
    <view class="hero"><image src="/static/qiwu-editorial-products.png" mode="aspectFill" /><view class="hero-copy"><text class="eyebrow">LIVING, SLOWLY</text><view class="serif">把日常<br/>过成作品</view><text @click="goCatalog()">开始选物 →</text></view></view>
    <view class="notice">演示环境 · 全部商品、订单与支付流程均为虚构模拟</view>
    <view class="section-head"><view><text class="eyebrow">EDITED FOR YOU</text><view class="section-title">今日选物</view></view><text @click="goCatalog()">查看全部</text></view>
    <scroll-view class="categories" scroll-x><view v-for="category in categories" :key="category.id" class="category" @click="goCatalog(category.id)"><text>{{ category.name }}</text><small>{{ category.tagline }}</small></view></scroll-view>
    <view class="product-grid"><ProductCard v-for="product in featured" :key="product.id" :product="product" /></view>
  </view>
</template>
<style scoped lang="scss">
.home{padding-top:70rpx}.top,.section-head{display:flex;justify-content:space-between;align-items:flex-end}.wordmark{font-size:72rpx;color:#173b2a;letter-spacing:10rpx}.bag{font-size:24rpx;color:#173b2a;border-bottom:1rpx solid #173b2a}.hero{height:670rpx;position:relative;margin:38rpx -28rpx 28rpx;overflow:hidden;background:#d5c6aa}.hero image{width:100%;height:100%;filter:brightness(.76)}.hero-copy{position:absolute;left:38rpx;bottom:46rpx;color:#fff}.hero-copy .serif{font-size:62rpx;line-height:1.22;margin:15rpx 0 24rpx}.hero-copy>text:last-child{font-size:25rpx;border-bottom:1rpx solid #fff;padding-bottom:8rpx}.section-head{margin-top:42rpx}.section-head>text{font-size:24rpx;color:#71836a}.categories{white-space:nowrap;margin:0 -28rpx 34rpx;width:calc(100% + 56rpx)}.category{display:inline-flex;flex-direction:column;width:210rpx;height:115rpx;box-sizing:border-box;padding:20rpx;margin-left:28rpx;background:#e5e7dc;border-radius:4rpx;color:#173b2a}.category:last-child{margin-right:28rpx}.category text{font-family:'Noto Serif SC','Songti SC',serif;font-size:28rpx}.category small{font-size:18rpx;color:#71836a;margin-top:8rpx}.product-grid{display:grid;grid-template-columns:1fr 1fr;gap:36rpx 22rpx}.product-grid :deep(.product-card:nth-child(2)){margin-top:70rpx}
</style>
