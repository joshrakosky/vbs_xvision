/**
 * XVision page config - route order, categories, and count limits.
 * No budget tracking; only product counts are enforced.
 */

export const ROUTE_ORDER = ['instructions', 'bags', 'water-bottles', 'wearables-1', 'wearables-2', 'misc', 'shipping', 'review', 'confirmation'] as const
export type RouteKey = (typeof ROUTE_ORDER)[number]

/** Product categories mapped to route/page */
export const ROUTE_CATEGORIES: Record<string, string[]> = {
  bags: ['bags'],
  'water-bottles': ['water_bottle'],
  'wearables-1': [
    'full_zip_mens',
    'full_zip_womens',
    'vest_mens',
    'vest_womens',
    'polo_mens',
    'polo_womens',
    'sweatshirt_mens',
    'sweatshirt_womens',
    'half_zip_mens',
    'half_zip_womens',
    'scrub_top',
    'scrub_bottom',
  ],
  'wearables-2': [
    'full_zip_mens',
    'full_zip_womens',
    'vest_mens',
    'vest_womens',
    'polo_mens',
    'polo_womens',
    'sweatshirt_mens',
    'sweatshirt_womens',
    'half_zip_mens',
    'half_zip_womens',
    'scrub_top',
    'scrub_bottom',
  ],
  misc: ['journal', 'name_badge'],
}

/** Count limits per route - max items user can select */
export const COUNT_LIMITS: Record<string, number> = {
  bags: 1,
  'water-bottles': 1,
  'wearables-1': 1,
  'wearables-2': 1,
  misc: 2, // journal (0 or 1) + name_badge (0 or 1)
}

/** Required minimum - bags and water-bottles require 1 selection */
export const REQUIRED_MIN: Record<string, number> = {
  bags: 1,
  'water-bottles': 1,
  'wearables-1': 1,
  'wearables-2': 1,
  misc: 0,
}

/** Next route after current (for Continue button) */
export function getNextRoute(current: string): string | null {
  const idx = ROUTE_ORDER.indexOf(current as RouteKey)
  if (idx < 0 || idx >= ROUTE_ORDER.length - 1) return null
  return ROUTE_ORDER[idx + 1]
}

/** Previous route (for Back button) */
export function getPrevRoute(current: string): string | null {
  const idx = ROUTE_ORDER.indexOf(current as RouteKey)
  if (idx <= 0) return null
  return ROUTE_ORDER[idx - 1]
}
