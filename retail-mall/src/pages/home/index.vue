<script setup lang="ts">
import { computed } from "vue";
import { products } from "../../data/seed";
import GlobalHeader from "../../components/GlobalHeader.vue";
const featured = computed(() => products.slice(0, 3));
const go = (url: string) => uni.navigateTo({ url });
const browseCatalog = () => uni.reLaunch({ url: "/pages/catalog/index" });
</script>
<template>
  <view class="home">
    <GlobalHeader /><view class="hero">
      <view class="stage blue"></view><view class="stage lime"></view><view class="stage pink"></view><view class="hero-copy">
        <p class="demo-top">本地演示 / 不发生真实交易</p>
        <text>新品已到</text>
        <h1>顺手的装备，<br />现在就想拥有</h1>
        <p>关键差异讲清楚，购买权益一次看懂。</p>
        <view class="actions">
          <button class="hero-button" @click="browseCatalog">
            开始选购
          </button><button
            class="hero-button light"
            @click="go('/pages/compare/index')"
          >
            先做比较
          </button>
        </view>
      </view><image
        class="keyboard"
        :src="featured[0].image"
        :alt="featured[0].imageAlt"
        mode="aspectFit"
      /><image
        class="ssd"
        :src="featured[1].image"
        :alt="featured[1].imageAlt"
        mode="aspectFit"
      /><image
        class="charger"
        :src="featured[2].image"
        :alt="featured[2].imageAlt"
        mode="aspectFit"
      />
    </view><view class="feature-strip">
      <button
        v-for="item in featured"
        :key="item.id"
        @click="go(`/pages/product/index?id=${item.id}`)"
      >
        <b>{{ item.name }} ¥{{ item.skus[0].price }}</b><text>立即探索 →</text>
      </button>
    </view><view class="home-body">
      <p class="demo">
        本地演示 · 不发生真实交易。商品、支付、订单与售后仅保存在当前浏览器。
      </p>
      <h2>热选三件</h2>
      <p>参数不是主角，差异才是。</p>
    </view>
  </view>
</template>
<style scoped lang="scss">
.home {
  min-height: 100dvh;
  background: #1737ff;
  color: #fff;
  padding-top: 88px;
}
.hero {
  height: 690px;
  position: relative;
  overflow: hidden;
}
.stage {
  position: absolute;
}
.blue {
  inset: 0;
  background: #1737ff;
}
.lime {
  width: 55%;
  height: 72%;
  right: 16%;
  bottom: -14%;
  background: #d9ff43;
  transform: skewY(8deg);
}
.pink {
  width: 30%;
  height: 58%;
  right: -3%;
  top: -8%;
  background: #ff3dac;
  transform: skewY(-10deg);
}
.hero-copy {
  position: relative;
  z-index: 2;
  padding: 44px 3%;
  max-width: 660px;
  animation: home-enter 240ms ease-out both;
}
.hero-copy > text {
  color: #d9ff43;
  font-weight: 900;
}
.hero-copy .demo-top {
  margin: 0 0 14px;
  color: #fff;
  font-size: 14px;
  line-height: 1.4;
}
.hero-copy h1 {
  font-size: clamp(54px, 7vw, 104px);
  line-height: 0.98;
  letter-spacing: -0.08em;
  margin: 12px 0;
}
.hero-copy p {
  font-size: 20px;
  font-weight: 700;
}
.actions {
  display: flex;
  gap: 12px;
  margin-top: 28px;
}
.hero-button {
  min-height: 46px;
  padding: 0 18px;
  border: 2px solid #101010;
  background: #101010;
  color: #fff;
  font-weight: 900;
  cursor: pointer;
}
.hero-button.light {
  background: #d9ff43;
  color: #101010;
}
.keyboard,
.ssd,
.charger {
  position: absolute;
  z-index: 2;
  pointer-events: none;
  animation: product-enter 240ms ease-out both;
}
.keyboard {
  width: 42%;
  left: -2%;
  bottom: 3%;
  transform: rotate(8deg);
}
.ssd {
  width: 29%;
  left: 50%;
  bottom: 8%;
}
.charger {
  width: 20%;
  right: 6%;
  top: 8%;
  transform: rotate(-6deg);
}
@keyframes home-enter {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes product-enter {
  from {
    opacity: 0;
    translate: 0 12px;
  }
  to {
    opacity: 1;
    translate: 0 0;
  }
}
.feature-strip {
  position: relative;
  z-index: 3;
  margin: -72px 24px 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  background: #101010;
}
.feature-strip button {
  min-height: 110px;
  text-align: left;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  border: 0;
  border-right: 1px solid #555;
  background: transparent;
  color: #fff;
  padding: 20px 28px;
  cursor: pointer;
  font: inherit;
}
.feature-strip text {
  text-decoration: underline;
}
.home-body {
  padding: 44px 48px 80px;
  background: #101010;
}
.home-body h2 {
  font-size: 38px;
  margin: 28px 0 0;
}
.demo {
  max-width: 680px;
  color: #d9ff43;
}
@media (max-width: 700px) {
  .home {
    padding-top: 64px;
  }
  .hero {
    height: 596px;
  }
  .hero-copy {
    padding: 28px 20px;
  }
  .hero-copy h1 {
    font-size: 54px;
  }
  .hero-copy p {
    font-size: 16px;
  }
  .keyboard {
    width: 78%;
    left: 22%;
    bottom: 21%;
  }
  .ssd {
    width: 34%;
    left: 58%;
    bottom: 0;
  }
  .charger {
    width: 27%;
    right: 60%;
    top: 65%;
  }
  .feature-strip {
    display: block;
    margin: 0;
  }
  .feature-strip button {
    min-height: 92px;
    border-bottom: 1px solid #555;
  }
  .feature-strip button:nth-child(n + 2) {
    display: none;
  }
  .home-body {
    padding: 30px 18px 100px;
  }
  .actions {
    display: none;
  }
  .hero-button.light {
    display: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .hero-copy,
  .keyboard,
  .ssd,
  .charger {
    animation: none;
  }
}
</style>
