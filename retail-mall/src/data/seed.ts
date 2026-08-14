import type { Category, DemoDatabase, Product } from '../types/domain'

export const categories: Category[] = [
  { id: 'table', name: '餐桌日常', tagline: '让每一餐慢下来' },
  { id: 'scent', name: '气味与光', tagline: '留住房间的时间' },
  { id: 'carry', name: '出走随行', tagline: '轻装，去见风景' },
  { id: 'rest', name: '居家静处', tagline: '给生活留一块空白' },
]

const asset = '/static/qiwu-editorial-products.png'
const product = (id: string, categoryId: string, name: string, subtitle: string, price: number, tags: string[], stock = 12): Product => ({
  id, categoryId, name, subtitle, image: asset, tags,
  skus: [
    { id: `${id}-one`, name: '日常款', specs: '标准规格', price, stock },
    { id: `${id}-gift`, name: '礼盒装', specs: '附手写卡片', price: price + 20, stock: Math.max(2, stock - 4) },
  ],
})

export const products: Product[] = [
  product('cup', 'table', '雾白手作马克杯', '温润釉面，适合每日第一杯', 78, ['手作', '限量']),
  product('linen', 'table', '亚麻餐桌长巾', '天然褶皱与恰好的垂坠', 128, ['亚麻', '餐桌']),
  product('plate', 'table', '岩灰浅口餐盘', '一人食也值得认真摆盘', 68, ['器物', '日常']),
  product('spoon', 'table', '胡桃木长柄勺', '握感轻柔，纹理独一无二', 48, ['木作', '厨房']),
  product('candle', 'scent', '雪松余温香氛蜡烛', '雪松、鸢尾与微湿泥土', 138, ['香氛', '热卖']),
  product('lamp', 'scent', '黄铜折页桌灯', '一束可调节的夜间光线', 268, ['黄铜', '灯具'], 6),
  product('diffuser', 'scent', '雨后苔藓扩香', '青苔、无花果叶与白木', 118, ['扩香', '空间']),
  product('match', 'scent', '手绘火柴小盒', '给点亮仪式的一点颜色', 32, ['小物', '礼赠']),
  product('tote', 'carry', '松绿帆布托特包', '装得下书、花和临时的决定', 158, ['帆布', '随行']),
  product('basket', 'carry', '藤编野餐提篮', '轻盈但足够结实的周末伙伴', 188, ['藤编', '户外']),
  product('notebook', 'rest', '再生纸方格笔记本', '留给散步后的随手记', 42, ['文具', '再生纸']),
  product('throw', 'rest', '羊毛混纺午睡毯', '一层不喧哗的温暖', 228, ['织物', '居家'], 8),
]

const existingLine = { product: products[0], sku: products[0].skus[0], quantity: 1, lineTotal: 78 }
const address = { id: 'addr-home', name: '林知夏', phone: '138****2681', region: '上海市 徐汇区', detail: '衡山路 188 号 3 幢 502', default: true }

export const createSeedDatabase = (): DemoDatabase => ({
  version: 1,
  cart: [],
  addresses: [address],
  coupons: [
    { id: 'coupon-10', name: '初秋选物礼', threshold: 99, discount: 10, used: false },
    { id: 'coupon-20', name: '慢生活满减券', threshold: 199, discount: 20, used: false },
  ],
  afterSales: [],
  orders: [
    { id: 'order-completed', number: 'QW20260813001', lines: [existingLine], address, goodsTotal: 78, discount: 0, shipping: 12, total: 90, status: 'completed', createdAt: '2026-08-10 14:20' },
    { id: 'order-transit', number: 'QW20260812002', lines: [{ product: products[4], sku: products[4].skus[0], quantity: 1, lineTotal: 138 }], address, goodsTotal: 138, discount: 10, shipping: 12, total: 140, status: 'in_transit', createdAt: '2026-08-12 09:40' },
    { id: 'order-pending', number: 'QW20260813003', lines: [{ product: products[8], sku: products[8].skus[0], quantity: 1, lineTotal: 158 }], address, goodsTotal: 158, discount: 10, shipping: 12, total: 160, status: 'pending_payment', createdAt: '2026-08-13 10:10' },
  ],
})
