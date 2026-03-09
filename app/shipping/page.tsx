'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import AdminExportButton from '@/components/AdminExportButton'
import HelpIcon from '@/components/HelpIcon'
import CartIcon from '@/components/CartIcon'
import { useLanguage } from '@/lib/languageContext'
import { FIXED_SHIPPING_ADDRESS } from '@/lib/shippingConfig'

export default function ShippingPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    address: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    country: 'USA'
  })
  const [error, setError] = useState('')

  useEffect(() => {
    // Check if user has access (from code entry) and has cart
    const accessGranted = sessionStorage.getItem('accessGranted')
    const product = sessionStorage.getItem('product')
    if (!accessGranted || !product) {
      router.push('/')
      return
    }

    // Pre-populate shipping info with fixed address; email is entered by user at checkout
    const savedShipping = sessionStorage.getItem('shipping')
    if (savedShipping) {
      try {
        const parsedShipping = JSON.parse(savedShipping)
        setFormData({ 
          email: parsedShipping.email || '',
          name: parsedShipping.name || '',
          address: FIXED_SHIPPING_ADDRESS.address,
          address2: FIXED_SHIPPING_ADDRESS.address2,
          city: FIXED_SHIPPING_ADDRESS.city,
          state: FIXED_SHIPPING_ADDRESS.state,
          zip: FIXED_SHIPPING_ADDRESS.zip,
          country: FIXED_SHIPPING_ADDRESS.country
        })
      } catch (e) {
        setFormData({ 
          email: '',
          name: '',
          address: FIXED_SHIPPING_ADDRESS.address,
          address2: FIXED_SHIPPING_ADDRESS.address2,
          city: FIXED_SHIPPING_ADDRESS.city,
          state: FIXED_SHIPPING_ADDRESS.state,
          zip: FIXED_SHIPPING_ADDRESS.zip,
          country: FIXED_SHIPPING_ADDRESS.country
        })
      }
    } else {
      setFormData({ 
        email: '',
        name: '',
        address: FIXED_SHIPPING_ADDRESS.address,
        address2: FIXED_SHIPPING_ADDRESS.address2,
        city: FIXED_SHIPPING_ADDRESS.city,
        state: FIXED_SHIPPING_ADDRESS.state,
        zip: FIXED_SHIPPING_ADDRESS.zip,
        country: FIXED_SHIPPING_ADDRESS.country
      })
    }
  }, [router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate required fields - only name is required from user
    if (!formData.email || !formData.email.includes('@')) {
      setError(t('validEmail'))
      return
    }

    if (!formData.name) {
      setError('Please enter your full name for distribution purposes.')
      return
    }

    // Store email in sessionStorage for order tracking
    sessionStorage.setItem('orderEmail', formData.email.toLowerCase())

    // Save shipping information to sessionStorage
    sessionStorage.setItem('shipping', JSON.stringify(formData))
    
    // Navigate to review page
    router.push('/review')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  return (
    <>
      {/* Fixed position icons - rendered outside relative container */}
      <AdminExportButton />
      <HelpIcon />
      <CartIcon />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 py-12 px-4 relative">
        <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('shippingInfo')}</h1>
            <p className="text-gray-600 mb-4">{t('shippingInstructions')}</p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {t('emailAddress')} <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#663399] focus:border-transparent text-black bg-white"
                placeholder="your.email@example.com"
              />
              <p className="mt-1 text-xs text-gray-500">{t('emailRequiredAtCheckout')}</p>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                {t('fullName')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#663399] focus:border-transparent text-black bg-white"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                {t('streetAddress')}
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
              />
            </div>

            {/* City, zip, country on one line - each in own field, read-only */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('city')}
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                />
              </div>
              <div>
                <label htmlFor="zip" className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP Code
                </label>
                <input
                  type="text"
                  id="zip"
                  name="zip"
                  value={formData.zip}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                />
              </div>
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('country')}
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                />
              </div>
            </div>

          <div className="mt-8 flex justify-between">
            <button
              type="button"
              onClick={() => router.push('/product')}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              ← Back
            </button>
              <button
                type="submit"
                className="px-6 py-2 text-white rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#663399] focus:ring-offset-2 font-medium"
                style={{ backgroundColor: '#663399' }}
              >
                {t('continueReview')}
              </button>
            </div>
          </form>
        </div>
      </div>
      </div>
    </>
  )
}

