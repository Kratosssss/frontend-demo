<script setup lang="ts">import { useRouter } from 'vue-router'; const router = useRouter()</script>
<template><main class="error-page"><el-result icon="warning" title="403 无权访问" sub-title="当前账号没有访问此页面的权限。"><template #extra><el-button type="primary" @click="router.push('/dashboard')">返回可访问首页</el-button></template></el-result></main></template>
<style scoped>.error-page { display: grid; min-height: 100vh; place-items: center; background: var(--hrms-bg); }</style>
