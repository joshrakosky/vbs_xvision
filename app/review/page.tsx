'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import AdminExportButton from '@/components/AdminExportButton'
import HelpIcon from '@/components/HelpIcon'
import CartIcon from '@/components/CartIcon'
import { loadCart, CartItem } from '@/lib/useCart'

export default function ReviewPage() {
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])
  const [shipping, setShipping] = useState<Record<string, string> | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const email = sessionStorage.getItem('orderEmail')
    const cartData = sessionStorage.getItem('cart')
    const shippingData = sessionStorage.getItem('shipping')

    if (!email || !cartData || !shippingData) {
      router.push('/')
      return
    }

    try {
      const parsedCart = JSON.parse(cartData)
      const parsedShipping = JSON.parse(shippingData)
      setCart(Array.isArray(parsedCart) ? parsedCart : [])
      setShipping(parsedShipping)
    } catch {
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, shipping, cart }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit order')
      }

      const orderData = await response.json()
      sessionStorage.setItem('orderNumber', orderData.order_number)
      sessionStorage.removeItem('cart')
      sessionStorage.removeItem('shipping')
      router.push('/confirmation')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit order. Please try again.')
      setSubmitting(false)
    }
  }

  const getItemDisplay = (item: CartItem) => {
    if (item.scrubTopId) {
      const topColor = item.scrubTopColor || 'Black'
      const bottomColor = item.scrubBottomColor || 'Black'
      return `Scrub set: ${item.scrubTopName} (${item.scrubTopSize}, ${topColor}) + ${item.scrubBottomName} (${item.scrubBottomSize}, ${bottomColor})`
    }
    let s = item.productName || ''
    if (item.color) s += ` - ${item.color}`
    if (item.size) s += ` (${item.size})`
    if (item.customText) s += ` - "${item.customText}"`
    return s
  }

  const itemCount = cart.reduce((n, i) => n + (i.quantity ?? 1), 0)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <>
      <AdminExportButton />
      <HelpIcon />
      <CartIcon />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 py-12 px-4 relative">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Review Your Order</h1>
              <p className="text-gray-600">Please review your selection and shipping information before submitting.</p>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">{error}</div>
            )}

            <div className="mb-6 pb-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Selected Products ({itemCount} items)</h2>
              <div className="space-y-3">
                {cart.map((item, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <p className="font-medium text-gray-900">{getItemDisplay(item)}</p>
                  </div>
                ))}
              </div>
            </div>

            {shipping && (
              <div className="mb-6 pb-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Shipping Information</h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-medium text-gray-900">{shipping.name}</p>
                  <p className="text-sm text-gray-600">{shipping.email}</p>
                  {shipping.phone && <p className="text-sm text-gray-600">{shipping.phone}</p>}
                  <p className="text-sm text-gray-600">{shipping.address}</p>
                  {shipping.address2 && <p className="text-sm text-gray-600">{shipping.address2}</p>}
                  <p className="text-sm text-gray-600">
                    {shipping.city}, {shipping.state} {shipping.zip}
                  </p>
                  <p className="text-sm text-gray-600">{shipping.country}</p>
                </div>
              </div>
            )}

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
                {submitting ? 'Submitting...' : 'Submit Order →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
