import { describe, expect, it } from 'vitest'
import { campaigns, defaultFilter, overview, visibleCampaigns } from './data'

describe('AdPulse mock data layer', () => {
  it('filters campaigns by channel and keyword', () => {
    expect(visibleCampaigns(campaigns, { ...defaultFilter, channel: '小红书' })).toHaveLength(2)
    expect(visibleCampaigns(campaigns, defaultFilter, '高意图')[0]?.id).toBe('CMP-2026-0728')
  })

  it('aggregates active campaign metrics only', () => {
    const metrics = overview(campaigns)
    expect(metrics.spend).toBe(290400)
    expect(metrics.conversions).toBe(10840)
    expect(metrics.roi).toBeGreaterThan(2)
  })
})
