import { copyFile, mkdir } from 'node:fs/promises'
import { fileURLToPath, URL } from 'node:url'

const rootDir = fileURLToPath(new URL('../', import.meta.url))
const serverDir = fileURLToPath(new URL('../dist/server/', import.meta.url))

await mkdir(serverDir, { recursive: true })
await Promise.all([
  copyFile(`${rootDir}sites/worker.js`, `${serverDir}index.js`),
  copyFile(`${rootDir}sites/wrangler.json`, `${serverDir}wrangler.json`),
])
