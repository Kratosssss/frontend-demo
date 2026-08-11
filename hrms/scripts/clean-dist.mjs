import { rm } from 'node:fs/promises'
import { fileURLToPath, URL } from 'node:url'

const distDir = fileURLToPath(new URL('../dist/', import.meta.url))

await rm(distDir, { force: true, recursive: true })
