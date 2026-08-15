<script setup lang="ts">
import { computed, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { products } from "../../data/seed";
import { useMallStore } from "../../stores/mall";
import GlobalHeader from "../../components/GlobalHeader.vue";
const store = useMallStore();
const productId = ref("");
const selectedSkuId = ref("");
const quantity = ref(1);
const error = ref("");
onLoad((q) => {
  productId.value = String(q?.id || "");
  const p = products.find(
    (x) => x.id === productId.value || x.slug === productId.value,
  );
  selectedSkuId.value = p?.skus[0]?.id || "";
});
const product = computed(() =>
  products.find((x) => x.id === productId.value || x.slug === productId.value),
);
const sku = computed(() =>
  product.value?.skus.find((x) => x.id === selectedSkuId.value),
);
const add = async (checkout = false) => {
  if (!product.value || !sku.value) return;
  try {
    error.value = "";
    await store.addToCart(product.value.id, sku.value.id, quantity.value);
    if (checkout) {
      store.prepareCheckout();
      uni.navigateTo({ url: "/pages/checkout/index" });
    } else uni.showToast({ title: "已加入购物袋", icon: "success" });
  } catch (e) {
    error.value = (e as Error).message;
  }
};
const compare = () => {
  if (!product.value) return;
  const ids = (uni.getStorageSync("moru:compare") as string[]) || [];
  if (!ids.includes(product.value.id) && ids.length < 3)
    ids.push(product.value.id);
  uni.setStorageSync("moru:compare", ids);
  uni.navigateTo({ url: "/pages/compare/index" });
};
const browseCatalog = () => uni.reLaunch({ url: "/pages/catalog/index" });
</script>
<template>
  <view v-if="product && sku" class="page object-page">
    <GlobalHeader /><view class="detail">
      <view class="media">
        <image :src="product.image" :alt="product.imageAlt" mode="aspectFit" />
      </view>
      <main>
        <p class="eyebrow">{{ product.subtitle }}</p>
        <h1 class="page-title">{{ product.name }}</h1>
        <p class="lede">
          {{
            product.id === "aura-x1"
              ? "把城市关小一点。自适应降噪会根据环境变化，不需要你不断切模式。"
              : product.benefits.join("，")
          }}
        </p>
        <p class="price">¥{{ sku.price }}</p>
        <fieldset>
          <legend>选择颜色 / 版本</legend>
          <button
            v-for="item in product.skus"
            :key="item.id"
            class="variant"
            :class="{ selected: selectedSkuId === item.id }"
            :disabled="!item.stock"
            @click="selectedSkuId = item.id"
          >
            {{ item.name }} · {{ item.specs }}
            <text v-if="!item.stock">（已售罄）</text>
          </button>
        </fieldset>
        <view class="quantity">
          <b>数量</b><button
            aria-label="减少数量"
            @click="quantity = Math.max(1, quantity - 1)"
          >
            −
          </button><span>{{ quantity }}</span><button
            aria-label="增加数量"
            :disabled="quantity >= sku.stock"
            @click="quantity = Math.min(sku.stock, quantity + 1)"
          >
            ＋
          </button><span>{{
            sku.stockState === "out_of_stock"
              ? "已售罄"
              : sku.stockState === "low_stock"
                ? `低库存 · 演示上限 ${sku.stock}`
                : `演示库存 ${sku.stock}`
          }}</span>
        </view>
        <p v-if="error" class="error" role="alert">{{ error }}</p>
        <view class="actions">
          <button
            class="button primary"
            :disabled="!sku.stock"
            @click="add(false)"
          >
            加入购物袋
          </button><button class="button signal" @click="compare">
            加入比较
          </button>
        </view><view class="benefits">
          <p v-for="b in product.benefits" :key="b">✓ {{ b }}</p>
        </view>
      </main>
    </view><view class="facts">
      <section>
        <h2>兼容性</h2>
        <p>{{ product.compatibility.join(" · ") }}</p>
      </section>
      <section>
        <h2>包装清单</h2>
        <p>{{ product.included.join(" · ") }}</p>
      </section>
      <section>
        <h2>权益与说明</h2>
        <p>
          {{ product.shippingNote }} {{ product.returnsNote }}
          {{ product.supportNote }}
        </p>
      </section>
    </view>
  </view><view v-else class="page object-page">
    <GlobalHeader /><view class="empty">
      <h1>商品不可用</h1>
      <p>该商品直链无效，未回退到默认商品。</p>
      <button class="button signal" @click="browseCatalog">返回产品目录</button>
    </view>
  </view>
</template>
<style scoped lang="scss">
.detail {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 46px;
  align-items: center;
}
.media {
  min-height: 560px;
  background: #eef0ed;
  border-bottom: 6px solid #d9ff43;
}
.media image {
  width: 100%;
  height: 560px;
}
.detail main {
  max-width: 560px;
}
.detail .price {
  font-size: 36px;
  margin: 26px 0;
  font-weight: 900;
}
.detail fieldset {
  border: 0;
  padding: 0;
  margin: 20px 0;
}
.detail legend {
  font-weight: 900;
  margin-bottom: 10px;
}
.variant {
  display: inline-block;
  border: 1px solid #101010;
  border-radius: 3px;
  background: #fff;
  margin: 0 8px 8px 0;
  padding: 10px;
  font: inherit;
  cursor: pointer;
}
.variant.selected {
  background: #d9ff43;
  border-width: 2px;
}
.quantity {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}
.quantity button {
  width: 42px;
  height: 42px;
  border: 1px solid #101010;
  background: #fff;
  font-size: 20px;
}
.actions {
  display: flex;
  gap: 10px;
  margin: 22px 0;
}
.benefits {
  border-top: 1px solid #101010;
}
.facts {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
  margin-top: 56px;
}
.facts section {
  border-top: 3px solid #d9ff43;
}
.error {
  color: #c62828;
  font-weight: 700;
}
@media (max-width: 700px) {
  .detail {
    display: block;
  }
  .media,
  .media image {
    min-height: 340px;
    height: 340px;
  }
  .detail main {
    margin-top: 20px;
  }
  .facts {
    grid-template-columns: 1fr;
    margin-top: 32px;
  }
  .actions {
    position: static;
    flex-wrap: wrap;
  }
}
</style>
