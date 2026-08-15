<script setup lang="ts">
import { computed, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { useMallStore } from "../../stores/mall";
import GlobalHeader from "../../components/GlobalHeader.vue";
const store = useMallStore();
const id = ref("");
const state = ref<"ready" | "processing" | "success" | "failed">("ready");
const busy = ref(false);
onLoad((q) => {
  id.value = String(q?.id || "");
  const fixtureState = String(q?.fixture || "");
  if (
    fixtureState === "processing" ||
    fixtureState === "failed" ||
    fixtureState === "success"
  ) {
    state.value = fixtureState;
  }
});
const order = computed(() =>
  store.database.orders.find((x) => x.id === id.value),
);
const canPay = computed(() => order.value?.status === "pending_payment");
const statusTitle = computed(() => {
  return state.value === "success"
    ? "支付成功"
    : !canPay.value
      ? "订单已更新"
      : state.value === "failed"
        ? "支付失败"
        : state.value === "processing"
          ? "处理中"
          : "确认模拟支付";
});
const statusMessage = computed(() => {
  return state.value === "success"
    ? "订单已创建，可在演示账户查看配送与售后入口。"
    : !canPay.value
      ? "订单已处于当前状态；不会再次模拟扣款或重复清理购物袋。"
      : state.value === "failed"
        ? "未产生真实扣款。请返回结账重试。"
        : state.value === "processing"
          ? "模拟网关尚未返回结果。保留订单，稍后可重新查询。"
          : "本次支付不会调用真实支付渠道。";
});
const pay = async () => {
  if (busy.value) return;
  busy.value = true;
  state.value = "processing";
  try {
    await store.pay(id.value);
    state.value = "success";
  } catch {
    state.value = "failed";
  } finally {
    busy.value = false;
  }
};
const view = () =>
  order.value &&
  uni.redirectTo({ url: `/pages/order/index?id=${order.value.id}` });
</script>
<template>
  <view v-if="order" class="page object-page">
    <GlobalHeader /><view class="payment">
      <p class="eyebrow">演示环境 · DEMO ONLY</p>
      <h1 class="page-title">模拟支付结果</h1>
      <view class="status-card" :class="state">
        <span>{{
          state === "success"
            ? "✓"
            : state === "failed"
              ? "×"
              : state === "processing"
                ? "…"
                : "¥"
        }}</span>
        <h2>{{ statusTitle }}</h2>
        <p>{{ statusMessage }}</p>
        <b>订单 {{ order.number }} ¥{{ order.total }}</b>
      </view><button
        v-if="!canPay || state === 'success'"
        class="button primary"
        @click="view"
      >
        查看订单
      </button><button
        v-else-if="state === 'ready'"
        class="button primary"
        :disabled="busy"
        @click="pay"
      >
        确认模拟支付
      </button><button
        v-else-if="state === 'failed'"
        class="button emotional"
        @click="state = 'ready'"
      >
        返回结账重试
      </button><button v-else class="button" disabled>
        模拟支付处理中，暂时不能重复提交
      </button>
    </view>
  </view>
</template>
<style scoped lang="scss">
.payment {
  max-width: 600px;
  margin: 80px auto;
  text-align: center;
}
.status-card {
  border: 2px solid #101010;
  border-top-width: 8px;
  background: #fff;
  padding: 36px;
  margin: 24px 0;
}
.status-card.success {
  border-top-color: #d9ff43;
}
.status-card.failed {
  border-top-color: #ff3dac;
}
.status-card.processing {
  border-top-color: #ffd338;
}
.status-card span {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 58px;
  height: 58px;
  margin: auto;
  border-radius: 50%;
  background: #d9ff43;
  font-size: 32px;
  font-weight: 900;
}
.status-card.failed span {
  background: #ff3dac;
}
.status-card.processing span {
  background: #ffd338;
}
.payment > .button {
  min-width: 220px;
}
</style>
