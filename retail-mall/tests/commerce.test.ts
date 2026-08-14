import test from 'node:test'
import assert from 'node:assert/strict'
import { createSeedDatabase, products } from '../src/data/seed'
import { cartService, checkoutService, orderService, quoteFor } from '../src/services/commerce'

test('金额试算正确计算运费和优惠券', () => {
  const database = createSeedDatabase()
  database.cart.push({ id: 'line-a', productId: 'candle', skuId: 'candle-one', quantity: 2, selected: true })
  const quote = quoteFor(database, ['line-a'], 'addr-home', 'coupon-20')
  assert.equal(quote.goodsTotal, 276)
  assert.equal(quote.discount, 20)
  assert.equal(quote.shipping, 0)
  assert.equal(quote.total, 256)
})

test('库存、优惠门槛和数量约束会阻止错误交易', async () => {
  const database = createSeedDatabase()
  await assert.rejects(() => cartService.add(database, 'lamp', 'lamp-one', 7), /仅剩 6 件/)
  database.cart.push({ id: 'line-a', productId: 'cup', skuId: 'cup-one', quantity: 1, selected: true })
  assert.throws(() => quoteFor(database, ['line-a'], 'addr-home', 'coupon-20'), /需满 ¥199/)
})

test('支付创建待发货订单并清空已结算购物袋', async () => {
  const database = createSeedDatabase()
  database.cart.push({ id: 'line-a', productId: 'cup', skuId: 'cup-one', quantity: 2, selected: true })
  const quote = quoteFor(database, ['line-a'], 'addr-home')
  const order = await checkoutService.createOrder(database, quote, 'addr-home')
  assert.equal(order.status, 'pending_payment')
  await checkoutService.pay(database, order.id)
  assert.equal(database.orders[0].status, 'pending_shipment')
  assert.equal(database.cart.length, 0)
})

test('仅完成订单可申请售后', async () => {
  const database = createSeedDatabase()
  const request = await orderService.afterSale(database, 'order-completed', '尺寸不适合')
  assert.equal(request.status, 'requested')
  assert.equal(database.orders.find((order) => order.id === 'order-completed')?.status, 'after_sale')
  assert.equal(products.length, 12)
})
