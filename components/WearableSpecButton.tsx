'use client'

/** Spec sheet URLs by product customer_item_number (regular wearables only) */
const WEARABLE_SPEC_LINKS: Record<string, string> = {
  'VBS-VEST-MEN': 'https://www.sanmar.com/p/10273_Black/specSheetMeasurements',
  'VBS-VEST-WOMEN': 'https://www.sanmar.com/p/23288_Black/specSheetMeasurements',
  'VBS-OGIO-FZIP-MEN': 'https://www.sanmar.com/p/46576_BlueMist/specSheetMeasurements',
  'VBS-OGIO-FZIP-WOMEN': 'https://www.sanmar.com/p/46577_Blacktop/specSheetMeasurements',
  'VBS-CREW-MEN': 'https://www.ssactivewear.com/ShopNow/ItemSpecSheet.aspx?ID=14401&ColorID=124829&LanguageCode=en',
  'VBS-CREW-WOMEN': 'https://www.ssactivewear.com/ShopNow/ItemSpecSheet.aspx?ID=14443&ColorID=125053&LanguageCode=en',
}

interface WearableSpecButtonProps {
  /** Selected regular wearable product - when set and has spec link, button is active */
  selectedProduct?: { name: string; customer_item_number?: string } | null
}

/**
 * Circular spec button for wearable selection page (regular wearables only).
 * Jumps directly to SanMar spec sheet when product has a link.
 */
export default function WearableSpecButton({ selectedProduct }: WearableSpecButtonProps) {
  const specUrl = selectedProduct?.customer_item_number
    ? WEARABLE_SPEC_LINKS[selectedProduct.customer_item_number]
    : null

  const baseClass = 'w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg transition-opacity shadow-md flex-shrink-0'
  const enabledClass = specUrl ? 'hover:opacity-90 cursor-pointer' : 'opacity-50 cursor-not-allowed'

  if (specUrl) {
    return (
      <a
        href={specUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`${baseClass} ${enabledClass}`}
        style={{ backgroundColor: '#663399' }}
        aria-label="View spec sheet"
        title="View spec sheet"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </a>
    )
  }

  return (
    <span
      className={`${baseClass} ${enabledClass}`}
      style={{ backgroundColor: '#663399' }}
      title="Select a wearable with size chart to view spec sheet"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </span>
  )
}
