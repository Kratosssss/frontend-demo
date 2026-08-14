import { computed, reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import { createSeedDatabase, products } from '../data/seed'
import { addressService, cartService, checkoutService, orderService, quoteFor } from '../services/commerce'
import { readDatabase, resetDatabase, writeDatabase } from '../services/storage'
import type { Address, CheckoutQuote, DemoDatabase, Order } from '../types/domain'

export const useMallStore = defineStore('mall', () => {
  const database = reactive<DemoDatabase>(createSeedDatabase())
  const ready = ref(false)
  const selectedAddressId = ref('addr-home')
  const selectedCouponId = ref('')
  const checkoutLineIds = ref<string[]>([])
  const pendingOrder = ref<Order | null>(null)

  const cartCount = computed(() => database.cart.reduce((sum, line) => sum + line.quantity, 0))
  const selectedLines = computed(() => database.cart.filter((line) => line.selected))
  const defaultAddress = computed(() => database.addresses.find((item) => item.id === selectedAddressId.value) || database.addresses.find((item) => item.default))
  const cartDetails = computed(() => database.cart.map((line) => { const product = products.find((item) => item.id === line.productId)!; const sku = product.skus.find((item) => item.id === line.skuId)!; return { ...line, product, sku, subtotal: sku.price * line.quantity } }))

  const persist = () => writeDatabase(JSON.parse(JSON.stringify(database)) as DemoDatabase)
  const replace = (source: DemoDatabase) => { Object.assign(database, source); selectedAddressId.value = source.addresses.find((item) => item.default)?.id ?? source.addresses[0]?.id ?? '' }
  const hydrate = () => { if (!ready.value) { replace(readDatabase()); ready.value = true } }
  const guard = <T>(task: () => Promise<T>) => task().then((value) => { persist(); return value })

  // H5 can open a lazy-loaded business page directly, before App.onLaunch runs.
  // Hydrate at first store access so every route receives the persisted demo state.
  hydrate()

  const addToCart = (productId: string, skuId: string, quantity: number) => guard(() => cartService.add(database, productId, skuId, quantity))
  const updateLine = (lineId: string, quantity: number) => guard(() => cartService.update(database, lineId, quantity))
  const removeLine = (lineId: string) => guard(() => cartService.remove(database, lineId))
  const setSelected = (lineId: string, selected: boolean) => { const line = database.cart.find((item) => item.id === lineId); if (line) { line.selected = selected; persist() } }
  const prepareCheckout = (lineIds = selectedLines.value.map((item) => item.id)) => { if (!lineIds.length) throw new Error('请先选择商品'); checkoutLineIds.value = lineIds; selectedCouponId.value = ''; return quoteFor(database, lineIds, selectedAddressId.value, '') }
  const quote = computed<CheckoutQuote | null>(() => { try { return checkoutLineIds.value.length ? quoteFor(database, checkoutLineIds.value, selectedAddressId.value, selectedCouponId.value) : null } catch { return null } })
  const selectCoupon = (couponId: string) => { selectedCouponId.value = couponId }
  const selectAddress = (addressId: string) => { selectedAddressId.value = addressId }
  const saveAddress = (address: Address) => guard(() => addressService.save(database, address))
  const createOrder = async () => { if (!quote.value) throw new Error('结算信息无效'); pendingOrder.value = await guard(() => checkoutService.createOrder(database, quote.value!, selectedAddressId.value)); return pendingOrder.value }
  const pay = async (orderId: string) => { const order = await guard(() => checkoutService.pay(database, orderId)); pendingOrder.value = order; return order }
  const cancel = (orderId: string) => guard(() => orderService.cancel(database, orderId))
  const requestAfterSale = (orderId: string, reason: string) => guard(() => orderService.afterSale(database, orderId, reason))
  const reset = () => { replace(resetDatabase()); pendingOrder.value = null; checkoutLineIds.value = []; selectedCouponId.value = ''; ready.value = true }

  return { database, ready, cartCount, cartDetails, selectedLines, defaultAddress, selectedAddressId, selectedCouponId, checkoutLineIds, pendingOrder, hydrate, addToCart, updateLine, removeLine, setSelected, prepareCheckout, quote, selectCoupon, selectAddress, saveAddress, createOrder, pay, cancel, requestAfterSale, reset }
})
