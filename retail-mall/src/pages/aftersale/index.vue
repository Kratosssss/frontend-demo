<script setup lang="ts">
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { useMallStore } from "../../stores/mall";
import GlobalHeader from "../../components/GlobalHeader.vue";
const store = useMallStore();
const id = ref("");
const reason = ref("按键手感与预期不符，申请退货退款。");
const type = ref("退货退款");
const busy = ref(false);
const error = ref("");
onLoad((q) => (id.value = String(q?.id || "")));
const submit = async () => {
  if (busy.value) return;
  busy.value = true;
  try {
    await store.requestAfterSale(id.value, reason.value, type.value);
    uni.redirectTo({ url: `/pages/order/index?id=${id.value}` });
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    busy.value = false;
  }
};
</script>
<template>
  <view class="page object-page">
    <GlobalHeader />
    <h1 class="page-title">申请售后</h1>
    <p class="lede">
      收货后 7 天内可申请。只保存非敏感的演示原因，不会发起真实退款或物流取件。
    </p>
    <view class="form">
      <h2>售后类型</h2>
      <button
        v-for="item in ['退货退款', '换货', '维修']"
        :key="item"
        class="type"
        :class="{ selected: type === item }"
        @click="type = item"
      >
        {{ item }}
      </button><label class="field">问题说明<textarea
        v-model="reason"
        placeholder="请描述遇到的问题"
      /></label><label class="field">上传图片（可选，最多 3 张）<input
        type="file"
        accept="image/*"
        multiple
      /></label>
      <p v-if="error" class="error" role="alert">{{ error }}</p>
      <button class="button emotional" :disabled="busy" @click="submit">
        {{ busy ? "正在提交…" : "提交售后申请" }}
      </button>
    </view>
  </view>
</template>
<style scoped lang="scss">
.form {
  max-width: 700px;
  margin-top: 30px;
  border-top: 4px solid #d9ff43;
  padding-top: 18px;
}
.type {
  border: 1px solid #101010;
  background: #fff;
  padding: 10px 14px;
  margin: 0 8px 16px 0;
  font: inherit;
}
.type.selected {
  background: #d9ff43;
  border-width: 2px;
}
.field {
  margin: 18px 0;
}
.error {
  color: #c62828;
  font-weight: 700;
}
</style>
