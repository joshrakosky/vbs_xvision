'use client'

import { useState } from 'react'

/**
 * Circular info button for backpack selection page.
 * Opens a popup with links (TBD). Matches AdminExportButton/HelpIcon style.
 */
export default function BackpackInfoButton() {
  const [showPopup, setShowPopup] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowPopup(true)}
        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg transition-opacity shadow-md hover:opacity-90 flex-shrink-0"
        style={{ backgroundColor: '#663399' }}
        aria-label="Backpack info"
        title="Backpack info"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      {showPopup && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          onClick={() => setShowPopup(false)}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
          }}
        >
          <div
            className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold" style={{ color: '#663399' }}>
                Backpack Info
              </h2>
              <button
                onClick={() => setShowPopup(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-gray-600 text-sm">Links and resources for backpack selection.</p>
              {/* TBD: Add links here when available */}
              <div className="text-sm text-gray-500 italic">Links coming soon.</div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
