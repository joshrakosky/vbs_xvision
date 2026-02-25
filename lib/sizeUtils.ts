/**
 * Utility to parse size options from product data.
 * Handles spreadsheet formats: "S-5XL", "XS-2XL", "S, M, L", "OSFA"
 * French display: TP, P, M, G, TG, 2TG, etc. - orders always export in English.
 */

/** Standard size order for expanding ranges (English - used for storage/export) */
const SIZE_ORDER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL']

/** English → French size labels (per French sizing chart: TP=XS, P=S, M, G, TG, 2TG, etc.) */
const EN_TO_FR: Record<string, string> = {
  'XS': 'TP',
  'S': 'P',
  'M': 'M',
  'L': 'G',
  'XL': 'TG',
  '2XL': '2TG',
  '3XL': '3TG',
  '4XL': '4TG',
  '5XL': '5TG',
  'OSFA': 'OSFA',
}

/**
 * Expand a size range like "S-5XL" into individual sizes
 */
function expandRange(range: string): string[] {
  const trimmed = range.trim()
  const dashIdx = trimmed.indexOf('-')
  if (dashIdx === -1) return [trimmed]

  const start = trimmed.slice(0, dashIdx).trim()
  const end = trimmed.slice(dashIdx + 1).trim()
  const startIdx = SIZE_ORDER.indexOf(start)
  const endIdx = SIZE_ORDER.indexOf(end)
  if (startIdx === -1 || endIdx === -1 || startIdx > endIdx) return [trimmed]
  return SIZE_ORDER.slice(startIdx, endIdx + 1)
}

/**
 * Parse size options from product available_sizes.
 * Handles: "S-5XL", "XS-2XL", "S, M, L", "OSFA", or already-expanded arrays.
 */
export function parseSizeOptions(sizes: string[] | null | undefined): string[] {
  if (!sizes || sizes.length === 0) return []
  const result: string[] = []
  for (const s of sizes) {
    const val = s.trim()
    if (!val) continue
    if (val.includes('-') && !val.startsWith('-')) {
      result.push(...expandRange(val))
    } else if (val.includes(',')) {
      result.push(...val.split(',').map(part => part.trim()).filter(Boolean))
    } else {
      result.push(val)
    }
  }
  return [...new Set(result)]
}

/**
 * Get display label for a size based on language.
 * French: TP, P, M, G, TG, 2TG, etc. English: XXS, XS, S, M, L, XL, etc.
 * Orders/cart always store English for export.
 */
export function getSizeDisplayLabel(englishSize: string, language: 'en' | 'fr'): string {
  if (language === 'fr') {
    return EN_TO_FR[englishSize] ?? englishSize
  }
  return englishSize
}
