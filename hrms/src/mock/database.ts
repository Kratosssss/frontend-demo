import { createSeedDatabase } from './seed'
import type { HrmsDatabase } from '@/types/models'

export const DB_KEY = 'hrms_demo_db_v1'
export const DB_VERSION = 1

export const readDatabase = (): HrmsDatabase => {
  const raw = localStorage.getItem(DB_KEY)
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as HrmsDatabase
      if (parsed.version === DB_VERSION) return parsed
    } catch {
      localStorage.removeItem(DB_KEY)
    }
  }
  return resetDatabase()
}

export const writeDatabase = (db: HrmsDatabase) => localStorage.setItem(DB_KEY, JSON.stringify(db))

export const resetDatabase = () => {
  const db = createSeedDatabase()
  writeDatabase(db)
  return db
}

export const updateDatabase = (mutator: (db: HrmsDatabase) => void) => {
  const db = readDatabase()
  mutator(db)
  writeDatabase(db)
  return db
}
