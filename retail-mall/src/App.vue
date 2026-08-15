<script setup lang="ts">
import { onLaunch } from "@dcloudio/uni-app";
import { useMallStore } from "./stores/mall";
import "./styles/theme.scss";
onLaunch(() => useMallStore().hydrate());
</script>
<style lang="scss">
/* uni-app H5 requires tabBar metadata at runtime; MORU supplies its own header navigation. */
.uni-tabbar,
.uni-tabbar-border,
.uni-tabbar-placeholder {
  display: none !important;
}
</style>
