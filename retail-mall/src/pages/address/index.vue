<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useMallStore } from '../../stores/mall'
const store = useMallStore(); const pick = ref(false); const editing = ref(false)
const form = ref({id:'',name:'',phone:'',region:'',detail:'',default:false})
onLoad((query)=>{pick.value = query?.pick === '1'})
const select = (id:string) => { store.selectAddress(id); if(pick.value) uni.navigateBack() }
const edit = (address?:typeof form.value) => { form.value = address ? {...address} : {id:'',name:'',phone:'',region:'上海市 徐汇区',detail:'',default:false}; editing.value=true }
const save = async () => { try { await store.saveAddress({...form.value}); editing.value=false } catch(error) { uni.showToast({title:(error as Error).message,icon:'none'}) } }
const onDefaultChange = (event: Event) => { form.value.default = (event as unknown as { detail: { value: boolean } }).detail.value }
</script>
<template><view class="page"><text class="eyebrow">DELIVERY</text><view class="section-title">收货地址</view><view v-if="!editing"><view v-for="address in store.database.addresses" :key="address.id" class="panel address" @click="select(address.id)"><view><b>{{address.name}} {{address.phone}}</b><view class="muted">{{address.region}} {{address.detail}}</view><text v-if="address.default" class="badge">默认</text></view><text @click.stop="edit(address)">编辑</text></view><view class="secondary" @click="edit()">新增地址</view></view><view v-else class="panel form"><input v-model="form.name" placeholder="收货人姓名"/><input v-model="form.phone" placeholder="手机号"/><input v-model="form.region" placeholder="省市区"/><textarea v-model="form.detail" placeholder="详细地址"/><label><switch :checked="form.default" @change="onDefaultChange"/> 设为默认地址</label><view class="primary" @click="save">保存地址</view><view class="secondary" @click="editing=false">取消</view></view></view></template>
<style scoped lang="scss">.address{display:flex;justify-content:space-between;align-items:center;line-height:1.8;font-size:27rpx}.badge{font-size:20rpx;color:#c96842;margin-right:10rpx}.form{display:flex;gap:20rpx;flex-direction:column}.form input,.form textarea{border-bottom:1rpx solid #d8d4c7;padding:18rpx 0;font-size:27rpx}.form textarea{height:130rpx}.form label{font-size:25rpx;color:#71836a}.form .secondary{margin-top:0}</style>
