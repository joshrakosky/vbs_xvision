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

const WEARABLE_CATEGORIES = [
  'full_zip_mens',
  'full_zip_womens',
  'vest_mens',
  'vest_womens',
  'polo_mens',
  'polo_womens',
  'sweatshirt_mens',
  'sweatshirt_womens',
  'half_zip_mens',
  'half_zip_womens',
]
const SCRUB_TOP_CATEGORY = 'scrub_top'
const SCRUB_BOTTOM_CATEGORY = 'scrub_bottom'

type SlotType = 'wearable' | 'scrub'

interface SlotSelection {
  type: SlotType
  productId?: string
  color?: string
  size?: string
  scrubTopId?: string
  scrubTopSize?: string
  scrubTopColor?: string
  scrubBottomId?: string
  scrubBottomSize?: string
  scrubBottomColor?: string
}

export default function Wearables1Page() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [slot, setSlot] = useState<SlotSelection>({ type: 'wearable' })

  const categories = ROUTE_CATEGORIES['wearables-1']
  const regularWearables = products.filter((p) => WEARABLE_CATEGORIES.includes(p.category))
  const scrubTops = products.filter((p) => p.category === SCRUB_TOP_CATEGORY)
  const scrubBottoms = products.filter((p) => p.category === SCRUB_BOTTOM_CATEGORY)

  useEffect(() => {
    if (!sessionStorage.getItem('accessGranted')) {
      router.push('/')
      return
    }
    loadProducts()
    const cart = loadCart()
    const wearableItems = cart.filter(
      (i) => i.scrubTopId || (i.productId && WEARABLE_CATEGORIES.includes(i.category || ''))
    )
    if (wearableItems[0]) {
      const a = wearableItems[0]
      if (a.scrubTopId) {
        setSlot({
          type: 'scrub',
          scrubTopId: a.scrubTopId,
          scrubTopSize: a.scrubTopSize,
          scrubTopColor: a.scrubTopColor || 'Black',
          scrubBottomId: a.scrubBottomId,
          scrubBottomSize: a.scrubBottomSize,
          scrubBottomColor: a.scrubBottomColor || 'Black',
        })
      } else {
        setSlot({
          type: 'wearable',
          productId: a.productId,
          color: a.color,
          size: a.size,
        })
      }
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

  const slotToCartItem = (slot: SlotSelection): CartItem | null => {
    if (slot.type === 'scrub' && slot.scrubTopId && slot.scrubBottomId && slot.scrubTopSize && slot.scrubBottomSize) {
      const topProduct = products.find((p) => p.id === slot.scrubTopId)
      const bottomProduct = products.find((p) => p.id === slot.scrubBottomId)
      return {
        scrubTopId: slot.scrubTopId,
        scrubTopName: topProduct?.name || '',
        scrubTopSize: slot.scrubTopSize,
        scrubTopColor: slot.scrubTopColor || 'Black',
        scrubBottomId: slot.scrubBottomId,
        scrubBottomName: bottomProduct?.name || '',
        scrubBottomSize: slot.scrubBottomSize,
        scrubBottomColor: slot.scrubBottomColor || 'Black',
        category: 'scrub_set',
      }
    }
    if (slot.type === 'wearable' && slot.productId) {
      const p = products.find((x) => x.id === slot.productId)
      if (!p) return null
      if (p.requires_color && !slot.color) return null
      if (p.requires_size && !slot.size) return null
      return {
        productId: slot.productId,
        productName: p.name,
        quantity: 1,
        color: slot.color,
        size: slot.size,
        category: p.category,
      }
    }
    return null
  }

  const handleContinue = () => {
    if (slot.type === 'wearable' && slot.productId) {
      const p = products.find((x) => x.id === slot.productId)
      if (p?.requires_color && !slot.color) {
        setError('Please select a color')
        return
      }
      if (p?.requires_size && !slot.size) {
        setError('Please select a size')
        return
      }
    }
    if (slot.type === 'scrub') {
      if (!slot.scrubTopId || !slot.scrubBottomId || !slot.scrubTopSize || !slot.scrubBottomSize) {
        setError('Please select both a scrub top and bottom with sizes')
        return
      }
    }

    const item = slotToCartItem(slot)
    if (!item) {
      setError('Please make a selection')
      return
    }

    const updated = loadCart().filter(
      (i) => !i.scrubTopId && !(i.productId && WEARABLE_CATEGORIES.includes(i.category || ''))
    )
    updated.push(item)
    saveCart(updated)
    setError('')
    const next = getNextRoute('wearables-1')
    if (next) router.push(`/${next}`)
  }

  const handleBack = () => {
    const prev = getPrevRoute('wearables-1')
    if (prev) router.push(`/${prev}`)
    else router.push('/')
  }

  const getThumbnailUrl = (product: Product, color?: string) => {
    const c = color || product.available_colors?.[0]
    if (c) {
      const path = getProductImagePath(product.customer_item_number, c)
      if (path) return path
    }
    return product.thumbnail_url || null
  }

  const selectedProduct = products.find((p) => p.id === slot.productId)
  const parsedSizes = selectedProduct ? parseSizeOptions(selectedProduct.available_sizes) : []
  const scrubTopProduct = products.find((p) => p.id === slot.scrubTopId)
  const scrubBottomProduct = products.find((p) => p.id === slot.scrubBottomId)
  const scrubTopSizes = scrubTopProduct ? parseSizeOptions(scrubTopProduct.available_sizes) : []
  const scrubBottomSizes = scrubBottomProduct ? parseSizeOptions(scrubBottomProduct.available_sizes) : []

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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Select Your First Wearable</h1>
            <p className="text-gray-600 mb-6">Choose one wearable (required). Scrubs (top + bottom) count as one.</p>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">{error}</div>
            )}

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={slot.type === 'wearable'}
                      onChange={() => setSlot({ type: 'wearable' })}
                      className="text-[#663399]"
                    />
                    <span>Regular wearable</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={slot.type === 'scrub'}
                      onChange={() => setSlot({ type: 'scrub' })}
                      className="text-[#663399]"
                    />
                    <span>Scrub set (top + bottom)</span>
                  </label>
                </div>
              </div>

              {slot.type === 'wearable' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Wearable</label>
                    <select
                      value={slot.productId || ''}
                      onChange={(e) => {
                        const id = e.target.value
                        const p = products.find((x) => x.id === id)
                        setSlot({
                          ...slot,
                          productId: id,
                          color: p?.available_colors?.[0],
                          size: p ? parseSizeOptions(p.available_sizes || [])[0] : undefined,
                        })
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#663399] text-black bg-white"
                    >
                      <option value="">-- Choose a wearable --</option>
                      {regularWearables.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  {/* Product image between wearable dropdown and size/color */}
                  {selectedProduct && getThumbnailUrl(selectedProduct, slot.color) && (
                    <div>
                      <img src={getThumbnailUrl(selectedProduct, slot.color)!} alt="" className="max-h-48 rounded-lg object-contain" />
                    </div>
                  )}
                  {selectedProduct?.requires_size && parsedSizes.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                      <select
                        value={slot.size || ''}
                        onChange={(e) => setSlot({ ...slot, size: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#663399] text-black bg-white"
                      >
                        <option value="">-- Select size --</option>
                        {parsedSizes.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  {selectedProduct?.requires_color && selectedProduct.available_colors && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                      <select
                        value={slot.color || ''}
                        onChange={(e) => setSlot({ ...slot, color: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#663399] text-black bg-white"
                      >
                        <option value="">-- Select color --</option>
                        {selectedProduct.available_colors.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}

              {slot.type === 'scrub' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Scrub Top (left column): dropdown, image, size, color */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Scrub Top</label>
                      <select
                        value={slot.scrubTopId || ''}
                        onChange={(e) => setSlot({ ...slot, scrubTopId: e.target.value, scrubTopSize: '', scrubTopColor: 'Black' })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#663399] text-black bg-white"
                      >
                        <option value="">-- Select scrub top --</option>
                        {scrubTops.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    {slot.scrubTopId && scrubTopProduct && getThumbnailUrl(scrubTopProduct, slot.scrubTopColor || 'Black') && (
                      <div>
                        <img src={getThumbnailUrl(scrubTopProduct, slot.scrubTopColor || 'Black')!} alt="" className="max-h-40 rounded-lg object-contain" />
                      </div>
                    )}
                    {slot.scrubTopId && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Scrub Top Size</label>
                        <select
                          value={slot.scrubTopSize || ''}
                          onChange={(e) => setSlot({ ...slot, scrubTopSize: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#663399] text-black bg-white"
                        >
                          <option value="">-- Select size --</option>
                          {scrubTopSizes.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    {slot.scrubTopId && scrubTopProduct?.available_colors && scrubTopProduct.available_colors.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Scrub Top Color</label>
                        <select
                          value={slot.scrubTopColor || 'Black'}
                          onChange={(e) => setSlot({ ...slot, scrubTopColor: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#663399] text-black bg-white"
                        >
                          {scrubTopProduct.available_colors.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                  {/* Scrub Bottom (right column): dropdown, image, size, color */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Scrub Bottom</label>
                      <select
                        value={slot.scrubBottomId || ''}
                        onChange={(e) => setSlot({ ...slot, scrubBottomId: e.target.value, scrubBottomSize: '', scrubBottomColor: 'Black' })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#663399] text-black bg-white"
                      >
                        <option value="">-- Select scrub bottom --</option>
                        {scrubBottoms.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    {slot.scrubBottomId && scrubBottomProduct && getThumbnailUrl(scrubBottomProduct, slot.scrubBottomColor || 'Black') && (
                      <div>
                        <img src={getThumbnailUrl(scrubBottomProduct, slot.scrubBottomColor || 'Black')!} alt="" className="max-h-40 rounded-lg object-contain" />
                      </div>
                    )}
                    {slot.scrubBottomId && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Scrub Bottom Size</label>
                        <select
                          value={slot.scrubBottomSize || ''}
                          onChange={(e) => setSlot({ ...slot, scrubBottomSize: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#663399] text-black bg-white"
                        >
                          <option value="">-- Select size --</option>
                          {scrubBottomSizes.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    {slot.scrubBottomId && scrubBottomProduct?.available_colors && scrubBottomProduct.available_colors.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Scrub Bottom Color</label>
                        <select
                          value={slot.scrubBottomColor || 'Black'}
                          onChange={(e) => setSlot({ ...slot, scrubBottomColor: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#663399] text-black bg-white"
                        >
                          {scrubBottomProduct.available_colors.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
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
                Continue to Second Wearable →
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
