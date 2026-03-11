'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import AdminExportButton from '@/components/AdminExportButton'
import HelpIcon from '@/components/HelpIcon'
import CartIcon from '@/components/CartIcon'
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

export default function ReviewPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [cart, setCart] = useState<CartItem[]>([])
  const [shipping, setShipping] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const email = sessionStorage.getItem('orderEmail')
    const cartData = sessionStorage.getItem('product')
    const shippingData = sessionStorage.getItem('shipping')
    
    if (!email || !cartData || !shippingData) {
      router.push('/')
      return
    }

    try {
      const parsedCart = JSON.parse(cartData)
      const parsedShipping = JSON.parse(shippingData)

      // Handle both array (cart) and single product formats
      setCart(Array.isArray(parsedCart) ? parsedCart : [parsedCart])
      setShipping(parsedShipping)
    } catch (e) {
      router.push('/')
      return
    } finally {
      setLoading(false)
    }
  }, [router])

  const handleSubmit = async () => {
    setError('')
    setSubmitting(true)

    try {
      const email = sessionStorage.getItem('orderEmail')!

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          shipping,
          product: cart // Send cart array
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit order')
      }

      const orderData = await response.json()
      
      sessionStorage.setItem('orderNumber', orderData.order_number)
      
      // Clear selections
      sessionStorage.removeItem('product')
      sessionStorage.removeItem('cart')
      sessionStorage.removeItem('shipping')
      
      router.push('/confirmation')
    } catch (err: any) {
      setError(err.message || 'Failed to submit order. Please try again.')
      setSubmitting(false)
    }
  }

  const total = cart.reduce((sum, item) => sum + (item.price * (item.quantity ?? 1)), 0)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <>
      {/* Fixed position icons - rendered outside relative container */}
      <AdminExportButton />
      <HelpIcon />
      <CartIcon />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 py-12 px-4 relative">
        <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('reviewOrder')}</h1>
            <p className="text-gray-600">{t('reviewInfo')}</p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
              {error}
            </div>
          )}

          {/* Products Section */}
          <div className="mb-6 pb-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t('selectedProducts')} ({cart.reduce((n, i) => n + (i.quantity ?? 1), 0)} items)
            </h2>
            <div className="space-y-3">
              {cart.map((item, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">
                        {item.productName}
                        {(item.quantity ?? 1) > 1 && <span className="text-gray-600 font-normal"> × {item.quantity}</span>}
                      </p>
                      {item.color && <p className="text-sm text-gray-600">Color: {item.color}</p>}
                      {item.size && <p className="text-sm text-gray-600">Size: {item.size}</p>}
                      {item.logo_color && <p className="text-sm text-gray-600">Logo Color: {item.logo_color}</p>}
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      ${((item.price ?? 0) * (item.quantity ?? 1)).toFixed(2)}
                      {(item.quantity ?? 1) > 1 && ` (${item.quantity} × $${(item.price ?? 0).toFixed(2)})`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-lg font-bold">
                <span>{t('total')}:</span>
                <span style={{ color: '#663399' }}>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Information Section */}
          <div className="mb-6 pb-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('shippingInfo')}</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-medium text-gray-900">{shipping.email}</p>
              <p className="font-medium text-gray-900">{shipping.name}</p>
              {shipping.phone && <p className="text-sm text-gray-600">{shipping.phone}</p>}
              <p className="text-sm text-gray-600">{shipping.address}</p>
              <p className="text-sm text-gray-600">{shipping.city}</p>
              <p className="text-sm text-gray-600">{shipping.country}</p>
              <p className="text-sm text-gray-600">{shipping.zip}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-between">
            <button
              type="button"
              onClick={() => router.push('/shipping')}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              ← Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2 text-white rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#663399] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              style={{ backgroundColor: '#663399' }}
            >
              {submitting ? t('submitting') : t('submitOrder')}
            </button>
          </div>
        </div>
      </div>
      </div>
    </>
  )
}
