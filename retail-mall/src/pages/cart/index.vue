<script setup lang="ts">
import { ref } from "vue";
import { useMallStore } from "../../stores/mall";
import GlobalHeader from "../../components/GlobalHeader.vue";
const store = useMallStore();
const error = ref("");
const change = async (id: string, n: number) => {
  try {
    await store.updateLine(id, n);
  } catch (e) {
    error.value = (e as Error).message;
  }
};
const remove = async (id: string) => {
  try {
    await store.removeLine(id);
  } catch (e) {
    error.value = (e as Error).message;
  }
};
const select = (id: string, selected: boolean) => {
  try {
    store.setSelected(id, selected);
  } catch (e) {
    error.value = (e as Error).message;
  }
};
const checkout = () => {
  try {
    store.prepareCheckout();
    uni.navigateTo({ url: "/pages/checkout/index" });
  } catch (e) {
    error.value = (e as Error).message;
  }
};
const browseCatalog = () => uni.reLaunch({ url: "/pages/catalog/index" });
</script>
<template>
  <view class="page object-page">
    <GlobalHeader />
    <h1 class="page-title">购物袋 · {{ store.cartDetails.length }} 件</h1>
    <p class="lede">选择要在这次模拟订单中结算的商品。</p>
    <p v-if="error" class="error" role="alert">{{ error }}</p>
    <view v-if="store.cartDetails.length" class="bag">
      <view v-for="line in store.cartDetails" :key="line.id" class="line">
        <checkbox
          :checked="line.selected"
          :disabled="!!line.boundOrderId"
          color="#1737FF"
          @click="select(line.id, !line.selected)"
        /><image
          :src="line.product.image"
          :alt="line.product.imageAlt"
          mode="aspectFit"
        /><view>
          <h2>{{ line.product.name }}</h2>
          <p>{{ line.sku.name }} · {{ line.sku.specs }}</p>
          <p v-if="line.boundOrderId">
            已绑定待付款订单，需先支付或取消。
          </p>
        </view><view class="line-actions">
          <view>
            <button
              aria-label="减少数量"
              :disabled="!!line.boundOrderId"
              @click="change(line.id, line.quantity - 1)"
            >
              −
            </button><b>{{ line.quantity }}</b><button
              aria-label="增加数量"
              :disabled="!!line.boundOrderId"
              @click="change(line.id, line.quantity + 1)"
            >
              ＋
            </button>
          </view><b class="price">¥{{ line.subtotal }}</b><button
            class="remove"
            :disabled="!!line.boundOrderId"
            @click="remove(line.id)"
          >
            移除
          </button>
        </view>
      </view>
    </view><view v-else class="empty">
      <h2>购物袋还是空的</h2>
      <p>先从精选数码产品中挑一件。</p>
      <button class="button signal" @click="browseCatalog">
        去看全部产品
      </button>
    </view><view v-if="store.cartDetails.length" class="bottom-action">
      <view>
        <small>选中商品</small><b class="price">¥{{ store.selectedTotal }}</b>
      </view><button
        class="button emotional"
        :disabled="!store.selectedLines.length"
        @click="checkout"
      >
        去结账
      </button>
    </view>
  </view>
</template>
<style scoped lang="scss">
.bag {
  margin-top: 32px;
  border-top: 1px solid #101010;
}
.line {
  display: grid;
  grid-template-columns: 28px 130px 1fr auto;
  gap: 18px;
  align-items: center;
  padding: 18px 0;
  border-bottom: 1px solid #101010;
}
.line image {
  width: 130px;
  height: 110px;
}
.line h2 {
  margin: 0;
  font-size: 21px;
}
.line p {
  margin: 4px 0;
  color: #666;
}
.line-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}
.line-actions > view {
  display: flex;
  gap: 10px;
  align-items: center;
}
.line-actions button {
  border: 1px solid #101010;
  background: #fff;
  min-width: 32px;
  min-height: 32px;
}
.remove {
  border: 0 !important;
  border-bottom: 1px solid #c62828 !important;
  color: #c62828;
}
@media (max-width: 700px) {
  .line {
    grid-template-columns: 24px 90px 1fr;
  }
  .line image {
    width: 90px;
    height: 90px;
  }
  .line-actions {
    grid-column: 3;
    align-items: flex-start;
  }
  .line h2 {
    font-size: 17px;
  }
}
</style>
