'use client'

import { useState } from 'react'

export default function HelpIcon() {
  const [showHelp, setShowHelp] = useState(false)

  return (
    <>
      {/* Help Icon */}
      <button
        onClick={() => setShowHelp(true)}
        className="fixed top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg transition-opacity shadow-md z-40 hover:opacity-90"
        style={{ backgroundColor: '#663399' }}
        aria-label="Help"
      >
        ?
      </button>

      {/* Help Modal */}
      {showHelp && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          onClick={() => setShowHelp(false)}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)'
          }}
        >
          <div 
            className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold" style={{ color: '#663399' }}>Help & Contact</h2>
              <button
                onClick={() => setShowHelp(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm mb-2" style={{ color: '#663399' }}>For site questions:</p>
                <a 
                  href="mailto:mpp.ecomm@proforma.com"
                  className="hover:underline font-medium"
                  style={{ color: '#663399' }}
                >
                  mpp.ecomm@proforma.com
                </a>
              </div>
              <div>
                <p className="text-sm mb-2" style={{ color: '#663399' }}>For order questions:</p>
                <a 
                  href="mailto:metroinfo@proforma.com"
                  className="hover:underline font-medium"
                  style={{ color: '#663399' }}
                >
                  metroinfo@proforma.com
                </a>
              </div>
              <div>
                <p className="text-sm mb-2" style={{ color: '#663399' }}>Phone:</p>
                <a 
                  href="tel:317-885-0077"
                  className="hover:underline font-medium"
                  style={{ color: '#663399' }}
                >
                  317-885-0077
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

