import type { DemoDatabase } from '../types/domain'
import { createSeedDatabase } from '../data/seed'

const KEY = 'qiwu:demo:v1:database'
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

export const readDatabase = (): DemoDatabase => {
  try {
    const raw = uni.getStorageSync(KEY) as string | DemoDatabase
    const parsed = typeof raw === 'string' ? JSON.parse(raw) as DemoDatabase : raw
    return parsed?.version === 1 ? parsed : createSeedDatabase()
  } catch { return createSeedDatabase() }
}

export const writeDatabase = (database: DemoDatabase): DemoDatabase => {
  const next = clone(database)
  uni.setStorageSync(KEY, JSON.stringify(next))
  return next
}

export const resetDatabase = (): DemoDatabase => writeDatabase(createSeedDatabase())
