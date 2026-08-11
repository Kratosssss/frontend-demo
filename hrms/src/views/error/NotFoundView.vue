<script setup lang="ts">import { useRouter } from 'vue-router'; const router = useRouter()</script>
<template><main class="error-page"><el-result icon="error" title="404 页面不存在" sub-title="访问地址可能已变更或输入有误。"><template #extra><el-button type="primary" @click="router.push('/dashboard')">返回首页</el-button></template></el-result></main></template>
<style scoped>.error-page { display: grid; min-height: 100vh; place-items: center; background: var(--hrms-bg); }</style>
