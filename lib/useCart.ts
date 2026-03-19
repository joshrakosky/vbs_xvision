/**
 * Cart hook for XVision - load/save cart from sessionStorage.
 * Cart key: 'cart' (array of CartItem).
 */

export interface CartItem {
  productId?: string
  productName?: string
  price?: number
  quantity?: number
  color?: string
  size?: string
  logo_color?: string
  customText?: string
  category?: string
  // Image URLs for review page display (computed at add-to-cart)
  imageUrl?: string
  scrubTopImageUrl?: string
  scrubBottomImageUrl?: string
  // Scrubs: one cart entry with both top and bottom
  scrubTopId?: string
  scrubTopName?: string
  scrubTopSize?: string
  scrubTopColor?: string
  scrubBottomId?: string
  scrubBottomName?: string
  scrubBottomSize?: string
  scrubBottomColor?: string
}

export function loadCart(): CartItem[] {
  try {
    const saved = sessionStorage.getItem('cart')
    if (!saved) return []
    const parsed = JSON.parse(saved)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveCart(cart: CartItem[]) {
  sessionStorage.setItem('cart', JSON.stringify(cart))
  window.dispatchEvent(new Event('cartUpdated'))
}

/** Count wearables in cart. Scrub set (scrubTopId+scrubBottomId) = 1 wearable. */
export function countWearables(cart: CartItem[]): number {
  return cart.filter((item) => {
    if (item.scrubTopId && item.scrubBottomId) return true // Scrub set = 1
    const wearableCats = ['full_zip_mens', 'full_zip_womens', 'vest_mens', 'vest_womens', 'polo_mens', 'polo_womens', 'sweatshirt_mens', 'sweatshirt_womens', 'half_zip_mens', 'half_zip_womens']
    return item.category && wearableCats.includes(item.category)
  }).length
}
