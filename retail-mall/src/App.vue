<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app'
import { useMallStore } from './stores/mall'
import './styles/theme.scss'

onLaunch(() => useMallStore().hydrate())
</script>

<style lang="scss">
page { background: #f4f0e6; color: #22231f; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
