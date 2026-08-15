<script setup lang="ts">
import type { Product } from "../types/domain";
defineProps<{ product: Product; index?: number }>();
const go = (id: string) =>
  uni.navigateTo({ url: `/pages/product/index?id=${id}` });
</script>
<template>
  <button class="product-card" @click="go(product.id)">
    <view class="media">
      <image
        :src="product.image"
        :alt="product.imageAlt"
        mode="aspectFit"
      />
    </view><view class="copy">
      <text class="eyebrow">{{ product.tags[0] }}</text><text class="name">{{ product.name }}</text><text class="sub">{{ product.subtitle }}</text><text class="price">¥{{ product.skus[0].price }}</text><text class="view">查看详情 →</text>
    </view>
  </button>
</template>
<style scoped lang="scss">
.product-card {
  display: block;
  width: 100%;
  padding: 0;
  text-align: left;
  border: 0;
  background: transparent;
  color: #101010;
  cursor: pointer;
}
.product-card::after {
  border: 0;
}
.media {
  height: 280px;
  position: relative;
  overflow: hidden;
  background: transparent;
  border-bottom: 4px solid #d9ff43;
}
.media image {
  width: 100%;
  height: 100%;
  transform: scale(1.08);
}
.copy {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 14px 0;
}
.eyebrow {
  font-size: 12px;
}
.name {
  font-weight: 900;
  font-size: 22px;
}
.sub {
  color: #666;
}
.price {
  font-size: 18px;
  font-weight: 900;
}
.view {
  text-decoration: underline;
  font-weight: 700;
}
@media (max-width: 700px) {
  .media {
    height: 200px;
  }
  .name {
    font-size: 18px;
  }
}
</style>
