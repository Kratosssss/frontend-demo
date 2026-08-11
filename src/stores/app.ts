import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', () => {
  const collapsed = ref(false)
  const mobileOpen = ref(false)
  const toggleCollapsed = () => { collapsed.value = !collapsed.value }
  return { collapsed, mobileOpen, toggleCollapsed }
})
