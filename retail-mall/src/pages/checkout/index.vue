<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useMallStore } from "../../stores/mall";
import GlobalHeader from "../../components/GlobalHeader.vue";
const store = useMallStore();
const submitting = ref(false);
const error = ref("");
onMounted(() => {
  if (!store.checkoutLineIds.length)
    try {
      store.prepareCheckout();
    } catch {
      error.value = "结账商品不可用或尚未选择，请返回购物袋重新选择。";
    }
});
const backToCart = () => uni.reLaunch({ url: "/pages/cart/index" });
const editAddress = () =>
  uni.navigateTo({ url: "/pages/address/index?pick=1" });
const chooseCoupon = () => uni.navigateTo({ url: "/pages/coupon/index" });
const quote = computed(() => store.quote);
const submit = async () => {
  if (submitting.value) return;
  submitting.value = true;
  try {
    const o = await store.createOrder();
    uni.navigateTo({ url: `/pages/payment/index?id=${o.id}` });
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    submitting.value = false;
  }
};
</script>
<template>
  <view v-if="quote" class="page object-page">
    <GlobalHeader /><view class="steps">
      ● 1 购物袋 — ● 2 填写信息 — ● 3 确认订单 — ○ 4 支付完成
    </view>
    <h1 class="page-title">确认订单</h1>
    <view class="checkout">
      <main>
        <section>
          <h2>
            收货信息
            <button class="text-action" @click="editAddress">修改</button>
          </h2>
          <p v-if="store.defaultAddress">
            <b>{{ store.defaultAddress.name }}</b>
          </p>
          <p v-if="store.defaultAddress">{{ store.defaultAddress.phone }}</p>
          <p v-if="store.defaultAddress">
            {{ store.defaultAddress.region }} {{ store.defaultAddress.detail }}
          </p>
        </section>
        <section>
          <h2>
            优惠码
            <button class="text-action" @click="chooseCoupon">选择</button>
          </h2>
          <p>
            <b>{{ quote.coupon?.name || "MORU-DEMO（可选）" }}</b><span v-if="quote.coupon"> −¥{{ quote.discount }}</span>
          </p>
        </section>
        <label class="save"><checkbox /> 保存为演示地址<br /><small>仅存于本次 Demo，不会真实提交。</small></label>
        <p v-if="error" role="alert" class="error">{{ error }}</p>
      </main>
      <aside>
        <h2>商品清单</h2>
        <view
          v-for="line in quote.lines"
          :key="line.sku.id"
          class="summary-line"
        >
          <image
            :src="line.product.image"
            :alt="line.product.imageAlt"
            mode="aspectFit"
          /><span>{{ line.product.name }} · {{ line.sku.name }} ×
            {{ line.quantity }}</span><b>¥{{ line.lineTotal }}</b>
        </view><view class="summary-total">
          <p>
            商品金额 <b>¥{{ quote.goodsTotal }}</b>
          </p>
          <p>
            优惠 <b>−¥{{ quote.discount }}</b>
          </p>
          <p>
            配送 <b>{{ quote.shipping ? `¥${quote.shipping}` : "¥0" }}</b>
          </p>
          <h2>应付金额 ¥{{ quote.total }}</h2>
          <button class="button primary" :disabled="submitting" @click="submit">
            {{ submitting ? "正在创建订单…" : "进入模拟支付" }}
          </button>
        </view>
      </aside>
    </view>
    <p class="demo-note">
      演示环境不会发起真实扣款。订单、地址与支付仅保存在当前浏览器。
    </p>
  </view>
  <view v-else class="page object-page">
    <GlobalHeader />
    <view class="empty" role="alert">
      <h1>暂时无法结账</h1>
      <p>{{ error || "购物袋中没有可结算的商品。" }}</p>
      <button class="button signal" @click="backToCart">返回购物袋修正</button>
    </view>
  </view>
</template>
<style scoped lang="scss">
.steps {
  border-bottom: 3px solid #d9ff43;
  padding-bottom: 18px;
  font-weight: 700;
}
.checkout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 70px;
  margin-top: 24px;
}
.checkout section {
  border-bottom: 2px solid #101010;
  padding: 10px 0 18px;
}
.checkout h2 {
  font-size: 18px;
}
.text-action {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  padding: 0 6px;
  border: 0;
  border-bottom: 1px solid #101010;
  background: transparent;
  margin-left: 24px;
  font: inherit;
  cursor: pointer;
}
.text-action::after {
  border: 0;
}
.save {
  display: block;
  margin-top: 20px;
}
.summary-line {
  display: grid;
  grid-template-columns: 100px 1fr auto;
  gap: 10px;
  align-items: center;
  margin: 10px 0;
}
.summary-line image {
  width: 100px;
  height: 72px;
}
.summary-total {
  border-top: 2px solid #101010;
  margin-top: 14px;
}
.summary-total p {
  display: flex;
  justify-content: space-between;
}
.summary-total h2 {
  background: #d9ff43;
  padding: 14px;
}
.summary-total .button {
  width: 100%;
}
.demo-note {
  text-align: center;
  font-size: 14px;
  margin-top: 18px;
}
@media (max-width: 700px) {
  .steps {
    font-size: 12px;
  }
  .checkout {
    grid-template-columns: 1fr;
    gap: 18px;
  }
  .checkout aside {
    order: -1;
  }
  .summary-line {
    grid-template-columns: 75px 1fr auto;
  }
  .summary-line image {
    width: 75px;
  }
  .summary-total {
    position: relative;
  }
  .demo-note {
    padding-bottom: 50px;
  }
}
</style>
