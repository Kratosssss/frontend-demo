export type OrderStatus =
  | "pending_payment"
  | "pending_shipment"
  | "in_transit"
  | "completed"
  | "cancelled"
  | "after_sale";
export type CouponState = "available" | "ineligible" | "reserved" | "used";
export type StockState = "available" | "low_stock" | "out_of_stock";

export interface Category {
  id: string;
  name: string;
  tagline: string;
}
export interface Sku {
  id: string;
  name: string;
  specs: string;
  price: number;
  stock: number;
  stockState: StockState;
  parameters: Record<string, string>;
}
export interface Product {
  id: string;
  slug: string;
  categoryId: string;
  name: string;
  subtitle: string;
  image: string;
  imageAlt: string;
  tags: string[];
  useCases: string[];
  benefits: string[];
  compatibility: string[];
  limitations: string[];
  included: string[];
  shippingNote: string;
  returnsNote: string;
  supportNote: string;
  skus: Sku[];
}
export interface CartLine {
  id: string;
  productId: string;
  skuId: string;
  quantity: number;
  selected: boolean;
  boundOrderId?: string;
}
export interface Address {
  id: string;
  name: string;
  phone: string;
  region: string;
  detail: string;
  default: boolean;
}
export interface Coupon {
  id: string;
  name: string;
  threshold: number;
  discount: number;
  state: CouponState;
  reservedOrderId?: string;
}
export interface CheckoutLine {
  product: Product;
  sku: Sku;
  quantity: number;
  lineTotal: number;
}
export interface CheckoutQuote {
  lines: CheckoutLine[];
  goodsTotal: number;
  discount: number;
  shipping: number;
  total: number;
  coupon?: Coupon;
}
export interface AfterSaleRequest {
  id: string;
  orderId: string;
  reason: string;
  type: string;
  status: "requested";
  createdAt: string;
}
export interface Order {
  id: string;
  number: string;
  lines: CheckoutLine[];
  address: Address;
  coupon?: Coupon;
  goodsTotal: number;
  discount: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  afterSale?: AfterSaleRequest;
}
export interface DemoDatabase {
  version: 2;
  cart: CartLine[];
  addresses: Address[];
  coupons: Coupon[];
  orders: Order[];
  afterSales: AfterSaleRequest[];
}
