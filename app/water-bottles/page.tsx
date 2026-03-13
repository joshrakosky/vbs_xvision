'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Product } from '@/types'
import AdminExportButton from '@/components/AdminExportButton'
import HelpIcon from '@/components/HelpIcon'
import CartIcon from '@/components/CartIcon'
import { getProductImagePath } from '@/lib/imageUtils'
import { parseSizeOptions } from '@/lib/sizeUtils'
import { ROUTE_CATEGORIES, getNextRoute, getPrevRoute } from '@/lib/pageConfig'
import { loadCart, saveCart, CartItem } from '@/lib/useCart'

export default function WaterBottlesPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProductId, setSelectedProductId] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const categories = ROUTE_CATEGORIES['water-bottles']
  const selectedProduct = products.find((p) => p.id === selectedProductId)
  const parsedSizes = selectedProduct ? parseSizeOptions(selectedProduct.available_sizes) : []

  useEffect(() => {
    if (!sessionStorage.getItem('accessGranted')) {
      router.push('/')
      return
    }
    loadProducts()
    const existing = loadCart().find((i) => i.category === 'water_bottle')
    if (existing?.productId) {
      setSelectedProductId(existing.productId)
      setSelectedColor(existing.color || '')
      setSelectedSize(existing.size || '')
    }
  }, [router])

  const loadProducts = async () => {
    try {
      const { data, error: err } = await supabase
        .from('xvision_products')
        .select('*')
        .in('category', categories)
        .order('name')
      if (err) throw err
      setProducts(data || [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const cart = loadCart()

  const handleContinue = () => {
    if (!selectedProduct) {
      setError('Please select one water bottle')
      return
    }
    if (selectedProduct.requires_color && !selectedColor) {
      setError('Please select a color')
      return
    }
    if (selectedProduct.requires_size && !selectedSize) {
      setError('Please select a size')
      return
    }

    const updated = cart.filter((i) => i.category !== 'water_bottle')
    updated.push({
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      quantity: 1,
      color: selectedProduct.requires_color ? selectedColor : undefined,
      size: selectedProduct.requires_size ? selectedSize : undefined,
      category: 'water_bottle',
    })
    saveCart(updated)
    setError('')
    const next = getNextRoute('water-bottles')
    if (next) router.push(`/${next}`)
  }

  const handleBack = () => {
    const prev = getPrevRoute('water-bottles')
    if (prev) router.push(`/${prev}`)
    else router.push('/')
  }

  const getThumbnailUrl = () => {
    if (!selectedProduct) return null
    if (selectedColor) {
      const path = getProductImagePath(selectedProduct.customer_item_number, selectedColor)
      if (path) return path
    }
    return selectedProduct.thumbnail_url || null
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading products...</div>
      </div>
    )
  }

  return (
    <>
      <AdminExportButton />
      <HelpIcon />
      <CartIcon />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 py-12 px-4 relative">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Select Your Water Bottle</h1>
            <p className="text-gray-600 mb-6">Choose one water bottle (required)</p>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">{error}</div>
            )}

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Water Bottle</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    const id = e.target.value
                    setSelectedProductId(id)
                    setSelectedColor('')
                    setSelectedSize('')
                    const p = products.find((x) => x.id === id)
                    if (p?.requires_size && parsedSizes.length === 1) setSelectedSize(parsedSizes[0])
                    if (p?.requires_color && p.available_colors?.length) setSelectedColor(p.available_colors[0])
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#663399] text-black bg-white"
                >
                  <option value="">-- Choose a water bottle --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {selectedProduct?.requires_size && parsedSizes.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#663399] text-black bg-white"
                  >
                    <option value="">-- Select size --</option>
                    {parsedSizes.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              )}

              {getThumbnailUrl() && (
                <div className="mt-4 flex justify-center">
                  <img src={getThumbnailUrl()!} alt={selectedProduct?.name} className="max-h-80 w-auto rounded-lg object-contain" />
                </div>
              )}

              {selectedProduct?.requires_color && selectedProduct.available_colors && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                  <select
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#663399] text-black bg-white"
                  >
                    <option value="">-- Select color --</option>
                    {selectedProduct.available_colors.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="mt-8 flex justify-between">
              <button type="button" onClick={handleBack} className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                ← Back
              </button>
              <button
                type="button"
                onClick={handleContinue}
                className="px-6 py-2 text-white rounded-md hover:opacity-90 font-medium"
                style={{ backgroundColor: '#663399' }}
              >
                Continue →
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
