/**
 * Helper functions for image path generation
 * Images are named: VBS_{item#}_{color}.jpg
 * Example: VBS_NKFQ4762_Black.jpg
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
    'Dark Grey Heather': 'DarkGreyHeather', // No spaces, proper capitalization
    'Dark Grey': 'DarkGrey',
    'Graphite Heather': 'GraphiteHeather',
    'TNF Black': 'TNFBlack',
    'Cape Taupe': 'CapeTaupe',
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
 * Generate image path for a product color
 * @param customerItemNumber - The customer item number (e.g., "CES-AP-NKFQ4762" or "VBS-AP-NKFQ4762")
 * @param color - The color name (e.g., "Anthracite Heather")
 * @param size - Optional size for kits (e.g., "8oz", "26oz", "35oz")
 * @returns Image path (e.g., "/images/VBS_NKFQ4762_AnthraciteHeather.jpg" or "/images/VBS-YETI-08-Black.jpg")
 */
export function getProductImagePath(
  customerItemNumber: string | null | undefined, 
  color: string,
  size?: string
): string | null {
  if (!customerItemNumber || !color) return null
  
  // Special handling for kits with size-specific naming (if needed)
  // Example: if customerItemNumber === 'CES-KIT-YETI-08' or 'VBS-KIT-YETI-08'
  if ((customerItemNumber.includes('KIT-YETI') || customerItemNumber.includes('KIT')) && size) {
    // Convert size to number format: "8oz" -> "08", "26oz" -> "26", "35oz" -> "35"
    const sizeNumber = size.replace('oz', '').padStart(2, '0') // "8oz" -> "08", "26oz" -> "26"
    const normalizedColor = normalizeColorForImage(color)
    return `/images/VBS-YETI-${sizeNumber}-${normalizedColor}.jpg`
  }
  
  // Extract the item number part (e.g., "NKFQ4762" from "CES-AP-NKFQ4762" or "VBS-AP-NKFQ4762")
  let itemNumber = customerItemNumber
  
  // If it contains dashes, extract everything after "CES-" or "VBS-"
  if (customerItemNumber.startsWith('CES-')) {
    // Remove "CES-" prefix and keep the rest
    itemNumber = customerItemNumber.replace('CES-', '')
    // If there are more dashes, extract the last part
    if (itemNumber.includes('-')) {
      const parts = itemNumber.split('-')
      itemNumber = parts[parts.length - 1] // Get last part (e.g., "NKFQ4762")
    }
  } else if (customerItemNumber.startsWith('VBS-')) {
    // Remove "VBS-" prefix and keep the rest
    itemNumber = customerItemNumber.replace('VBS-', '')
    // If there are more dashes, extract the last part
    if (itemNumber.includes('-')) {
      const parts = itemNumber.split('-')
      itemNumber = parts[parts.length - 1] // Get last part (e.g., "NKFQ4762")
    }
  }
  
  // Normalize color for filename (no spaces, proper capitalization)
  const normalizedColor = normalizeColorForImage(color)
  
  // Generate path: /images/VBS_{item#}_{color}.jpg
  return `/images/VBS_${itemNumber}_${normalizedColor}.jpg`
}

/**
 * Generate image paths for all colors of a product
 * Returns a map of color name -> image path
 */
export function generateColorThumbnails(
  customerItemNumber: string | null | undefined,
  colors: string[] | null | undefined
): Record<string, string> | null {
  if (!customerItemNumber || !colors || colors.length === 0) return null
  
  const thumbnails: Record<string, string> = {}
  
  colors.forEach(color => {
    const path = getProductImagePath(customerItemNumber, color)
    if (path) {
      thumbnails[color] = path
    }
  })
  
  return thumbnails
}

