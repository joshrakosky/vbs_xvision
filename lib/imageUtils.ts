/**
 * Helper functions for image path generation
 * Images are named: {sku}_{color}_{logoColor}.jpg
 * Each product color + logo color combo has its own thumbnail.
 * Example: CES-VEST-MEN_BlackDolphin_Purple.jpg, CES-CREW-WOMEN_Graphite_White.jpg
 */

/**
 * Normalize color name to match image filename format
 * Pattern: No spaces, proper capitalization (e.g., "Dark Grey Heather" -> "DarkGreyHeather")
 * Based on actual filenames: VBS_NKFQ4762_DarkGreyHeather.jpg
 */
export function normalizeColorForImage(color: string): string {
  // Handle specific known mappings
  const colorMap: Record<string, string> = {
    'Anthracite Heather': 'AnthraciteHeather',
    'Dark Grey Heather': 'DarkGreyHeather',
    'Dark Grey': 'DarkGrey',
    'Graphite Heather': 'GraphiteHeather',
    'TNF Black': 'TNFBlack',
    'Cape Taupe': 'CapeTaupe',
    'Carbon Heather': 'CarbonHeather',
    'Charcoal Heather': 'CharcoalHeather',
    'Black-Dolphin': 'BlackDolphin', // Single color (vest)
  }
  
  // Check if we have a direct mapping
  if (colorMap[color]) {
    return colorMap[color]
  }
  
  // Default: capitalize first letter of each word and remove spaces
  // Example: "Cape Taupe" -> "CapeTaupe"
  return color
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')
}

/**
 * Generate image path for a product color (+ logo color when available)
 * Format: {sku}_{color}_{logoColor}.jpg - each logo variant has its own image
 * Fallback: {sku}_{color}.jpg when logo color not provided (backward compat)
 * @param customerItemNumber - The SKU / customer item number (e.g., "CES-VEST-MEN", "CES-CREW-WOMEN")
 * @param color - The color name (e.g., "Anthracite Heather")
 * @param logoColor - Optional logo color (e.g., "Purple", "White") - required for 3-part naming
 * @returns Image path (e.g., "/images/CES-VEST-MEN_Black_Purple.jpg")
 */
export function getProductImagePath(
  customerItemNumber: string | null | undefined, 
  color: string,
  logoColor?: string
): string | null {
  if (!customerItemNumber || !color) return null
  
  const normalizedColor = normalizeColorForImage(color)
  // 3-part format when logo color known; otherwise 2-part for fallback
  if (logoColor) {
    const normalizedLogo = normalizeColorForImage(logoColor)
    return `/images/${customerItemNumber}_${normalizedColor}_${normalizedLogo}.jpg`
  }
  return `/images/${customerItemNumber}_${normalizedColor}.jpg`
}

/**
 * Generate image paths for all color + logoColor combos of a product
 * @param logoColors - Defaults to ["Purple", "White"] if not provided
 */
export function generateColorThumbnails(
  customerItemNumber: string | null | undefined,
  colors: string[] | null | undefined,
  logoColors?: string[]
): Record<string, string> | null {
  if (!customerItemNumber || !colors || colors.length === 0) return null
  
  const logos = logoColors && logoColors.length > 0 ? logoColors : ['Purple', 'White']
  const thumbnails: Record<string, string> = {}
  
  colors.forEach(color => {
    logos.forEach(logoColor => {
      const key = `${color}_${logoColor}`
      const path = getProductImagePath(customerItemNumber, color, logoColor)
      if (path) thumbnails[key] = path
    })
  })
  
  return thumbnails
}

