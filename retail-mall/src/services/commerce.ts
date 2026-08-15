import { categories, products } from "../data/seed";
import type {
  Address,
  CheckoutQuote,
  Coupon,
  DemoDatabase,
  Order,
  Product,
  Sku,
} from "../types/domain";

const delay = () => new Promise<void>((resolve) => setTimeout(resolve, 120));
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const stamp = () => new Date().toLocaleString("zh-CN", { hour12: false });
const skuFor = (
  productId: string,
  skuId: string,
): { product: Product; sku: Sku } => {
  const product = products.find((item) => item.id === productId);
  const sku = product?.skus.find((item) => item.id === skuId);
  if (!product || !sku) throw new Error("商品或规格不可用，请返回目录重新选择");
  return { product, sku };
};

export const catalogService = {
  async list(keyword = "", categoryId = "") {
    await delay();
    const key = keyword.trim().toLowerCase();
    return products.filter(
      (item) =>
        (!categoryId || item.categoryId === categoryId) &&
        (!key ||
          `${item.name}${item.subtitle}${item.tags.join("")}${item.useCases.join("")}`
            .toLowerCase()
            .includes(key)),
    );
  },
  async detail(id: string) {
    await delay();
    const product = products.find((item) => item.id === id || item.slug === id);
    if (!product) throw new Error("该商品链接无效，未回退到其他商品。");
    return product;
  },
  async categories() {
    await delay();
    return categories;
  },
};

export const quoteFor = (
  database: DemoDatabase,
  lineIds: string[],
  addressId: string,
  couponId = "",
): CheckoutQuote => {
  const address = database.addresses.find((item) => item.id === addressId);
  if (!address) throw new Error("请先选择一个演示收货地址");
  const cart = database.cart.filter((item) => lineIds.includes(item.id));
  if (!cart.length) throw new Error("请先选择需要结算的商品");
  if (cart.some((line) => line.boundOrderId))
    throw new Error("选中商品已绑定待付款订单，请继续支付或取消原订单");
  const lines = cart.map((line) => {
    const { product, sku } = skuFor(line.productId, line.skuId);
    if (!sku.stock || line.quantity > sku.stock)
      throw new Error(`${product.name} 当前规格不可结算`);
    return {
      product,
      sku,
      quantity: line.quantity,
      lineTotal: sku.price * line.quantity,
    };
  });
  const goodsTotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const coupon = database.coupons.find((item) => item.id === couponId);
  if (coupon && coupon.state !== "available")
    throw new Error("该优惠券当前不可使用");
  if (coupon && goodsTotal < coupon.threshold)
    throw new Error(`该优惠券需满 ¥${coupon.threshold} 才可使用`);
  const discount = coupon?.discount ?? 0;
  const shipping = goodsTotal >= 499 ? 0 : 18;
  return {
    lines,
    goodsTotal,
    discount,
    shipping,
    total: Math.max(0, goodsTotal - discount + shipping),
    coupon,
  };
};

export const cartService = {
  async add(
    database: DemoDatabase,
    productId: string,
    skuId: string,
    quantity: number,
  ) {
    await delay();
    if (!Number.isInteger(quantity) || quantity < 1)
      throw new Error("数量必须是大于 0 的整数");
    const { product, sku } = skuFor(productId, skuId);
    if (!sku.stock) throw new Error("该规格已售罄，暂不能加入购物袋");
    const line = database.cart.find(
      (item) =>
        item.productId === productId &&
        item.skuId === skuId &&
        !item.boundOrderId,
    );
    const next = (line?.quantity ?? 0) + quantity;
    if (next > sku.stock)
      throw new Error(`${product.name} 演示库存最多 ${sku.stock} 件`);
    if (line) line.quantity = next;
    else
      database.cart.push({
        id: `line-${Date.now()}`,
        productId,
        skuId,
        quantity,
        selected: true,
      });
    return clone(database.cart);
  },
  async update(database: DemoDatabase, lineId: string, quantity: number) {
    await delay();
    const line = database.cart.find((item) => item.id === lineId);
    if (!line) throw new Error("购物袋商品不存在");
    if (line.boundOrderId)
      throw new Error("此商品已绑定待付款订单，暂不能修改");
    const { sku } = skuFor(line.productId, line.skuId);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > sku.stock)
      throw new Error(`数量需在 1 至 ${sku.stock} 之间`);
    line.quantity = quantity;
    return clone(database.cart);
  },
  async remove(database: DemoDatabase, lineId: string) {
    await delay();
    const line = database.cart.find((item) => item.id === lineId);
    if (line?.boundOrderId)
      throw new Error("此商品已绑定待付款订单，暂不能移除");
    database.cart = database.cart.filter((item) => item.id !== lineId);
    return clone(database.cart);
  },
};
export const addressService = {
  async save(database: DemoDatabase, address: Address) {
    await delay();
    if (
      !address.name.trim() ||
      !address.phone.trim() ||
      !address.region.trim() ||
      !address.detail.trim()
    )
      throw new Error("请完整填写演示地址信息");
    if (address.default)
      database.addresses.forEach((item) => {
        item.default = false;
      });
    const index = database.addresses.findIndex(
      (item) => item.id === address.id,
    );
    if (index >= 0) database.addresses[index] = clone(address);
    else database.addresses.push({ ...address, id: `addr-${Date.now()}` });
    return clone(database.addresses);
  },
};
export const couponService = {
  async usable(database: DemoDatabase, amount: number): Promise<Coupon[]> {
    await delay();
    return database.coupons.filter(
      (item) => item.state === "available" && amount >= item.threshold,
    );
  },
};
export const checkoutService = {
  async createOrder(
    database: DemoDatabase,
    quote: CheckoutQuote,
    addressId: string,
    lineIds: string[],
  ): Promise<Order> {
    await delay();
    const selectedLines = database.cart.filter((line) =>
      lineIds.includes(line.id),
    );
    if (selectedLines.length !== lineIds.length)
      throw new Error("结算商品已变化，请返回购物袋重新确认");
    const existingOrderIds = new Set(
      selectedLines.map((line) => line.boundOrderId).filter(Boolean),
    );
    if (existingOrderIds.size === 1) {
      const existing = database.orders.find(
        (item) =>
          item.id === [...existingOrderIds][0] &&
          item.status === "pending_payment",
      );
      if (existing) return clone(existing);
    }
    if (existingOrderIds.size)
      throw new Error("结算商品已绑定其他待付款订单，请先完成或取消原订单");
    const address = database.addresses.find((item) => item.id === addressId);
    if (!address) throw new Error("请先选择收货地址");
    const actualQuote = quoteFor(
      database,
      lineIds,
      addressId,
      quote.coupon?.id ?? "",
    );
    if (
      actualQuote.goodsTotal !== quote.goodsTotal ||
      actualQuote.discount !== quote.discount ||
      actualQuote.shipping !== quote.shipping ||
      actualQuote.total !== quote.total
    )
      throw new Error("结算金额已变化，请返回购物袋重新确认");
    const id = `order-${Date.now()}`;
    const order: Order = {
      id,
      number: `MR${Date.now()}`,
      lines: clone(actualQuote.lines),
      address: clone(address),
      coupon: actualQuote.coupon ? clone(actualQuote.coupon) : undefined,
      goodsTotal: actualQuote.goodsTotal,
      discount: actualQuote.discount,
      shipping: actualQuote.shipping,
      total: actualQuote.total,
      status: "pending_payment",
      createdAt: stamp(),
    };
    database.cart.forEach((line) => {
      if (lineIds.includes(line.id)) line.boundOrderId = id;
    });
    if (actualQuote.coupon) {
      const coupon = database.coupons.find(
        (item) => item.id === actualQuote.coupon?.id,
      );
      if (coupon) {
        coupon.state = "reserved";
        coupon.reservedOrderId = id;
      }
    }
    database.orders.unshift(order);
    return clone(order);
  },
  async pay(database: DemoDatabase, orderId: string, shouldFail = false) {
    await delay();
    const order = database.orders.find((item) => item.id === orderId);
    if (!order || order.status !== "pending_payment")
      throw new Error("该订单当前不能模拟支付");
    if (shouldFail)
      throw new Error("模拟支付失败：未产生真实扣款，可返回重试。");
    order.status = "pending_shipment";
    database.cart = database.cart.filter(
      (line) => line.boundOrderId !== order.id,
    );
    if (order.coupon) {
      const coupon = database.coupons.find(
        (item) => item.id === order.coupon?.id,
      );
      if (coupon) {
        coupon.state = "used";
        delete coupon.reservedOrderId;
      }
    }
    return clone(order);
  },
};
export const orderService = {
  async cancel(database: DemoDatabase, orderId: string) {
    await delay();
    const order = database.orders.find((item) => item.id === orderId);
    if (!order || order.status !== "pending_payment")
      throw new Error("仅待付款订单可以取消");
    order.status = "cancelled";
    database.cart.forEach((line) => {
      if (line.boundOrderId === orderId) delete line.boundOrderId;
    });
    const coupon = database.coupons.find(
      (item) => item.reservedOrderId === orderId,
    );
    if (coupon) {
      coupon.state = "available";
      delete coupon.reservedOrderId;
    }
    return clone(order);
  },
  async afterSale(
    database: DemoDatabase,
    orderId: string,
    reason: string,
    type: string,
  ) {
    await delay();
    const order = database.orders.find((item) => item.id === orderId);
    if (!order || order.status !== "completed" || order.afterSale)
      throw new Error("仅无售后申请的已完成订单可以申请售后");
    if (!reason.trim()) throw new Error("请填写售后原因");
    const request = {
      id: `as-${Date.now()}`,
      orderId,
      reason: reason.trim(),
      type,
      status: "requested" as const,
      createdAt: stamp(),
    };
    order.status = "after_sale";
    order.afterSale = request;
    database.afterSales.unshift(request);
    return clone(request);
  },
};
