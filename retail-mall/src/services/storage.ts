import type { DemoDatabase } from "../types/domain";
import { createSeedDatabase } from "../data/seed";
const KEY = "moru:demo:v2:database";
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);
const isString = (value: unknown): value is string => typeof value === "string";
const isCartLine = (value: unknown) =>
  isRecord(value) &&
  isString(value.id) &&
  isString(value.productId) &&
  isString(value.skuId) &&
  Number.isInteger(value.quantity) &&
  (value.quantity as number) > 0 &&
  typeof value.selected === "boolean" &&
  (value.boundOrderId === undefined || isString(value.boundOrderId));
const isAddress = (value: unknown) =>
  isRecord(value) &&
  ["id", "name", "phone", "region", "detail"].every((key) =>
    isString(value[key]),
  ) &&
  typeof value.default === "boolean";
const isCoupon = (value: unknown) =>
  isRecord(value) &&
  isString(value.id) &&
  isString(value.name) &&
  typeof value.threshold === "number" &&
  typeof value.discount === "number" &&
  ["available", "ineligible", "reserved", "used"].includes(
    String(value.state),
  ) &&
  (value.reservedOrderId === undefined || isString(value.reservedOrderId));
const isOrder = (value: unknown) =>
  isRecord(value) &&
  isString(value.id) &&
  isString(value.number) &&
  Array.isArray(value.lines) &&
  isAddress(value.address) &&
  ["goodsTotal", "discount", "shipping", "total"].every(
    (key) => typeof value[key] === "number",
  ) &&
  [
    "pending_payment",
    "pending_shipment",
    "in_transit",
    "completed",
    "cancelled",
    "after_sale",
  ].includes(String(value.status)) &&
  isString(value.createdAt);
const isAfterSale = (value: unknown) =>
  isRecord(value) &&
  ["id", "orderId", "reason", "type", "createdAt"].every((key) =>
    isString(value[key]),
  ) &&
  value.status === "requested";
export const isDatabaseV2 = (value: unknown): value is DemoDatabase =>
  isRecord(value) &&
  value.version === 2 &&
  Array.isArray(value.cart) &&
  value.cart.every(isCartLine) &&
  Array.isArray(value.addresses) &&
  value.addresses.every(isAddress) &&
  Array.isArray(value.coupons) &&
  value.coupons.every(isCoupon) &&
  Array.isArray(value.orders) &&
  value.orders.every(isOrder) &&
  Array.isArray(value.afterSales) &&
  value.afterSales.every(isAfterSale);
export const readDatabase = (): {
  database: DemoDatabase;
  recovered: boolean;
} => {
  try {
    const raw = uni.getStorageSync(KEY) as string | DemoDatabase;
    if (raw === "" || raw === null || raw === undefined)
      return { database: createSeedDatabase(), recovered: false };
    const parsed =
      typeof raw === "string" ? (JSON.parse(raw) as DemoDatabase) : raw;
    if (isDatabaseV2(parsed)) return { database: parsed, recovered: false };
  } catch {
    /* invalid browser data is deliberately recovered */
  }
  return { database: createSeedDatabase(), recovered: true };
};
export const writeDatabase = (database: DemoDatabase): DemoDatabase => {
  const next = clone(database);
  uni.setStorageSync(KEY, JSON.stringify(next));
  return next;
};
export const resetDatabase = (): DemoDatabase =>
  writeDatabase(createSeedDatabase());
