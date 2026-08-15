<script setup lang="ts">
import { useMallStore } from "../stores/mall";
const store = useMallStore();
const go = (url: string, root = false) =>
  root ? uni.reLaunch({ url }) : uni.navigateTo({ url });
const browseDesk = () => {
  uni.setStorageSync("moru:catalog-filter", "desk");
  uni.reLaunch({ url: "/pages/catalog/index" });
};
const search = () => {
  uni.setStorageSync("moru:catalog-focus-search", true);
  uni.reLaunch({ url: "/pages/catalog/index" });
};
</script>
<template>
  <view class="header">
    <button
      class="brand"
      aria-label="前往 MORU 首页"
      @click="go('/pages/home/index', true)"
    >
      MORU
    </button><view class="nav">
      <button @click="go('/pages/catalog/index', true)">新品</button><button @click="go('/pages/catalog/index', true)">全部产品</button><button @click="browseDesk">按场景逛</button><button @click="go('/pages/compare/index')">比较</button><button @click="go('/pages/profile/index', true)">
        演示账户 / 订单
      </button>
    </view><view class="mobile-actions">
      <button aria-label="搜索商品" @click="search">搜索</button><button aria-label="打开购物袋" @click="go('/pages/cart/index', true)">
        购物袋
      </button><button
        aria-label="打开演示账户"
        @click="go('/pages/profile/index', true)"
      >
        账户
      </button>
    </view><button class="bag desktop-bag" @click="go('/pages/cart/index', true)">
      购物袋 <text v-if="store.cartCount">{{ store.cartCount }}</text>
    </button>
  </view>
</template>
<style scoped lang="scss">
.header {
  position: fixed;
  z-index: 10;
  top: 0;
  left: 0;
  right: 0;
  height: 88px;
  display: flex;
  align-items: center;
  gap: 24px;
  background: #050505;
  color: #fff;
  padding: 0 28px;
  box-sizing: border-box;
}
.header button {
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}
.header button::after {
  border: 0;
}
.mobile-actions {
  display: none;
}
.brand {
  font-size: 20px;
}
.nav {
  display: flex;
  gap: 22px;
  flex: 1;
}
.bag {
  margin-left: auto;
}
.bag text {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  background: #d9ff43;
  color: #101010;
  border-radius: 50%;
  font-size: 12px;
}
@media (max-width: 700px) {
  .header {
    height: 64px;
    padding: 0 18px;
  }
  .nav {
    display: none;
  }
  .desktop-bag {
    display: none;
  }
  .mobile-actions {
    display: flex;
    margin-left: auto;
    gap: 4px;
    font-size: 13px;
  }
  .header button {
    min-width: 48px;
    min-height: 48px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .brand {
    font-size: 17px;
  }
}
</style>
