import { computed, reactive, ref } from "vue";
import { defineStore } from "pinia";
import { createSeedDatabase, products } from "../data/seed";
import {
  addressService,
  cartService,
  checkoutService,
  orderService,
  quoteFor,
} from "../services/commerce";
import {
  readDatabase,
  resetDatabase,
  writeDatabase,
} from "../services/storage";
import type {
  Address,
  CartLine,
  CheckoutQuote,
  DemoDatabase,
  Order,
  Product,
  Sku,
} from "../types/domain";

export const useMallStore = defineStore("mall", () => {
  const database = reactive<DemoDatabase>(createSeedDatabase());
  const ready = ref(false);
  const recovered = ref(false);
  const selectedAddressId = ref("addr-home");
  const selectedCouponId = ref("");
  const checkoutLineIds = ref<string[]>([]);
  const pendingOrder = ref<Order | null>(null);
  const cartCount = computed(() =>
    database.cart.reduce((sum, line) => sum + line.quantity, 0),
  );
  const selectedLines = computed(() =>
    database.cart.filter((line) => line.selected && !line.boundOrderId),
  );
  const defaultAddress = computed(
    () =>
      database.addresses.find((item) => item.id === selectedAddressId.value) ||
      database.addresses.find((item) => item.default),
  );
  const cartDetails = computed(
    () =>
      database.cart
        .map((line) => {
          const product = products.find((item) => item.id === line.productId);
          const sku = product?.skus.find((item) => item.id === line.skuId);
          return product && sku
            ? { ...line, product, sku, subtotal: sku.price * line.quantity }
            : null;
        })
        .filter(Boolean) as Array<
        CartLine & { product: Product; sku: Sku; subtotal: number }
      >,
  );
  const selectedTotal = computed(() => {
    const eligibleIds = new Set(selectedLines.value.map((line) => line.id));
    return cartDetails.value
      .filter((line) => eligibleIds.has(line.id))
      .reduce((sum, line) => sum + line.subtotal, 0);
  });
  const snapshot = () => JSON.parse(JSON.stringify(database)) as DemoDatabase;
  const persist = () => writeDatabase(snapshot());
  const replace = (source: DemoDatabase) => {
    Object.assign(database, source);
    selectedAddressId.value =
      source.addresses.find((item) => item.default)?.id ??
      source.addresses[0]?.id ??
      "";
  };
  const hydrate = () => {
    if (!ready.value) {
      const result = readDatabase();
      replace(result.database);
      recovered.value = result.recovered;
      ready.value = true;
    }
  };
  const guard = async <T>(task: () => Promise<T>) => {
    const trusted = snapshot();
    try {
      const value = await task();
      persist();
      return value;
    } catch (error) {
      replace(trusted);
      throw error;
    }
  };
  hydrate();
  const addToCart = (productId: string, skuId: string, quantity: number) =>
    guard(() => cartService.add(database, productId, skuId, quantity));
  const updateLine = (lineId: string, quantity: number) =>
    guard(() => cartService.update(database, lineId, quantity));
  const removeLine = (lineId: string) =>
    guard(() => cartService.remove(database, lineId));
  const setSelected = (lineId: string, selected: boolean) => {
    const line = database.cart.find((item) => item.id === lineId);
    if (line && !line.boundOrderId) {
      const trusted = snapshot();
      line.selected = selected;
      try {
        persist();
      } catch (error) {
        replace(trusted);
        throw error;
      }
    }
  };
  const prepareCheckout = (
    lineIds = selectedLines.value.map((item) => item.id),
  ) => {
    if (!lineIds.length) throw new Error("请先选择至少一件未绑定商品");
    checkoutLineIds.value = lineIds;
    selectedCouponId.value = "";
    return quoteFor(database, lineIds, selectedAddressId.value, "");
  };
  const quote = computed<CheckoutQuote | null>(() => {
    try {
      return checkoutLineIds.value.length
        ? quoteFor(
            database,
            checkoutLineIds.value,
            selectedAddressId.value,
            selectedCouponId.value,
          )
        : null;
    } catch {
      return null;
    }
  });
  const selectCoupon = (couponId: string) => {
    selectedCouponId.value = couponId;
  };
  const selectAddress = (addressId: string) => {
    selectedAddressId.value = addressId;
  };
  const saveAddress = (address: Address) =>
    guard(() => addressService.save(database, address));
  const createOrder = async () => {
    const currentQuote = quote.value;
    if (!currentQuote) throw new Error("结算信息无效，请返回购物袋修正");
    pendingOrder.value = await guard(() =>
      checkoutService.createOrder(
        database,
        currentQuote,
        selectedAddressId.value,
        checkoutLineIds.value,
      ),
    );
    return pendingOrder.value;
  };
  const pay = async (orderId: string, shouldFail = false) => {
    const order = await guard(() =>
      checkoutService.pay(database, orderId, shouldFail),
    );
    pendingOrder.value = order;
    return order;
  };
  const cancel = (orderId: string) =>
    guard(() => orderService.cancel(database, orderId));
  const requestAfterSale = (orderId: string, reason: string, type: string) =>
    guard(() => orderService.afterSale(database, orderId, reason, type));
  const reset = () => {
    replace(resetDatabase());
    pendingOrder.value = null;
    checkoutLineIds.value = [];
    selectedCouponId.value = "";
    recovered.value = false;
    ready.value = true;
  };
  return {
    database,
    ready,
    recovered,
    cartCount,
    cartDetails,
    selectedLines,
    selectedTotal,
    defaultAddress,
    selectedAddressId,
    selectedCouponId,
    checkoutLineIds,
    pendingOrder,
    hydrate,
    addToCart,
    updateLine,
    removeLine,
    setSelected,
    prepareCheckout,
    quote,
    selectCoupon,
    selectAddress,
    saveAddress,
    createOrder,
    pay,
    cancel,
    requestAfterSale,
    reset,
  };
});
