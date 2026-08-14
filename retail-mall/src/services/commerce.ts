import { categories, products } from '../data/seed'
import type { Address, CheckoutQuote, Coupon, DemoDatabase, Order, Product, Sku } from '../types/domain'

const delay = () => new Promise<void>((resolve) => setTimeout(resolve, 120))
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T
const skuFor = (productId: string, skuId: string): { product: Product; sku: Sku } => {
  const product = products.find((item) => item.id === productId)
  const sku = product?.skus.find((item) => item.id === skuId)
  if (!product || !sku) throw new Error('商品规格不存在，请刷新后重试')
  return { product, sku }
}

export const catalogService = {
  async list(keyword = '', categoryId = '') { await delay(); return products.filter((item) => (!categoryId || item.categoryId === categoryId) && `${item.name}${item.subtitle}${item.tags.join('')}`.includes(keyword)) },
  async detail(id: string) { await delay(); const product = products.find((item) => item.id === id); if (!product) throw new Error('商品已下架'); return product },
  async categories() { await delay(); return categories },
}

export const quoteFor = (database: DemoDatabase, lineIds: string[], addressId: string, couponId = ''): CheckoutQuote => {
  const address = database.addresses.find((item) => item.id === addressId)
  if (!address) throw new Error('请先选择收货地址')
  const cart = database.cart.filter((item) => lineIds.includes(item.id))
  if (!cart.length) throw new Error('请先选择需要结算的商品')
  const lines = cart.map((line) => { const { product, sku } = skuFor(line.productId, line.skuId); if (line.quantity > sku.stock) throw new Error(`${product.name} 库存不足`); return { product, sku, quantity: line.quantity, lineTotal: sku.price * line.quantity } })
  const goodsTotal = lines.reduce((sum, line) => sum + line.lineTotal, 0)
  const coupon = database.coupons.find((item) => item.id === couponId && !item.used)
  if (coupon && goodsTotal < coupon.threshold) throw new Error(`该优惠券需满 ¥${coupon.threshold} 才可使用`)
  const discount = coupon?.discount ?? 0
  const shipping = goodsTotal >= 199 ? 0 : 12
  return { lines, goodsTotal, discount, shipping, total: goodsTotal - discount + shipping, coupon }
}

export const cartService = {
  async add(database: DemoDatabase, productId: string, skuId: string, quantity: number) {
    await delay(); if (!Number.isInteger(quantity) || quantity < 1) throw new Error('数量必须大于 0')
    const { product, sku } = skuFor(productId, skuId); const line = database.cart.find((item) => item.productId === productId && item.skuId === skuId)
    const next = (line?.quantity ?? 0) + quantity; if (next > sku.stock) throw new Error(`${product.name} 仅剩 ${sku.stock} 件`)
    if (line) line.quantity = next; else database.cart.push({ id: `line-${Date.now()}`, productId, skuId, quantity, selected: true })
    return clone(database.cart)
  },
  async update(database: DemoDatabase, lineId: string, quantity: number) { await delay(); const line = database.cart.find((item) => item.id === lineId); if (!line) throw new Error('购物袋商品不存在'); const { sku } = skuFor(line.productId, line.skuId); if (!Number.isInteger(quantity) || quantity < 1 || quantity > sku.stock) throw new Error(`数量需在 1 至 ${sku.stock} 之间`); line.quantity = quantity; return clone(database.cart) },
  async remove(database: DemoDatabase, lineId: string) { await delay(); database.cart = database.cart.filter((item) => item.id !== lineId); return clone(database.cart) },
}

export const addressService = {
  async save(database: DemoDatabase, address: Address) { await delay(); if (!address.name || !address.phone || !address.region || !address.detail) throw new Error('请完整填写地址信息'); if (address.default) database.addresses.forEach((item) => { item.default = false }); const index = database.addresses.findIndex((item) => item.id === address.id); if (index >= 0) database.addresses[index] = address; else database.addresses.push({ ...address, id: `addr-${Date.now()}` }); return clone(database.addresses) },
}

export const couponService = { async usable(database: DemoDatabase, amount: number): Promise<Coupon[]> { await delay(); return database.coupons.filter((item) => !item.used && amount >= item.threshold) } }

export const checkoutService = {
  async quote(database: DemoDatabase, lineIds: string[], addressId: string, couponId = '') { await delay(); return quoteFor(database, lineIds, addressId, couponId) },
  async createOrder(database: DemoDatabase, quote: CheckoutQuote, addressId: string): Promise<Order> { await delay(); const address = database.addresses.find((item) => item.id === addressId); if (!address) throw new Error('请先选择收货地址'); const order: Order = { id: `order-${Date.now()}`, number: `QW${Date.now()}`, lines: quote.lines, address: clone(address), coupon: quote.coupon, goodsTotal: quote.goodsTotal, discount: quote.discount, shipping: quote.shipping, total: quote.total, status: 'pending_payment', createdAt: new Date().toLocaleString('zh-CN', { hour12: false }) }; database.orders.unshift(order); return clone(order) },
  async pay(database: DemoDatabase, orderId: string) { await delay(); const order = database.orders.find((item) => item.id === orderId); if (!order || order.status !== 'pending_payment') throw new Error('该订单当前不能支付'); order.status = 'pending_shipment'; database.cart = database.cart.filter((line) => !order.lines.some((item) => item.product.id === line.productId && item.sku.id === line.skuId)); if (order.coupon) { const coupon = database.coupons.find((item) => item.id === order.coupon?.id); if (coupon) coupon.used = true }; return clone(order) },
}

export const orderService = {
  async cancel(database: DemoDatabase, orderId: string) { await delay(); const order = database.orders.find((item) => item.id === orderId); if (!order || order.status !== 'pending_payment') throw new Error('仅待付款订单可以取消'); order.status = 'cancelled'; return clone(order) },
  async afterSale(database: DemoDatabase, orderId: string, reason: string) { await delay(); const order = database.orders.find((item) => item.id === orderId); if (!order || order.status !== 'completed') throw new Error('仅已完成订单可以申请售后'); if (!reason.trim()) throw new Error('请填写售后原因'); const request = { id: `as-${Date.now()}`, orderId, reason: reason.trim(), status: 'requested' as const, createdAt: new Date().toLocaleString('zh-CN', { hour12: false }) }; order.status = 'after_sale'; order.afterSale = request; database.afterSales.unshift(request); return clone(request) },
}

export const demoService = { async reset() { await delay() } }
