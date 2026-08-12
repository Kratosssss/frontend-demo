import type { Campaign, CampaignStatus, DashboardFilter } from '../types'

export const defaultFilter: DashboardFilter = { channel: '全部', period: '近 30 天' }

export const campaigns: Campaign[] = [
  { id: 'CMP-2026-0812', name: '秋季新品 · 节气礼盒', channel: '抖音', objective: '转化', status: '投放中', owner: '林妍', spend: 128400, budget: 180000, impressions: 3240000, clicks: 178200, conversions: 6420, roi: 3.86, updatedAt: '12:18', trend: [62, 72, 68, 88, 94, 112, 128] },
  { id: 'CMP-2026-0808', name: '城市快闪 · 会员招募', channel: '小红书', objective: '拉新', status: '投放中', owner: '周笙', spend: 86400, budget: 120000, impressions: 1860000, clicks: 95200, conversions: 3180, roi: 2.71, updatedAt: '11:46', trend: [42, 55, 51, 66, 73, 78, 86] },
  { id: 'CMP-2026-0801', name: '品牌态度片 · 夏日不设限', channel: '微信视频号', objective: '品牌曝光', status: '投放中', owner: '许宁', spend: 75600, budget: 100000, impressions: 4120000, clicks: 68100, conversions: 1240, roi: 1.92, updatedAt: '10:32', trend: [72, 67, 85, 92, 80, 91, 96] },
  { id: 'CMP-2026-0728', name: '搜索承接 · 高意图人群', channel: '百度', objective: '转化', status: '已暂停', owner: '林妍', spend: 48600, budget: 60000, impressions: 780000, clicks: 76300, conversions: 2840, roi: 4.12, updatedAt: '昨天', trend: [58, 68, 61, 74, 81, 70, 64] },
  { id: 'CMP-2026-0720', name: '七夕预热 · 礼赠场景', channel: '小红书', objective: '转化', status: '草稿', owner: '唐琪', spend: 0, budget: 90000, impressions: 0, clicks: 0, conversions: 0, roi: 0, updatedAt: '8 月 10 日', trend: [0, 0, 0, 0, 0, 0, 0] },
]

export const formatNumber = (value: number) => new Intl.NumberFormat('zh-CN').format(value)

export function visibleCampaigns(items: Campaign[], filter: DashboardFilter, keyword = '') {
  return items.filter((campaign) => {
    const matchesChannel = filter.channel === '全部' || campaign.channel === filter.channel
    const matchesKeyword = campaign.name.toLowerCase().includes(keyword.trim().toLowerCase()) || campaign.id.toLowerCase().includes(keyword.trim().toLowerCase())
    return matchesChannel && matchesKeyword
  })
}

export function overview(items: Campaign[]) {
  const active = items.filter((item) => item.status === '投放中')
  const spend = active.reduce((total, item) => total + item.spend, 0)
  const impressions = active.reduce((total, item) => total + item.impressions, 0)
  const clicks = active.reduce((total, item) => total + item.clicks, 0)
  const conversions = active.reduce((total, item) => total + item.conversions, 0)
  return { spend, impressions, clicks, conversions, ctr: clicks / impressions, cvr: conversions / clicks, roi: active.reduce((total, item) => total + item.roi * item.spend, 0) / spend }
}

export function nextStatus(status: CampaignStatus): CampaignStatus {
  return status === '投放中' ? '已暂停' : '投放中'
}
