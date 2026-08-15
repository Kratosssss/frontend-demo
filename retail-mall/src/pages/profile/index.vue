<script setup lang="ts">
import { ref } from "vue";
import { useMallStore } from "../../stores/mall";
import GlobalHeader from "../../components/GlobalHeader.vue";
const store = useMallStore();
const confirm = ref(false);
const go = (url: string) => uni.navigateTo({ url });
</script>
<template>
  <view class="page object-page">
    <GlobalHeader />
    <h1 class="page-title">你好，演示用户</h1>
    <p class="lede">林墨 · 138 **** 0000 · 数据仅用于本次 Demo</p>
    <p v-if="store.recovered" class="demo-recovered" role="status">
      浏览器本地数据不完整，已恢复固定演示数据。
    </p>
    <view class="stats">
      <view>
        <b>{{ store.database.orders.length }}</b><span>本地订单</span>
      </view><view>
        <b>{{ store.cartCount }}</b><span>购物袋商品</span>
      </view><view>
        <b>{{
          store.database.coupons.filter((c) => c.state === "available").length
        }}</b><span>可用优惠</span>
      </view>
    </view><view class="menu">
      <button @click="go('/pages/orders/index')">我的订单 →</button><button @click="go('/pages/address/index')">演示地址 →</button><button @click="go('/pages/coupon/index')">优惠券 →</button>
    </view><view class="notice">
      <b>演示说明</b>
      <p>
        所有商品、支付、物流与售后状态均为本地模拟，不会连接真实账号、支付、客服或物流。
      </p>
      <button class="button emotional" @click="confirm = true">
        重置演示数据
      </button>
    </view><view v-if="confirm" class="dialog-backdrop">
      <view class="reset" role="dialog" aria-modal="true">
        <h2>重置全部演示进度？</h2>
        <p>
          将清除购物袋、本地地址变更、优惠使用状态、会话新建订单、取消与售后结果，恢复固定示例数据。
        </p>
        <button class="button" @click="confirm = false">取消</button><button
          class="button emotional"
          @click="
            store.reset();
            confirm = false;
          "
        >
          确认重置
        </button>
      </view>
    </view>
  </view>
</template>
<style scoped lang="scss">
.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border-top: 4px solid #d9ff43;
  margin: 30px 0;
}
.stats view {
  padding: 18px;
  border-right: 1px solid #101010;
  display: flex;
  flex-direction: column;
}
.stats b {
  font-size: 32px;
}
.menu {
  display: flex;
  flex-direction: column;
  border-top: 1px solid #101010;
}
.menu button {
  display: flex;
  justify-content: space-between;
  border: 0;
  border-bottom: 1px solid #101010;
  background: transparent;
  padding: 18px 0;
  font: inherit;
  text-align: left;
  cursor: pointer;
}
.notice {
  margin-top: 30px;
}
.dialog-backdrop {
  position: fixed;
  z-index: 30;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 18px;
}
.reset {
  max-width: 500px;
  background: #fff;
  padding: 28px;
}
.reset button {
  margin: 8px;
}
</style>
