import test from "node:test";
import assert from "node:assert/strict";
import { createSeedDatabase, products } from "../src/data/seed";
import {
  cartService,
  checkoutService,
  orderService,
  quoteFor,
} from "../src/services/commerce";
import {
  dialogKeyAction,
  nextDialogFocusIndex,
} from "../src/services/dialog-focus";
import { readDatabase } from "../src/services/storage";
import { createPinia, setActivePinia } from "pinia";
import { useMallStore } from "../src/stores/mall";

test("MORU 固定目录是七款场景型数码商品", () => {
  assert.equal(products.length, 7);
  assert.equal(products[0].name, "MORU KEY 75");
  assert.equal(
    products.some((product) =>
      product.skus.some((sku) => sku.stockState === "out_of_stock"),
    ),
    true,
  );
});
test("创建待付款订单会绑定购物袋并预占优惠券", async () => {
  const db = createSeedDatabase();
  await cartService.add(db, "key75", "key75-blue", 2);
  const line = db.cart[0];
  const quote = quoteFor(db, [line.id], "addr-home", "coupon-demo");
  const order = await checkoutService.createOrder(db, quote, "addr-home", [
    line.id,
  ]);
  assert.equal(order.status, "pending_payment");
  assert.equal(db.cart[0].boundOrderId, order.id);
  assert.equal(db.coupons[0].state, "reserved");
});
test("支付成功仅移除绑定行并耗券，失败保持可信状态", async () => {
  const db = createSeedDatabase();
  await cartService.add(db, "key75", "key75-blue", 2);
  await cartService.add(db, "pulse-c65", "c65-pink", 1);
  const quote = quoteFor(db, [db.cart[0].id], "addr-home", "coupon-demo");
  const order = await checkoutService.createOrder(db, quote, "addr-home", [
    db.cart[0].id,
  ]);
  await assert.rejects(
    () => checkoutService.pay(db, order.id, true),
    /未产生真实扣款/,
  );
  assert.equal(db.cart.length, 2);
  assert.equal(db.coupons[0].state, "reserved");
  await checkoutService.pay(db, order.id);
  assert.equal(db.orders[0].status, "pending_shipment");
  assert.equal(db.cart.length, 1);
  assert.equal(db.coupons[0].state, "used");
  await assert.rejects(
    () => checkoutService.pay(db, order.id),
    /当前不能模拟支付/,
  );
  assert.equal(db.cart.length, 1);
  assert.equal(db.coupons[0].state, "used");
});
test("取消会保留购物袋并释放预占券，售后只能提交一次", async () => {
  const db = createSeedDatabase();
  await cartService.add(db, "key75", "key75-blue", 2);
  const line = db.cart[0];
  const quote = quoteFor(db, [line.id], "addr-home", "coupon-demo");
  const order = await checkoutService.createOrder(db, quote, "addr-home", [
    line.id,
  ]);
  await orderService.cancel(db, order.id);
  assert.equal(db.cart[0].boundOrderId, undefined);
  assert.equal(db.coupons[0].state, "available");
  const request = await orderService.afterSale(
    db,
    "order-completed",
    "按键不适合",
    "退货退款",
  );
  assert.equal(request.status, "requested");
  await assert.rejects(() =>
    orderService.afterSale(db, "order-completed", "重复", "维修"),
  );
});
test("绑定待付款订单的规格会创建独立购物袋行，支付不丢失后加数量", async () => {
  const db = createSeedDatabase();
  await cartService.add(db, "move-s2", "s2-512", 1);
  const boundLine = db.cart[0];
  const quote = quoteFor(db, [boundLine.id], "addr-home");
  const order = await checkoutService.createOrder(db, quote, "addr-home", [
    boundLine.id,
  ]);
  await cartService.add(db, "move-s2", "s2-512", 1);
  assert.equal(db.cart.length, 2);
  assert.equal(db.cart[0].boundOrderId, order.id);
  assert.equal(db.cart[1].boundOrderId, undefined);
  await checkoutService.pay(db, order.id);
  assert.deepEqual(
    db.cart.map((line) => ({
      quantity: line.quantity,
      boundOrderId: line.boundOrderId,
    })),
    [{ quantity: 1, boundOrderId: undefined }],
  );
});
test("同一结算行的重复并发创建会恢复同一待付款订单", async () => {
  const db = createSeedDatabase();
  await cartService.add(db, "key75", "key75-blue", 1);
  const line = db.cart[0];
  const quote = quoteFor(db, [line.id], "addr-home");
  const pendingBefore = db.orders.filter(
    (item) => item.status === "pending_payment",
  ).length;
  const [first, second] = await Promise.all([
    checkoutService.createOrder(db, quote, "addr-home", [line.id]),
    checkoutService.createOrder(db, quote, "addr-home", [line.id]),
  ]);
  assert.equal(first.id, second.id);
  assert.equal(
    db.orders.filter((item) => item.status === "pending_payment").length,
    pendingBefore + 1,
  );
  assert.equal(db.orders.filter((item) => item.id === first.id).length, 1);
});
test("缺字段 v2 数据会恢复种子，首次无数据不误报损坏", () => {
  const runtime = globalThis as unknown as { uni: Record<string, unknown> };
  runtime.uni = { getStorageSync: () => "" };
  const fresh = readDatabase();
  assert.equal(fresh.recovered, false);
  assert.ok(fresh.database.addresses.length);
  runtime.uni = {
    getStorageSync: () => JSON.stringify({ version: 2, cart: [], orders: [] }),
  };
  const damaged = readDatabase();
  assert.equal(damaged.recovered, true);
  assert.ok(damaged.database.coupons.length);
  assert.ok(Array.isArray(damaged.database.afterSales));
});
test("持久化失败会回滚 addToCart 的 reactive 数据库", async () => {
  const runtime = globalThis as unknown as { uni: Record<string, unknown> };
  runtime.uni = {
    getStorageSync: () => "",
    setStorageSync: () => {
      throw new Error("quota blocked");
    },
  };
  setActivePinia(createPinia());
  const store = useMallStore();
  await assert.rejects(
    () => store.addToCart("move-s2", "s2-512", 1),
    /quota blocked/,
  );
  assert.equal(store.database.cart.length, 0);
  assert.equal(store.cartCount, 0);
});
test("持久化失败会回滚 setSelected，供页面显示可理解错误", async () => {
  const runtime = globalThis as unknown as { uni: Record<string, unknown> };
  runtime.uni = {
    getStorageSync: () =>
      JSON.stringify({
        ...createSeedDatabase(),
        cart: [
          {
            id: "line-test",
            productId: "move-s2",
            skuId: "s2-512",
            quantity: 1,
            selected: true,
          },
        ],
      }),
    setStorageSync: () => {
      throw new Error("quota blocked");
    },
  };
  setActivePinia(createPinia());
  const store = useMallStore();
  assert.throws(() => store.setSelected("line-test", false), /quota blocked/);
  assert.equal(store.database.cart[0].selected, true);
});
test("取消 Dialog 焦点索引只在内部循环", () => {
  assert.equal(nextDialogFocusIndex(3, 0, true), 2);
  assert.equal(nextDialogFocusIndex(3, 2, false), 0);
  assert.equal(nextDialogFocusIndex(3, 0, false), 1);
  assert.deepEqual(dialogKeyAction(5, 4, "Tab"), {
    type: "move",
    index: 0,
  });
  assert.deepEqual(dialogKeyAction(5, 0, "Tab", true), {
    type: "move",
    index: 4,
  });
  assert.deepEqual(dialogKeyAction(5, 2, "Escape"), { type: "close" });
});

test("购物袋显示合计与新结算集合共享未绑定资格", async () => {
  let persisted = "";
  const runtime = globalThis as unknown as { uni: Record<string, unknown> };
  runtime.uni = {
    getStorageSync: () => persisted,
    setStorageSync: (_key: string, value: string) => {
      persisted = value;
    },
  };
  setActivePinia(createPinia());
  const store = useMallStore();
  await store.addToCart("move-s2", "s2-512", 1);
  store.prepareCheckout();
  const pending = await store.createOrder();
  await store.addToCart("move-s2", "s2-512", 1);
  assert.equal(store.database.cart.length, 2);
  assert.equal(store.selectedLines.length, 1);
  assert.equal(store.selectedTotal, 499);
  assert.equal(store.prepareCheckout().goodsTotal, 499);
  await store.pay(pending.id);
  assert.equal(store.database.cart.length, 1);
  assert.equal(store.database.cart[0].boundOrderId, undefined);
  assert.equal(store.database.cart[0].selected, true);
  assert.equal(store.selectedTotal, 499);
});
