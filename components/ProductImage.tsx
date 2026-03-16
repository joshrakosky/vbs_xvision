'use client'

import { useState } from 'react'

interface ProductImageProps {
  src: string
  alt?: string
  className?: string
}

/**
 * Product image that enlarges in a popup when clicked.
 */
export default function ProductImage({ src, alt = '', className = '' }: ProductImageProps) {
  const [showLightbox, setShowLightbox] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setShowLightbox(true)}
        className="flex justify-center w-full cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-[#663399] focus:ring-offset-2 rounded-lg"
      >
        <img src={src} alt={alt} className={`rounded-lg object-contain ${className}`} />
      </button>

      {showLightbox && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          onClick={() => setShowLightbox(false)}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <button
            type="button"
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 text-white text-3xl font-bold hover:opacity-80"
            aria-label="Close"
          >
            ×
          </button>
          <img
            src={src}
            alt={alt}
            className="max-h-[90vh] max-w-full w-auto object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
