'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Product } from '@/types'
import AdminExportButton from '@/components/AdminExportButton'
import HelpIcon from '@/components/HelpIcon'
import CartIcon from '@/components/CartIcon'
import { ROUTE_CATEGORIES, getNextRoute, getPrevRoute } from '@/lib/pageConfig'
import { loadCart, saveCart, CartItem } from '@/lib/useCart'

export default function MiscPage() {
  const router = useRouter()
  const [journalProduct, setJournalProduct] = useState<Product | null>(null)
  const [badgeProduct, setBadgeProduct] = useState<Product | null>(null)
  const [wantJournal, setWantJournal] = useState(false)
  const [wantBadge, setWantBadge] = useState(false)
  const [badgeText, setBadgeText] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!sessionStorage.getItem('accessGranted')) {
      router.push('/')
      return
    }
    loadProducts()
  }, [router])

  const loadProducts = async () => {
    try {
      const categories = ROUTE_CATEGORIES.misc
      const { data, error: err } = await supabase
        .from('xvision_products')
        .select('*')
        .in('category', categories)
        .order('name')
      if (err) throw err
      const prods = data || []
      const journal = prods.find((p) => p.category === 'journal')
      const badge = prods.find((p) => p.category === 'name_badge')
      setJournalProduct(journal || null)
      setBadgeProduct(badge || null)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const cart = loadCart()
  const journalInCart = cart.some((i) => i.category === 'journal')
  const badgeInCart = cart.some((i) => i.category === 'name_badge')

  const handleContinue = () => {
    if (wantBadge && !badgeText.trim()) {
      setError('Please enter how you want your name displayed on the name badge')
      return
    }

    let updated = cart.filter((i) => i.category !== 'journal' && i.category !== 'name_badge')
    if (wantJournal && journalProduct) {
      updated.push({
        productId: journalProduct.id,
        productName: journalProduct.name,
        quantity: 1,
        category: 'journal',
      })
    }
    if (wantBadge && badgeProduct && badgeText.trim()) {
      updated.push({
        productId: badgeProduct.id,
        productName: badgeProduct.name,
        quantity: 1,
        category: 'name_badge',
        customText: badgeText.trim(),
      })
    }
    saveCart(updated)
    setError('')
    const next = getNextRoute('misc')
    if (next) router.push(`/${next}`)
  }

  const handleBack = () => {
    const prev = getPrevRoute('misc')
    if (prev) router.push(`/${prev}`)
    else router.push('/')
  }

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
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Journal & Name Badge</h1>
            <p className="text-gray-600 mb-6">Optional add-ons</p>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">{error}</div>
            )}

            <div className="space-y-6 mb-8">
              {journalProduct && (
                <div className="p-4 border border-gray-200 rounded-lg">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={wantJournal}
                      onChange={(e) => setWantJournal(e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-[#663399] focus:ring-[#663399]"
                    />
                    <span className="font-medium text-gray-900">Journal</span>
                  </label>
                </div>
              )}

              {badgeProduct && (
                <div className="p-4 border border-gray-200 rounded-lg">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={wantBadge}
                      onChange={(e) => setWantBadge(e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-[#663399] focus:ring-[#663399]"
                    />
                    <span className="font-medium text-gray-900">Name Badge</span>
                  </label>
                  {wantBadge && (
                    <div className="mt-4 ml-8">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name to display on badge</label>
                      <input
                        type="text"
                        value={badgeText}
                        onChange={(e) => setBadgeText(e.target.value)}
                        placeholder="e.g. John Smith"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#663399] text-black bg-white"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <button type="button" onClick={handleBack} className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                ← Back
              </button>
              <button
                type="button"
                onClick={handleContinue}
                className="px-6 py-2 text-white rounded-md hover:opacity-90 font-medium"
                style={{ backgroundColor: '#663399' }}
              >
                Continue to Shipping →
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
