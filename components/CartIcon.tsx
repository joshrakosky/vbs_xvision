'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/lib/languageContext'

interface CartItem {
  productId: string
  productName: string
  price: number
  quantity?: number
  color?: string
  size?: string
  logo_color?: string
}

const MAX_BUDGET = 100

export default function CartIcon() {
  const { t } = useLanguage()
  const [showCart, setShowCart] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])

  // Load cart from sessionStorage
  useEffect(() => {
    const loadCart = () => {
      const savedCart = sessionStorage.getItem('cart')
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart))
        } catch (e) {
          setCart([])
        }
      }
    }

    loadCart()

    // Listen for cart updates from other components
    const handleStorageChange = () => {
      loadCart()
    }

    const handleCartUpdate = () => {
      loadCart()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('cartUpdated', handleCartUpdate)
    
    // Also check periodically for same-tab updates (less frequent to reduce overhead)
    const interval = setInterval(loadCart, 1000)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('cartUpdated', handleCartUpdate)
      clearInterval(interval)
    }
  }, [])

  // Don't save cart in useEffect - handleRemove does it directly to prevent loops

  const handleRemove = (index: number) => {
    const newCart = cart.filter((_, i) => i !== index)
    setCart(newCart)
    // Update sessionStorage and notify other components
    sessionStorage.setItem('cart', JSON.stringify(newCart))
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const currentTotal = cart.reduce((sum, item) => sum + (item.price * (item.quantity ?? 1)), 0)
  const remainingBudget = MAX_BUDGET - currentTotal
  const itemCount = cart.reduce((sum, item) => sum + (item.quantity ?? 1), 0)

  // Only show cart icon if there are items
  if (itemCount === 0) {
    return null
  }

  return (
    <>
      {/* Cart Icon Button - Fixed position in top-right corner */}
      <button
        onClick={() => setShowCart(true)}
        className="fixed top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg transition-opacity shadow-lg z-50 hover:opacity-90"
        style={{ 
          backgroundColor: '#663399', 
          position: 'fixed',
          top: '1rem',
          right: '1rem',
          zIndex: 50
        }}
        aria-label="Cart"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {itemCount}
          </span>
        )}
      </button>

      {/* Cart Modal */}
      {showCart && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          onClick={() => setShowCart(false)}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)'
          }}
        >
          <div 
            className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold" style={{ color: '#663399' }}>{t('cart')}</h2>
              <button
                onClick={() => setShowCart(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Budget Summary */}
            <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-md">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium" style={{ color: '#663399' }}>{t('currentTotal')}:</span>
                <span className="font-bold" style={{ color: '#663399' }}>${currentTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium" style={{ color: '#663399' }}>{t('remainingBudget')}:</span>
                <span className="font-bold" style={{ color: remainingBudget > 0 ? '#663399' : '#dc2626' }}>
                  ${remainingBudget.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Cart Items */}
            {cart.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">{t('emptyCart')}</p>
              </div>
            ) : (
              <div className="space-y-3 mb-4">
                {cart.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.productName}</p>
                        <div className="mt-1 text-xs text-gray-600">
                          {(item.quantity ?? 1) > 1 && <span className="font-medium">Qty: {item.quantity} • </span>}
                          {[item.color && `Color: ${item.color}`, item.size && `Size: ${item.size}`, item.logo_color && `Logo: ${item.logo_color}`]
                            .filter(Boolean)
                            .join(' • ')}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <span className="font-bold text-gray-900">
                          {(item.quantity ?? 1) > 1
                            ? `${item.quantity} × $${item.price.toFixed(2)} = $${(item.price * (item.quantity ?? 1)).toFixed(2)}`
                            : `$${item.price.toFixed(2)}`}
                        </span>
                        <button
                          onClick={() => handleRemove(index)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                          aria-label="Remove item"
                        >
                          {t('remove')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Total */}
            {cart.length > 0 && (
              <div className="border-t border-gray-200 pt-4 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">{t('total')}:</span>
                  <span className="text-xl font-bold" style={{ color: '#663399' }}>${currentTotal.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
