<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { useMallStore } from "../../stores/mall";
import { dialogKeyAction } from "../../services/dialog-focus";
import GlobalHeader from "../../components/GlobalHeader.vue";
import OrderStatus from "../../components/OrderStatus.vue";
const store = useMallStore();
const id = ref("");
const dialog = ref(false);
type FocusableRef = HTMLElement | { $el?: HTMLElement };
const returnButton = ref<FocusableRef>();
const cancelTrigger = ref<FocusableRef>();
const dialogRoot = ref<FocusableRef>();
const error = ref("");
onLoad((q) => (id.value = String(q?.id || "")));
const order = computed(() =>
  store.database.orders.find((o) => o.id === id.value),
);
const focus = (target?: FocusableRef) => {
  const element = target instanceof HTMLElement ? target : target?.$el;
  element?.setAttribute("tabindex", "0");
  element?.focus();
};
const dialogControls = () => {
  const root =
    dialogRoot.value instanceof HTMLElement
      ? dialogRoot.value
      : dialogRoot.value?.$el;
  return root
    ? Array.from(
        root.querySelectorAll<HTMLElement>(
          ".dialog-return, .dialog-confirm, input",
        ),
      )
    : [];
};
const open = async () => {
  dialog.value = true;
  await nextTick();
  focus(returnButton.value);
};
const close = async () => {
  dialog.value = false;
  await nextTick();
  focus(cancelTrigger.value);
};
const onDialogKeydown = (event: KeyboardEvent) => {
  if (!dialog.value) return;
  const controls = dialogControls();
  const current = controls.indexOf(document.activeElement as HTMLElement);
  const action = dialogKeyAction(
    controls.length,
    current,
    event.key,
    event.shiftKey,
  );
  if (action.type === "close") {
    event.preventDefault();
    close();
    return;
  }
  if (action.type !== "move") return;
  event.preventDefault();
  controls[action.index]?.focus();
};
onMounted(() => document.addEventListener("keydown", onDialogKeydown));
onUnmounted(() => document.removeEventListener("keydown", onDialogKeydown));
const cancel = async () => {
  try {
    await store.cancel(id.value);
    await close();
  } catch (e) {
    error.value = (e as Error).message;
  }
};
const payment = () =>
  order.value &&
  uni.redirectTo({ url: `/pages/payment/index?id=${order.value.id}` });
const after = () =>
  order.value &&
  uni.navigateTo({ url: `/pages/aftersale/index?id=${order.value.id}` });
</script>
<template>
  <view v-if="order" class="page object-page">
    <GlobalHeader /><view class="head">
      <h1 class="page-title">
        {{ order.status === "pending_payment" ? "待付款" : "订单详情" }}
      </h1>
      <OrderStatus :status="order.status" />
    </view>
    <p v-if="order.status === 'pending_payment'" class="notice">
      还可在 30 分钟内完成模拟支付。取消后不可恢复；本订单尚未真实扣款。
    </p>
    <p v-if="error" class="error" role="alert">{{ error }}</p>
    <view class="order-grid">
      <main>
        <section>
          <h2>收货信息</h2>
          <p>
            <b>{{ order.address.name }} {{ order.address.phone }}</b><br />{{ order.address.region }} {{ order.address.detail }}
          </p>
        </section>
        <section v-for="line in order.lines" :key="line.sku.id" class="line">
          <image
            :src="line.product.image"
            :alt="line.product.imageAlt"
            mode="aspectFit"
          /><span>{{ line.product.name }} · {{ line.sku.name }} ×
            {{ line.quantity }}</span><b>¥{{ line.lineTotal }}</b>
        </section>
      </main>
      <aside>
        <p>
          商品小计 <b>¥{{ order.goodsTotal }}</b>
        </p>
        <p>
          配送 <b>¥{{ order.shipping }}</b>
        </p>
        <p>
          优惠 <b>−¥{{ order.discount }}</b>
        </p>
        <h2>应付 ¥{{ order.total }}</h2>
      </aside>
    </view><view v-if="order.status === 'pending_payment'" class="actions">
      <button class="button primary" @click="payment">继续模拟支付</button><button ref="cancelTrigger" class="button emotional" @click="open">
        取消订单
      </button>
    </view><button
      v-if="order.status === 'completed'"
      class="button emotional"
      @click="after"
    >
      申请售后
    </button>
    <p v-if="order.status === 'after_sale'" class="notice">
      已提交本地售后申请：{{ order.afterSale?.reason }}
    </p>
    <view
      v-if="dialog"
      class="dialog-backdrop"
      role="presentation"
      @click.self="close"
    >
      <view
        ref="dialogRoot"
        class="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-title"
      >
        <h2 id="cancel-title">确认取消订单？</h2>
        <p>取消后不可恢复；本订单尚未真实扣款，也不会发送外部通知。</p>
        <label class="field">原因<input value="暂时不需要了" aria-label="取消原因" /></label><view>
          <view
            ref="returnButton"
            class="button dialog-return"
            role="button"
            tabindex="0"
            @click="close"
            @keydown.enter="close"
            @keydown.space.prevent="close"
          >
            返回订单
          </view><view
            class="button emotional dialog-confirm"
            role="button"
            tabindex="0"
            @click="cancel"
            @keydown.enter="cancel"
            @keydown.space.prevent="cancel"
          >
            确认取消
          </view>
        </view>
      </view>
    </view>
  </view>
</template>
<style scoped lang="scss">
.head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}
.order-grid {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 40px;
  margin: 30px 0;
}
.order-grid section {
  border-top: 2px solid #101010;
  padding: 14px 0;
}
.line {
  display: grid;
  grid-template-columns: 100px 1fr auto;
  gap: 12px;
  align-items: center;
}
.line image {
  width: 100px;
  height: 80px;
}
.order-grid aside {
  border-top: 4px solid #d9ff43;
  background: #fff;
  padding: 18px;
}
.order-grid aside p {
  display: flex;
  justify-content: space-between;
}
.actions {
  display: flex;
  gap: 12px;
}
.dialog-backdrop {
  position: fixed;
  z-index: 30;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
}
.dialog {
  max-width: 496px;
  background: #101010;
  color: #fff;
  padding: 28px;
}
.dialog input {
  color: #101010;
}
.dialog > view {
  display: flex;
  gap: 10px;
  margin-top: 22px;
}
.dialog .button:focus {
  outline: 3px solid #d9ff43;
  outline-offset: 3px;
}
@media (max-width: 700px) {
  .order-grid {
    grid-template-columns: 1fr;
  }
  .dialog-backdrop {
    align-items: flex-end;
    padding: 0;
  }
  .dialog {
    width: 100%;
    border-radius: 24px 24px 0 0;
  }
  .dialog > view {
    flex-direction: column;
  }
  .actions {
    flex-direction: column;
  }
}
</style>
