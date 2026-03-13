'use client'

import { useState, useEffect } from 'react'

interface CartItem {
  productId?: string
  productName?: string
  price?: number
  quantity?: number
  color?: string
  size?: string
  logo_color?: string
  customText?: string
  scrubTopId?: string
  scrubTopName?: string
  scrubTopSize?: string
  scrubBottomId?: string
  scrubBottomName?: string
  scrubBottomSize?: string
}

export default function CartIcon() {
  const [showCart, setShowCart] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])

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
    const handleStorageChange = () => loadCart()
    const handleCartUpdate = () => loadCart()

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('cartUpdated', handleCartUpdate)
    const interval = setInterval(loadCart, 1000)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('cartUpdated', handleCartUpdate)
      clearInterval(interval)
    }
  }, [])

  const handleRemove = (index: number) => {
    const newCart = cart.filter((_, i) => i !== index)
    setCart(newCart)
    sessionStorage.setItem('cart', JSON.stringify(newCart))
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const itemCount = cart.reduce((sum, item) => sum + (item.quantity ?? 1), 0)
  const hasPrices = cart.some((item) => typeof item.price === 'number')
  const total = hasPrices
    ? cart.reduce((sum, item) => sum + ((item.price ?? 0) * (item.quantity ?? 1)), 0)
    : null

  if (itemCount === 0) return null

  return (
    <>
      <button
        onClick={() => setShowCart(true)}
        className="fixed top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg transition-opacity shadow-lg z-50 hover:opacity-90"
        style={{ backgroundColor: '#663399', top: '1rem', right: '1rem', zIndex: 50 }}
        aria-label="Cart"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
          {itemCount}
        </span>
      </button>

      {showCart && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          onClick={() => setShowCart(false)}
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(4px)' }}
        >
          <div
            className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold" style={{ color: '#663399' }}>Cart</h2>
              <button onClick={() => setShowCart(false)} className="text-gray-500 hover:text-gray-700 text-2xl font-bold" aria-label="Close">
                ×
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-3 mb-4">
                {cart.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {item.scrubTopId
                            ? `Scrub set: ${item.scrubTopName} (${item.scrubTopSize}) + ${item.scrubBottomName} (${item.scrubBottomSize})`
                            : item.productName}
                        </p>
                        <div className="mt-1 text-xs text-gray-600">
                          {[(item.quantity ?? 1) > 1 && `Qty: ${item.quantity}`, item.color && `Color: ${item.color}`, item.size && `Size: ${item.size}`, item.logo_color && `Logo: ${item.logo_color}`, item.customText && `Name: ${item.customText}`]
                            .filter(Boolean)
                            .join(' • ')}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        {typeof item.price === 'number' && (
                          <span className="font-bold text-gray-900">
                            {(item.quantity ?? 1) > 1
                              ? `${item.quantity} × $${item.price.toFixed(2)} = $${(item.price * (item.quantity ?? 1)).toFixed(2)}`
                              : `$${item.price.toFixed(2)}`}
                          </span>
                        )}
                        <button
                          onClick={() => handleRemove(index)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                          aria-label="Remove item"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {cart.length > 0 && total !== null && (
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total:</span>
                  <span className="text-xl font-bold" style={{ color: '#663399' }}>${total.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
