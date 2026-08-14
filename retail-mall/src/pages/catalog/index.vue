<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { categories, products } from '../../data/seed'
import ProductCard from '../../components/ProductCard.vue'
const keyword = ref(''); const active = ref('')
onLoad((query) => { if (query?.category) active.value = String(query.category) })
const results = computed(() => products.filter((product) => (!active.value || product.categoryId === active.value) && `${product.name}${product.subtitle}${product.tags.join('')}`.includes(keyword.value)))
</script>
<template><view class="page"><text class="eyebrow">QIWU MARKET</text><view class="section-title">为日常而选</view><input v-model="keyword" class="search" placeholder="搜索器物、香气与日常"/><scroll-view scroll-x class="filters"><text :class="{active:!active}" @click="active=''">全部</text><text v-for="item in categories" :key="item.id" :class="{active:active===item.id}" @click="active=item.id">{{ item.name }}</text></scroll-view><view class="result">{{ results.length }} 件慢生活好物</view><view class="grid"><ProductCard v-for="product in results" :key="product.id" :product="product" /></view><view v-if="!results.length" class="empty">没有找到对应的选物</view></view></template>
<style scoped lang="scss">.search{background:#fffdf8;border:1rpx solid #d8d4c7;border-radius:999rpx;padding:22rpx 28rpx;margin:18rpx 0 24rpx;font-size:26rpx}.filters{white-space:nowrap;margin:0 -28rpx;width:calc(100% + 56rpx)}.filters text{display:inline-block;margin-left:28rpx;padding:13rpx 20rpx;color:#71836a;font-size:25rpx}.filters text:last-child{margin-right:28rpx}.filters .active{background:#173b2a;color:white;border-radius:999rpx}.result{font-size:23rpx;color:#71836a;margin:34rpx 0 20rpx}.grid{display:grid;grid-template-columns:1fr 1fr;gap:34rpx 22rpx}.empty{text-align:center;color:#71836a;padding:130rpx 0}</style>
