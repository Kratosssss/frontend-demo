import { describe, expect, it } from 'vitest'
import {
  getChartMotionOptions,
  prefersReducedMotion,
  REDUCED_MOTION_QUERY,
} from './motion'

describe('reduced motion', () => {
  it('reads the system reduced-motion media query', () => {
    const queries: string[] = []
    const reduced = prefersReducedMotion((query) => {
      queries.push(query)
      return { matches: true }
    })

    expect(reduced).toBe(true)
    expect(queries).toEqual([REDUCED_MOTION_QUERY])
  })

  it('disables chart animation only when reduced motion is requested', () => {
    expect(getChartMotionOptions(true)).toEqual({
      animation: false,
      animationDuration: 0,
    })
    expect(getChartMotionOptions(false)).toEqual({ animationDuration: 450 })
  })
})
