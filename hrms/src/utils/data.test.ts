import { calcDuration, paginate } from './data'

describe('data utilities', () => {
  it('paginates without changing the source list', () => {
    const source = [1, 2, 3, 4, 5]
    expect(paginate(source, 2, 2)).toEqual({ list: [3, 4], total: 5, page: 2, pageSize: 2 })
    expect(source).toHaveLength(5)
  })

  it('calculates leave duration by half-day units', () => {
    expect(calcDuration('2026-08-01T09:00:00.000Z', '2026-08-02T09:00:00.000Z')).toBe(1)
    expect(calcDuration('2026-08-01T09:00:00.000Z', '2026-08-01T13:00:00.000Z')).toBe(0.5)
  })
})
