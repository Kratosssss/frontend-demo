<script setup lang="ts">
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { useMallStore } from "../../stores/mall";
import GlobalHeader from "../../components/GlobalHeader.vue";
const store = useMallStore();
const pick = ref(false);
const editing = ref(false);
const form = ref({
  id: "",
  name: "",
  phone: "",
  region: "上海市徐汇区",
  detail: "",
  default: false,
});
const error = ref("");
onLoad((q) => (pick.value = q?.pick === "1"));
const edit = (a?: typeof form.value) => {
  form.value = a
    ? { ...a }
    : {
        id: "",
        name: "",
        phone: "",
        region: "上海市徐汇区",
        detail: "",
        default: false,
      };
  editing.value = true;
};
const select = (id: string) => {
  store.selectAddress(id);
  if (pick.value) uni.navigateBack();
};
const save = async () => {
  try {
    await store.saveAddress(form.value);
    editing.value = false;
  } catch (e) {
    error.value = (e as Error).message;
  }
};
</script>
<template>
  <view class="page object-page">
    <GlobalHeader />
    <h1 class="page-title">演示地址</h1>
    <p class="notice">仅输入虚构信息；所有变更只保存在当前浏览器。</p>
    <view v-if="!editing">
      <button
        v-for="a in store.database.addresses"
        :key="a.id"
        class="address"
        @click="select(a.id)"
      >
        <view>
          <b>{{ a.name }} {{ a.phone }}</b>
          <p>{{ a.region }} {{ a.detail }}</p>
          <small v-if="a.default">默认地址</small>
        </view><span @click.stop="edit(a)">编辑</span>
      </button><button class="button signal" @click="edit()">
        新增演示地址
      </button>
    </view><view v-else class="edit">
      <label class="field">姓名<input v-model="form.name" /></label><label class="field">手机号<input v-model="form.phone" /></label><label class="field">收货地址<input v-model="form.region" /></label><label class="field">详细地址<textarea v-model="form.detail" /></label><label><checkbox
        :checked="form.default"
        @click="form.default = !form.default"
      />
        设为默认地址</label>
      <p v-if="error" class="error">{{ error }}</p>
      <button class="button primary" @click="save">保存演示地址</button><button class="button" @click="editing = false">取消</button>
    </view>
  </view>
</template>
<style scoped lang="scss">
.address {
  display: flex;
  width: 100%;
  justify-content: space-between;
  text-align: left;
  border: 0;
  border-bottom: 1px solid #101010;
  background: transparent;
  padding: 18px 0;
  font: inherit;
  cursor: pointer;
}
.address p {
  margin: 5px 0;
}
.address small {
  background: #d9ff43;
  font-weight: 700;
  padding: 2px 5px;
}
.edit {
  max-width: 600px;
  margin-top: 24px;
}
.edit .field {
  margin: 15px 0;
}
.edit .field > input,
.edit .field :deep(.uni-input-wrapper),
.edit .field :deep(.uni-input-input) {
  box-sizing: border-box;
  min-height: 44px;
}
.edit .field :deep(.uni-input-input) {
  height: 44px;
}
.edit .field :deep(.uni-input-input:focus-visible) {
  outline: 3px solid #d9ff43;
  outline-offset: 2px;
}
.edit .button {
  margin: 16px 8px 0 0;
}
.error {
  color: #c62828;
}
@media (max-width: 700px) {
  .edit .field > input,
  .edit .field :deep(.uni-input-wrapper),
  .edit .field :deep(.uni-input-input) {
    min-height: 48px;
  }
  .edit .field :deep(.uni-input-input) {
    height: 48px;
  }
}
</style>
