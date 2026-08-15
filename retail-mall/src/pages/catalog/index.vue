<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from "vue";
import { onLoad, onShow } from "@dcloudio/uni-app";
import { categories, products } from "../../data/seed";
import GlobalHeader from "../../components/GlobalHeader.vue";
import ProductCard from "../../components/ProductCard.vue";
import { dialogKeyAction } from "../../services/dialog-focus";
const keyword = ref("");
const active = ref("");
const filterOpen = ref(false);
type SearchRef = HTMLElement | { $el?: HTMLElement };
const searchInput = ref<SearchRef>();
const filterTrigger = ref<SearchRef>();
const sheetRoot = ref<SearchRef>();
const resolveElement = (target?: SearchRef) =>
  target instanceof HTMLElement ? target : target?.$el;
const focusElement = (target?: SearchRef) => {
  const element = resolveElement(target);
  element?.setAttribute("tabindex", "0");
  element?.focus();
};
const sheetControls = () => {
  const root = resolveElement(sheetRoot.value);
  return root
    ? Array.from(root.querySelectorAll<HTMLElement>(".sheet-control")).filter(
        (control) =>
          !control.hasAttribute("disabled") && control.getClientRects().length,
      )
    : [];
};
const openFilter = async () => {
  filterOpen.value = true;
  await nextTick();
  sheetControls()[0]?.focus();
};
const closeFilter = async () => {
  filterOpen.value = false;
  await nextTick();
  focusElement(filterTrigger.value);
};
const selectFilter = async (categoryId: string) => {
  active.value = categoryId;
  await closeFilter();
};
const onSheetKeydown = (event: KeyboardEvent) => {
  if (!filterOpen.value) return;
  const controls = sheetControls();
  const current = controls.indexOf(document.activeElement as HTMLElement);
  const action = dialogKeyAction(
    controls.length,
    current,
    event.key,
    event.shiftKey,
  );
  if (action.type === "close") {
    event.preventDefault();
    closeFilter();
    return;
  }
  if (action.type !== "move") return;
  event.preventDefault();
  controls[action.index]?.focus();
};
const focusSearch = () => {
  const element =
    searchInput.value instanceof HTMLElement
      ? searchInput.value
      : searchInput.value?.$el;
  const input =
    element instanceof HTMLInputElement
      ? element
      : element?.querySelector<HTMLInputElement>("input");
  input?.focus();
};
const consumeScenarioFilter = (routeFilter = "") => {
  active.value = String(
    routeFilter || uni.getStorageSync("moru:catalog-filter") || active.value,
  );
  uni.removeStorageSync("moru:catalog-filter");
};
onLoad((q) => {
  consumeScenarioFilter(String(q?.filter || ""));
});
onShow(async () => {
  consumeScenarioFilter();
  if (uni.getStorageSync("moru:catalog-focus-search")) {
    uni.removeStorageSync("moru:catalog-focus-search");
    await nextTick();
    focusSearch();
  }
});
onMounted(() => document.addEventListener("keydown", onSheetKeydown));
onUnmounted(() => document.removeEventListener("keydown", onSheetKeydown));
const results = computed(() =>
  products
    .filter((p) => !active.value || p.categoryId === active.value)
    .filter((p) =>
      `${p.name}${p.subtitle}${p.tags.join("")}${p.useCases.join("")}`
        .toLowerCase()
        .includes(keyword.value.toLowerCase()),
    ),
);
const clear = () => {
  keyword.value = "";
  active.value = "";
};
const compare = (id: string) => {
  const ids = (uni.getStorageSync("moru:compare") as string[]) || [];
  if (!ids.includes(id) && ids.length < 3) ids.push(id);
  uni.setStorageSync("moru:compare", ids);
  uni.navigateTo({ url: "/pages/compare/index" });
};
</script>
<template>
  <view class="page object-page">
    <view
      class="catalog-background"
      :inert="filterOpen"
      :aria-hidden="filterOpen ? 'true' : undefined"
    >
      <GlobalHeader /><view class="catalog">
        <aside>
          <b>全部产品</b>
          <h3>分类</h3>
          <button @click="active = ''">全部</button><button v-for="c in categories" :key="c.id" @click="active = c.id">
            {{ c.name }}
          </button>
          <h3>接口</h3>
          <p>USB-A<br />USB-C</p>
        </aside>
        <main>
          <h1 class="page-title">找到你的下一件</h1>
          <p class="lede">按使用场景筛，不必先懂参数。</p>
          <label class="search"><span>搜索</span><input
            ref="searchInput"
            v-model="keyword"
            placeholder="搜索耳机、键盘、随身音频"
            aria-label="搜索商品"
          /></label><view class="chips">
            <button :class="{ selected: !active }" @click="active = ''">
              全部
            </button><button
              v-for="c in categories"
              :key="c.id"
              :class="{ selected: active === c.id }"
              @click="active = c.id"
            >
              {{ c.name }}
            </button><button
              ref="filterTrigger"
              class="mobile-filter"
              @click="openFilter"
            >
              筛选
            </button>
          </view>
          <p class="count">{{ results.length }} 件商品</p>
          <view v-if="results.length" class="product-grid">
            <view v-for="(p, i) in results" :key="p.id">
              <ProductCard :product="p" :index="i" /><button
                class="compare-add"
                @click="compare(p.id)"
              >
                + 比较
              </button>
            </view>
          </view><view v-else class="empty">
            <h2>没有匹配商品</h2>
            <p>搜索和筛选仍保留；可以清除条件再继续。</p>
            <button class="button signal" @click="clear">清除筛选</button>
          </view>
        </main>
      </view>
    </view><view
      v-if="filterOpen"
      ref="sheetRoot"
      class="sheet"
      role="dialog"
      aria-modal="true"
      aria-label="筛选"
    >
      <h2>按场景筛选</h2>
      <button
        v-for="c in categories"
        :key="c.id"
        class="button sheet-control"
        tabindex="0"
        @click="selectFilter(c.id)"
      >
        {{ c.name }}
      </button><button
        class="button sheet-control"
        tabindex="0"
        @click="closeFilter"
      >
        完成
      </button>
    </view>
  </view>
</template>
<style scoped lang="scss">
.catalog {
  display: grid;
  grid-template-columns: 190px 1fr;
  gap: 40px;
}
.catalog aside {
  padding-top: 30px;
  font-weight: 700;
}
.catalog aside h3 {
  margin: 34px 0 6px;
}
.catalog aside button {
  display: block;
  border: 0;
  background: transparent;
  padding: 4px 0;
  font: inherit;
  cursor: pointer;
  color: #101010;
}
.catalog aside button::after,
.chips button::after,
.compare-add::after {
  border: 0;
}
.catalog main {
  min-width: 0;
}
.search {
  display: flex;
  gap: 14px;
  align-items: center;
  border-bottom: 2px solid #101010;
  margin: 28px 0 14px;
  padding: 10px 0;
  font-weight: 700;
}
.search input {
  width: 100%;
  border: 0;
  background: transparent;
  font: inherit;
}
.chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.chips button {
  border: 1px solid #101010;
  border-radius: 999px;
  background: #fff;
  padding: 9px 15px;
  font: inherit;
  cursor: pointer;
}
.chips .selected {
  background: #d9ff43;
}
.count {
  margin: 28px 0 14px;
  font-weight: 700;
}
.product-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
}
.product-grid > view {
  position: relative;
}
.compare-add {
  border: 0;
  border-bottom: 1px solid #101010;
  background: transparent;
  font-weight: 700;
  cursor: pointer;
  padding: 4px 0;
  color: #101010;
}
.mobile-filter,
.sheet {
  display: none;
}
@media (max-width: 700px) {
  .catalog {
    display: block;
  }
  .catalog aside {
    display: none;
  }
  .product-grid {
    grid-template-columns: 1fr 1fr;
    gap: 18px;
  }
  .mobile-filter {
    display: inline-block !important;
  }
  .sheet {
    display: flex;
    position: fixed;
    z-index: 20;
    bottom: 0;
    left: 0;
    right: 0;
    gap: 10px;
    flex-direction: column;
    padding: 24px 18px calc(24px + env(safe-area-inset-bottom));
    background: #fff;
    border-top: 3px solid #101010;
    border-radius: 24px 24px 0 0;
  }
  .sheet h2 {
    margin: 0 0 8px;
  }
}
</style>
