/**
 * Stock restrictions by vendor_item_num.
 * OOS = cannot add to cart, option disabled.
 * Low stock = can add, show notation in dropdown.
 * Update when inventory changes.
 */

/** Fallback: customer_item_number -> vendor_item_num when DB vendor_item_num not set */
const CUSTOMER_TO_VENDOR: Record<string, string> = {
  'CES-VEST-MEN': 'KSV-1',
  'CES-VEST-WOMEN': 'KSV-1W',
  'CES-CREW-MEN': 'WK-1',
  'CES-CREW-WOMEN': 'WK-1W',
  'CES-FLEECE-MEN': 'SX-5',
  'CES-FLEECE-WOMEN': 'SX-5W',
  'CES-HOODY-MEN': 'FPL-3M',
  'CES-QZIP-MEN': 'FPL-3M',
  'CES-QZIP-WOMEN': 'FPL-3W',
  'CES-TEE-MEN': 'TG-1',
  'CES-TEE-WOMEN': 'TG-1W',
  'CES-BEANIE-NOVARRA': 'BTV-1',
  'CES-BEANIE-VINTAGE': 'BTC-1',
  'CES-GLOVES': 'GLX-1',
  'CES-SCARF': 'SCX-1',
}

export type StockRule = {
  out_of_stock?: { color: string; sizes: string[] }[]
  low_stock?: { color: string; sizes: string[] }[]
}

export const STOCK_RULES: Record<string, StockRule> = {
  'SX-5W': {
    out_of_stock: [{ color: 'Black', sizes: ['S', 'L'] }],
    low_stock: [{ color: 'Black', sizes: ['XL'] }],
  },
  'TG-1': {
    out_of_stock: [{ color: 'Graphite Heather', sizes: ['4XL', '5XL'] }],
  },
  'TG-1W': {
    out_of_stock: [{ color: 'Black', sizes: ['L', '2XL'] }],
    low_stock: [{ color: 'Black', sizes: ['S'] }],
  },
}

/** Normalize for comparison - case-insensitive, trim, collapse spaces for flexible matching */
function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, '')
}

export function getStockRules(
  vendorItemNum: string | null | undefined,
  customerItemNumber?: string | null
): StockRule | null {
  const vNum = vendorItemNum?.trim() || (customerItemNumber ? CUSTOMER_TO_VENDOR[customerItemNumber.trim()] : undefined)
  if (!vNum) return null
  return STOCK_RULES[vNum] ?? null
}

export function isOutOfStock(
  rules: StockRule | null,
  color: string | null | undefined,
  size: string | null | undefined
): boolean {
  if (!rules?.out_of_stock || !color || !size) return false
  const normColor = normalize(color)
  const normSize = normalize(size)
  return rules.out_of_stock.some(
    (entry) => normalize(entry.color) === normColor && entry.sizes.some((s) => normalize(s) === normSize)
  )
}

export function isLowStock(
  rules: StockRule | null,
  color: string | null | undefined,
  size: string | null | undefined
): boolean {
  if (!rules?.low_stock || !color || !size) return false
  const normColor = normalize(color)
  const normSize = normalize(size)
  return rules.low_stock.some(
    (entry) => normalize(entry.color) === normColor && entry.sizes.some((s) => normalize(s) === normSize)
  )
}

/** Get sizes that are available (not OOS) for a color */
export function getAvailableSizes(
  rules: StockRule | null,
  color: string | null | undefined,
  allSizes: string[]
): string[] {
  if (!color || allSizes.length === 0) return allSizes
  if (!rules?.out_of_stock) return allSizes
  const oosEntry = rules.out_of_stock.find((e) => normalize(e.color) === normalize(color))
  if (!oosEntry) return allSizes
  const oosSet = new Set(oosEntry.sizes.map((s) => normalize(s)))
  return allSizes.filter((s) => !oosSet.has(normalize(s)))
}

/** True if color has no available sizes (all OOS) */
export function isColorFullyOOS(
  rules: StockRule | null,
  color: string | null | undefined,
  allSizes: string[]
): boolean {
  if (!color || allSizes.length === 0) return false
  const available = getAvailableSizes(rules, color, allSizes)
  return available.length === 0
}
