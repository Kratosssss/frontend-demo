import { defineConfig } from 'vite'
import uniPlugin from '@dcloudio/vite-plugin-uni'

// The published package is CommonJS-shaped while this project uses ESM config.
const uni = (uniPlugin as unknown as { default?: () => unknown[] }).default
  ?? (uniPlugin as unknown as () => unknown[])

export default defineConfig({
  base: '/qiwu-mall/',
  plugins: uni(),
})
