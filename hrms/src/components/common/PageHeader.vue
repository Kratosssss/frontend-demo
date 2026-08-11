<script setup lang="ts">
defineProps<{ title: string; description?: string }>()
</script>

<template>
  <div class="page-header">
    <div>
      <h1>{{ title }}</h1>
      <p v-if="description">{{ description }}</p>
    </div>
    <div class="page-header__actions"><slot /></div>
  </div>
</template>

<style scoped>
.page-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
h1 { margin: 0; font-size: 24px; line-height: 1.3; }
p { margin: 6px 0 0; color: var(--hrms-muted); font-size: 14px; }
.page-header__actions { display: flex; gap: 10px; }
@media (max-width: 600px) { .page-header { align-items: flex-start; } h1 { font-size: 21px; } }
</style>
