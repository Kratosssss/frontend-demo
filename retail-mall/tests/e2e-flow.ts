import assert from 'node:assert/strict'
import { createSeedDatabase } from '../src/data/seed'
import { cartService, checkoutService, orderService, quoteFor } from '../src/services/commerce'

const database = createSeedDatabase()
await cartService.add(database, 'candle', 'candle-one', 1)
const line = database.cart[0]
const quote = quoteFor(database, [line.id], 'addr-home', 'coupon-10')
const order = await checkoutService.createOrder(database, quote, 'addr-home')
await checkoutService.pay(database, order.id)
database.orders[0].status = 'completed'
await orderService.afterSale(database, order.id, '演示售后申请')
assert.equal(database.orders[0].status, 'after_sale')
assert.equal(database.cart.length, 0)
console.log(`E2E demo flow passed: ${order.number}`)
