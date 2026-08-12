export type CampaignStatus = '投放中' | '已暂停' | '草稿'

export interface Campaign {
  id: string
  name: string
  channel: '抖音' | '小红书' | '微信视频号' | '百度'
  objective: '拉新' | '转化' | '品牌曝光'
  status: CampaignStatus
  owner: string
  spend: number
  budget: number
  impressions: number
  clicks: number
  conversions: number
  roi: number
  updatedAt: string
  trend: number[]
}

export interface DashboardFilter {
  channel: '全部' | Campaign['channel']
  period: '近 7 天' | '近 30 天' | '本季度'
}
