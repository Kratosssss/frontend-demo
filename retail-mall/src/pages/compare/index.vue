<script setup lang="ts">
import { computed, ref } from "vue";
import { products } from "../../data/seed";
import GlobalHeader from "../../components/GlobalHeader.vue";
const chosen = ref<string[]>(
  (uni.getStorageSync("moru:compare") as string[]) || ["key75", "move-s2"],
);
const items = computed(() =>
  products.filter((p) => chosen.value.includes(p.id)),
);
const remove = (id: string) => {
  chosen.value = chosen.value.filter((x) => x !== id);
  uni.setStorageSync("moru:compare", chosen.value);
};
const go = (id: string) =>
  uni.navigateTo({ url: `/pages/product/index?id=${id}` });
const browseCatalog = () => uni.reLaunch({ url: "/pages/catalog/index" });
const clearComparison = () => {
  chosen.value = [];
  uni.removeStorageSync("moru:compare");
};
</script>
<template>
  <view class="page object-page">
    <GlobalHeader />
    <h1 class="page-title">把差异摆上桌</h1>
    <p class="lede">最多 3 件；只突出会改变选择的差异。</p>
    <view v-if="items.length < 2" class="empty">
      <h2>还差 {{ 2 - items.length }} 件商品</h2>
      <p>至少选择两件，才能看清关键差异。</p>
      <button class="button signal" @click="browseCatalog">
        去添加商品
      </button>
    </view><view v-else class="comparison">
      <p class="mobile-swipe-hint">左右滑动查看全部 →</p>
      <scroll-view
        scroll-x
        class="table-wrap"
        role="region"
        tabindex="0"
        aria-label="产品比较表，可左右滑动查看全部"
      >
        <table>
          <thead>
            <tr>
              <th>对比项目</th>
              <th v-for="p in items" :key="p.id">
                <image :src="p.image" :alt="p.imageAlt" mode="aspectFit" /><b>{{
                  p.name
                }}</b><button class="text-action" @click="remove(p.id)">移除</button>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>更适合</th>
              <td v-for="p in items" :key="p.id">
                {{ p.useCases.join(" / ") }}
              </td>
            </tr>
            <tr>
              <th>核心差异</th>
              <td v-for="p in items" :key="p.id">
                {{ p.skus[0].parameters.核心差异 }}
              </td>
            </tr>
            <tr>
              <th>重量</th>
              <td v-for="p in items" :key="p.id">
                {{ p.skus[0].parameters.重量 }}
              </td>
            </tr>
            <tr>
              <th>兼容性</th>
              <td v-for="p in items" :key="p.id">
                {{ p.compatibility.join("、") }}
              </td>
            </tr>
            <tr>
              <th>价格</th>
              <td v-for="p in items" :key="p.id">
                ¥{{ p.skus[0].price }}
                <button class="text-action" @click="go(p.id)">查看</button>
              </td>
            </tr>
            <tr>
              <th>库存 / 可用状态</th>
              <td v-for="p in items" :key="p.id">
                {{
                  p.skus[0].stockState === "out_of_stock"
                    ? "已售罄"
                    : p.skus[0].stockState === "low_stock"
                      ? `低库存 · 演示上限 ${p.skus[0].stock}`
                      : `可用 · 演示库存 ${p.skus[0].stock}`
                }}
              </td>
            </tr>
            <tr>
              <th>限制</th>
              <td v-for="p in items" :key="p.id">
                {{ p.limitations.join("；") }}
              </td>
            </tr>
          </tbody>
        </table>
      </scroll-view>
    </view><button class="button" @click="clearComparison">清空比较</button>
  </view>
</template>
<style scoped lang="scss">
.table-wrap {
  margin: 34px 0;
  border: 1px solid #101010;
  background: #fff;
}
.table-wrap table {
  width: 100%;
  min-width: 720px;
  border-collapse: collapse;
}
.table-wrap th,
.table-wrap td {
  padding: 14px;
  border: 1px solid #101010;
  text-align: left;
  vertical-align: top;
}
.table-wrap th:first-child {
  background: #f4f5f2;
  width: 150px;
}
.table-wrap image {
  display: block;
  width: 130px;
  height: 100px;
}
.table-wrap .text-action {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  padding: 0 6px;
  border: 0;
  border-bottom: 1px solid #101010;
  background: transparent;
  font: inherit;
  cursor: pointer;
  margin-top: 2px;
}
.table-wrap .text-action::after {
  border: 0;
}
.mobile-swipe-hint {
  display: none;
}
@media (max-width: 700px) {
  .mobile-swipe-hint {
    display: block;
    margin: 24px 0 -18px;
    color: #3b3b3b;
    font-size: 13px;
    font-weight: 800;
  }
  .table-wrap {
    margin-left: -18px;
    margin-right: -18px;
  }
  .table-wrap th:first-child {
    position: sticky;
    left: 0;
    z-index: 1;
  }
}
</style>
