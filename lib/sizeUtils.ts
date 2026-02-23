/**
 * Utility to parse size options from product data.
 * Handles spreadsheet formats: "S-5XL", "XS-2XL", "S, M, L", "OSFA"
 */

/** Standard size order for expanding ranges */
const SIZE_ORDER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL']

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
