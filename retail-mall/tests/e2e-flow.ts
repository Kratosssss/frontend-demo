import assert from "node:assert/strict";
import { createSeedDatabase } from "../src/data/seed";
import {
  cartService,
  checkoutService,
  orderService,
  quoteFor,
} from "../src/services/commerce";
const db = createSeedDatabase();
await cartService.add(db, "key75", "key75-blue", 2);
const line = db.cart[0];
const quote = quoteFor(db, [line.id], "addr-home", "coupon-demo");
const order = await checkoutService.createOrder(db, quote, "addr-home", [
  line.id,
]);
await checkoutService.pay(db, order.id);
assert.equal(db.orders[0].status, "pending_shipment");
assert.equal(db.cart.length, 0);
const cancelled = db.orders.find((o) => o.id === "order-pending");
if (!cancelled) throw new Error("missing seed order");
await orderService.cancel(db, cancelled.id);
await orderService.afterSale(db, "order-completed", "演示售后申请", "维修");
console.log(`MORU local lifecycle passed: ${order.number}`);
