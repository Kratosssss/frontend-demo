export const newId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

export const nowIso = () => new Date().toISOString()

export const paginate = <T>(items: T[], page = 1, pageSize = 10) => ({
  list: items.slice((page - 1) * pageSize, page * pageSize),
  total: items.length,
  page,
  pageSize,
})

export const calcDuration = (start: string, end: string) => {
  const diff = new Date(end).getTime() - new Date(start).getTime()
  return Math.max(0.5, Math.round((diff / 86_400_000) * 2) / 2)
}

export const formatDate = (value?: string | null) => {
  if (!value) return '—'
  return new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium' }).format(new Date(value))
}
