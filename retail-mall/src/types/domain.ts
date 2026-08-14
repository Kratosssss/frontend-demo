export type OrderStatus = 'pending_payment' | 'pending_shipment' | 'in_transit' | 'completed' | 'cancelled' | 'after_sale'

export interface Category { id: string; name: string; tagline: string }
export interface Sku { id: string; name: string; specs: string; price: number; stock: number }
export interface Product {
  id: string; categoryId: string; name: string; subtitle: string; image: string; tags: string[]; skus: Sku[]
}
export interface CartLine { id: string; productId: string; skuId: string; quantity: number; selected: boolean }
export interface Address { id: string; name: string; phone: string; region: string; detail: string; default: boolean }
export interface Coupon { id: string; name: string; threshold: number; discount: number; used: boolean }
export interface CheckoutLine { product: Product; sku: Sku; quantity: number; lineTotal: number }
export interface CheckoutQuote { lines: CheckoutLine[]; goodsTotal: number; discount: number; shipping: number; total: number; coupon?: Coupon }
export interface AfterSaleRequest { id: string; orderId: string; reason: string; status: 'requested' | 'approved'; createdAt: string }
export interface Order { id: string; number: string; lines: CheckoutLine[]; address: Address; coupon?: Coupon; goodsTotal: number; discount: number; shipping: number; total: number; status: OrderStatus; createdAt: string; afterSale?: AfterSaleRequest }
export interface DemoDatabase { version: 1; cart: CartLine[]; addresses: Address[]; coupons: Coupon[]; orders: Order[]; afterSales: AfterSaleRequest[] }
