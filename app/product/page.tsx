'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Product } from '@/types'
import VBSLogo from '@/components/VBSLogo'
import AdminExportButton from '@/components/AdminExportButton'
import HelpIcon from '@/components/HelpIcon'
import CartIcon from '@/components/CartIcon'
import { getProductImagePath } from '@/lib/imageUtils'
import { parseSizeOptions, getSizeDisplayLabel } from '@/lib/sizeUtils'
import { getStockRules, isOutOfStock, isLowStock, getAvailableSizes, isColorFullyOOS } from '@/lib/stockConfig'
import { useLanguage } from '@/lib/languageContext'

const MAX_BUDGET = 100

interface CartItem {
  productId: string
  productName: string
  price: number
  quantity?: number
  color?: string
  size?: string
  logo_color?: string
}

export default function ProductPage() {
  const router = useRouter()
  const { t, language } = useLanguage()
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProductId, setSelectedProductId] = useState<string>('')
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [selectedLogoColor, setSelectedLogoColor] = useState<string>('')
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1)
  const [loading, setLoading] = useState(true)
  const [sizingChartOpen, setSizingChartOpen] = useState(false)
  const [error, setError] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const cartRef = useRef<CartItem[]>([])
  const isInitialLoad = useRef(true)
  const [showAbandonConfirm, setShowAbandonConfirm] = useState(false)
  const [showBudgetReminder, setShowBudgetReminder] = useState(false)

  const selectedProduct = products.find(p => p.id === selectedProductId)
  const stockRules = getStockRules(
    selectedProduct?.vendor_item_num as string | undefined,
    selectedProduct?.customer_item_number
  )
  const parsedSizes = selectedProduct ? parseSizeOptions(selectedProduct.available_sizes) : []
  const availableSizesForColor = getAvailableSizes(stockRules, selectedColor, parsedSizes)

  // Calculate totals (price * quantity per item)
  const currentTotal = cart.reduce((sum, item) => sum + (item.price * (item.quantity ?? 1)), 0)
  const remainingBudget = MAX_BUDGET - currentTotal
  const canAddMore = remainingBudget > 0

  // Cheapest product price - only show "add more" reminder if user can actually afford something
  const minProductPrice = products.length > 0
    ? Math.min(...products.map(p => p.price ?? Infinity))
    : Infinity
  const canAffordAnything = remainingBudget >= minProductPrice

  // Load cart from sessionStorage on mount
  useEffect(() => {
    const savedCart = sessionStorage.getItem('cart')
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        if (Array.isArray(parsedCart) && parsedCart.length > 0) {
          // Normalize: ensure each item has quantity (backward compat)
          const normalized = parsedCart.map((item: CartItem) => ({ ...item, quantity: item.quantity ?? 1 }))
          setCart(normalized)
          cartRef.current = normalized
        } else {
          // Empty cart array - still valid, just empty
          setCart([])
          cartRef.current = []
        }
      } catch (e) {
        // Invalid cart data, start fresh but don't clear sessionStorage
        // (might be a temporary parsing issue)
        console.error('Error parsing cart:', e)
        setCart([])
        cartRef.current = []
      }
    }
    // Mark initial load as complete after a brief delay to ensure state is set
    // This prevents the save effect from running with stale/empty cart
    const timer = setTimeout(() => {
      isInitialLoad.current = false
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  // Keep cartRef in sync with cart state
  useEffect(() => {
    cartRef.current = cart
  }, [cart])

  // Clear selectedSize when it becomes OOS for the selected color (e.g. after color change)
  useEffect(() => {
    if (selectedProduct?.requires_size && selectedSize && stockRules) {
      if (isOutOfStock(stockRules, selectedColor, selectedSize)) {
        const available = getAvailableSizes(stockRules, selectedColor, parsedSizes)
        setSelectedSize(available[0] || '')
      }
    }
  }, [selectedColor, selectedProduct, stockRules])

  // Save cart to sessionStorage whenever it changes (from product page adding items)
  useEffect(() => {
    // Skip saving on initial load
    if (isInitialLoad.current) return
    
    const cartJson = JSON.stringify(cart)
    const savedCart = sessionStorage.getItem('cart')
    
    // Only save if different to prevent unnecessary updates
    if (savedCart !== cartJson) {
      sessionStorage.setItem('cart', cartJson)
      // Dispatch event for CartIcon to sync
      window.dispatchEvent(new Event('cartUpdated'))
    }
  }, [cart])

  // Listen for cart updates from CartIcon (when items are removed)
  useEffect(() => {
    const handleCartUpdate = () => {
      const savedCart = sessionStorage.getItem('cart')
      if (!savedCart) {
        if (cartRef.current.length > 0) {
          setCart([])
        }
        return
      }
      
      try {
        const parsedCart = JSON.parse(savedCart)
        const currentCartJson = JSON.stringify(cartRef.current)
        
        // Only update if cart actually changed (prevent loops)
        if (savedCart !== currentCartJson) {
          setCart(parsedCart)
        }
      } catch (e) {
        // Invalid cart data - ignore
        console.error('Invalid cart data:', e)
      }
    }

    window.addEventListener('cartUpdated', handleCartUpdate)
    return () => window.removeEventListener('cartUpdated', handleCartUpdate)
  }, []) // Empty deps - use ref to access current cart value

  // Get the appropriate thumbnail based on selected color + logo color
  // Format: sku_color_logoColor.jpg - each logo color combo has its own image
  const getThumbnailUrl = () => {
    if (!selectedProduct) return null
    
    const logoColors = selectedProduct.logo_colors_available
      ?.split(',')
      .map(s => s.trim())
      .filter(Boolean) ?? []
    // Default to White logo for thumbnails when none selected (user prefers white logo images)
    const defaultLogoColor = logoColors.find(c => c.toLowerCase() === 'white') || logoColors[0]
    const effectiveLogoColor = selectedLogoColor || (logoColors.length > 0 ? defaultLogoColor : undefined)
    
    if (selectedColor) {
      if (selectedProduct.color_thumbnails && selectedProduct.color_thumbnails[selectedColor]) {
        return selectedProduct.color_thumbnails[selectedColor]
      }
      
      const generatedPath = getProductImagePath(
        selectedProduct.customer_item_number,
        selectedColor,
        effectiveLogoColor
      )
      if (generatedPath) return generatedPath
    }
    
    if (selectedProduct.thumbnail_url_black) return selectedProduct.thumbnail_url_black
    if (selectedProduct.thumbnail_url_white) return selectedProduct.thumbnail_url_white
    
    if (selectedProduct.available_colors && selectedProduct.available_colors.length > 0) {
      const firstColor = selectedProduct.available_colors[0]
      const generatedPath = getProductImagePath(
        selectedProduct.customer_item_number,
        firstColor,
        effectiveLogoColor
      )
      if (generatedPath) return generatedPath
    }
    
    return selectedProduct.thumbnail_url || null
  }

  useEffect(() => {
    const accessGranted = sessionStorage.getItem('accessGranted')
    if (!accessGranted) {
      router.push('/')
      return
    }

    loadProducts()
  }, [router])

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('cestes_products')
        .select('*, thumbnail_url_black, thumbnail_url_white, color_thumbnails, customer_item_number, vendor_item_num, price')
        .order('name')

      if (error) throw error
      setProducts(data || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (!selectedProductId || !selectedProduct) {
      setError(t('pleaseSelectProduct'))
      return
    }

    const productPrice = selectedProduct.price || 0
    const qty = Math.max(1, Math.min(selectedQuantity || 1, Math.floor(remainingBudget / productPrice) || 1))

    // Check budget
    if (currentTotal + productPrice * qty > MAX_BUDGET) {
      setError(t('budgetExceeded'))
      return
    }

    // Product validation
      if (selectedProduct.requires_color && !selectedColor) {
        setError(t('pleaseSelectColor'))
        return
      }

      if (selectedProduct.requires_size && !selectedSize) {
        setError(t('pleaseSelectSize'))
        return
      }

      // Stock validation - block OOS items
      if (selectedProduct.requires_size && isOutOfStock(stockRules, selectedColor, selectedSize)) {
        setError(t('oosError'))
        return
      }

      // Logo color validation - required when product has logo options
      const productWithLogo = selectedProduct as { logo_colors_available?: string }
      const logoColors = productWithLogo.logo_colors_available
        ?.split(',')
        .map(s => s.trim())
        .filter(Boolean) ?? []
      if (logoColors.length > 0 && !selectedLogoColor) {
        setError(t('pleaseSelectLogoColor'))
        return
      }

      const existingIdx = cart.findIndex(item => 
        item.productId === selectedProductId &&
        item.color === (selectedColor || undefined) && item.size === (selectedSize || undefined) &&
        item.logo_color === (selectedLogoColor || undefined)
      )
      const newItem: CartItem = {
        productId: selectedProductId,
        productName: selectedProduct.name,
        price: productPrice,
        quantity: qty,
        color: selectedColor || undefined,
        size: selectedSize || undefined,
        logo_color: selectedLogoColor || undefined
      }
      
      if (existingIdx >= 0) {
        const updated = [...cart]
        updated[existingIdx] = { ...updated[existingIdx], quantity: (updated[existingIdx].quantity ?? 1) + qty }
        setCart(updated)
      } else {
        setCart([...cart, newItem])
      }
      
      // Reset form
      setSelectedProductId('')
      setSelectedColor('')
      setSelectedSize('')
      setSelectedLogoColor('')
      setSelectedQuantity(1)
    
    setError('')
  }

  const proceedToShipping = () => {
    sessionStorage.setItem('product', JSON.stringify(cart))
    router.push('/shipping')
  }

  const handleContinue = () => {
    if (cart.length === 0) {
      setError(t('pleaseAddProduct'))
      return
    }

    // If budget isn't maxed and user can afford at least one product, show reminder
    if (remainingBudget > 0 && canAffordAnything) {
      setShowBudgetReminder(true)
      return
    }

    proceedToShipping()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">{t('loadingProducts')}</div>
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
        <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('selectProduct')}</h1>
            <p className="text-gray-600 mb-4">{t('chooseProduct')}</p>
            
            {/* Budget Info */}
            <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-md">
              <p className="text-sm font-medium" style={{ color: '#663399' }}>
                {t('budgetInfo')}
              </p>
              <div className="mt-2 flex gap-4 text-sm">
                <span className="font-medium">
                  {t('currentTotal')}: <span style={{ color: '#663399' }}>${currentTotal.toFixed(2)}</span>
                </span>
                <span className="font-medium">
                  {t('remainingBudget')}: <span style={{ color: remainingBudget > 0 ? '#663399' : '#dc2626' }}>
                    ${remainingBudget.toFixed(2)}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
              {error}
            </div>
          )}


          {/* Product Selection - dropdown shortened with sizing chart button to the right */}
          <div className="mb-6">
            <label htmlFor="product-select" className="block text-sm font-medium text-gray-700 mb-2">
              {t('selectProductLabel')}
            </label>
            <div className="flex gap-2 items-stretch">
              <select
                id="product-select"
                value={selectedProductId}
                onChange={(e) => {
                const productId = e.target.value
                setSelectedProductId(productId)
                setSelectedSize('')
                setSelectedColor('')
                setSelectedLogoColor('')
                setError('')
                setSelectedQuantity(1)
                
                const product = products.find(p => p.id === productId)
                if (product) {
                  const rules = getStockRules(product.vendor_item_num as string | undefined, product.customer_item_number)
                  const sizes = parseSizeOptions(product?.available_sizes)
                  if (product?.requires_color && product.available_colors && product.available_colors.length > 0) {
                    // Pick first color that has available sizes (not fully OOS)
                    const firstAvailableColor = product.available_colors.find(
                      (c) => !isColorFullyOOS(rules, c, sizes)
                    ) ?? product.available_colors[0]
                    setSelectedColor(firstAvailableColor)
                  } else if (product?.requires_color && product.available_colors?.includes('Black')) {
                    setSelectedColor('Black')
                  }
                  if (product?.requires_size && sizes.length === 1) {
                    setSelectedSize(sizes[0])
                  } else if (product?.requires_size && sizes.length > 0) {
                    const firstColor = product.available_colors?.[0]
                    const avail = getAvailableSizes(rules, firstColor, sizes)
                    setSelectedSize(avail[0] || '')
                  }
                  const productWithLogo = product as { logo_colors_available?: string } | undefined
                  const logoColors = productWithLogo?.logo_colors_available
                    ?.split(',')
                    .map(s => s.trim())
                    .filter(Boolean) ?? []
                  if (logoColors.length === 1) {
                    setSelectedLogoColor(logoColors[0])
                  }
                }
              }}
                className="flex-1 min-w-0 max-w-md px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#663399] focus:border-transparent text-black bg-white"
                disabled={!canAddMore}
              >
                <option value="">{t('chooseProductPlaceholder')}</option>
                {products.map(product => {
                  const productPrice = product.price || 0
                  const wouldExceedBudget = currentTotal + productPrice > MAX_BUDGET
                  return (
                    <option 
                      key={product.id} 
                      value={product.id}
                      disabled={wouldExceedBudget}
                      style={wouldExceedBudget ? { 
                        color: '#9ca3af', 
                        backgroundColor: '#f3f4f6',
                        fontStyle: 'italic'
                      } : {}}
                    >
                      {product.name} - ${productPrice.toFixed(2)}
                      {wouldExceedBudget && ` ${t('exceedsBudget')}`}
                    </option>
                  )
                })}
              </select>
              <button
                type="button"
                onClick={() => setSizingChartOpen(true)}
                className="shrink-0 px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:ring-2 focus:ring-[#663399] focus:ring-offset-1 text-gray-700 text-sm font-medium whitespace-nowrap"
                aria-label={t('sizingChart')}
              >
                {t('sizingChart')}
              </button>
            </div>
            {!canAddMore && (
              <p className="mt-1 text-xs text-red-600">{t('budgetLimitReached')}</p>
            )}
          </div>

          {/* Sizing chart modal - PDF shown based on language (en vs fr) */}
          {sizingChartOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSizingChartOpen(false)}>
              <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center px-4 py-3 border-b">
                  <h3 className="text-lg font-semibold text-gray-900">{t('sizingChartTitle')}</h3>
                  <button
                    type="button"
                    onClick={() => setSizingChartOpen(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                    aria-label={t('cancel')}
                  >
                    ×
                  </button>
                </div>
                <iframe
                  src={`/images/Sizechart_${language === 'fr' ? 'French' : 'English'}.pdf`}
                  title={t('sizingChartTitle')}
                  className="w-full flex-1 min-h-[70vh]"
                />
              </div>
            </div>
          )}

          {selectedProduct && (
            <div className="border-t pt-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  {getThumbnailUrl() ? (
                    <img
                      src={getThumbnailUrl() || ''}
                      alt={selectedProduct.name}
                      className="w-full rounded-lg shadow-md"
                    />
                  ) : (
                    <div className="w-full aspect-square bg-gray-100 rounded-lg shadow-md flex items-center justify-center border-2 border-gray-300">
                      <div className="text-center p-4">
                        <div className="text-4xl mb-2">📦</div>
                        <div className="text-sm text-gray-500 font-medium">{selectedProduct.name}</div>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    {selectedProduct.name}
                  </h2>
                  <p className="text-lg font-bold mb-3" style={{ color: '#663399' }}>
                    ${(selectedProduct.price || 0).toFixed(2)}
                  </p>
                  {selectedProduct.description && (
                    <p className="text-gray-600 mb-3">{selectedProduct.description}</p>
                  )}
                  {selectedProduct.specs && (
                    <div className="mb-4">
                      <h3 className="font-medium text-gray-900 mb-2">Specifications:</h3>
                      <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                        {selectedProduct.specs.split('\n').filter(line => line.trim().startsWith('•')).map((line, idx) => (
                          <li key={idx} className="ml-2">{line.replace('•', '').trim()}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Product color selection */}
              {selectedProduct.requires_color && selectedProduct.available_colors && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('color')}
                  </label>
                  <select
                    value={selectedColor}
                    onChange={(e) => {
                      const newColor = e.target.value
                      setSelectedColor(newColor)
                      setError('')
                      // When color changes, set size to first available (current may be OOS for new color)
                      const avail = getAvailableSizes(stockRules, newColor, parsedSizes)
                      setSelectedSize(avail[0] || '')
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#663399] focus:border-transparent text-black bg-white"
                  >
                    <option value="">{t('selectColor')}</option>
                    {selectedProduct.available_colors.map((color) => {
                      const fullyOOS = isColorFullyOOS(stockRules, color, parsedSizes)
                      return (
                        <option key={color} value={color} disabled={fullyOOS}>
                          {color}{fullyOOS ? t('outOfStock') : ''}
                        </option>
                      )
                    })}
                  </select>
                </div>
              )}

              {/* Logo color dropdown - shown when product has logo_colors_available */}
              {(() => {
                const productWithLogo = selectedProduct as { logo_colors_available?: string }
                const logoColors = productWithLogo.logo_colors_available
                  ?.split(',')
                  .map(s => s.trim())
                  .filter(Boolean) ?? []
                if (logoColors.length === 0) return null
                return (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('logoColor')}
                    </label>
                    <select
                      value={selectedLogoColor}
                      onChange={(e) => {
                        setSelectedLogoColor(e.target.value)
                        setError('')
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#663399] focus:border-transparent text-black bg-white"
                    >
                      <option value="">{t('selectLogoColor')}</option>
                      {logoColors.map(color => (
                        <option key={color} value={color}>{color}</option>
                      ))}
                    </select>
                  </div>
                )
              })()}

              {selectedProduct.requires_size && parsedSizes.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('size')}
                  </label>
                  <select
                    value={selectedSize}
                    onChange={(e) => {
                      setSelectedSize(e.target.value)
                      setError('')
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#663399] focus:border-transparent text-black bg-white"
                  >
                    <option value="">{t('selectSize')}</option>
                    {availableSizesForColor.map((size) => {
                      const low = isLowStock(stockRules, selectedColor, size)
                      return (
                        <option key={size} value={size}>
                          {getSizeDisplayLabel(size, language)}{low ? t('lowStockNotation') : ''}
                        </option>
                      )
                    })}
                  </select>
                </div>
              )}

              {/* Quantity input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('quantity')}
                </label>
                <input
                  type="number"
                  min={1}
                  max={selectedProduct ? Math.max(1, Math.floor(remainingBudget / (selectedProduct.price || 1))) : 99}
                  value={selectedQuantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10)
                    if (!isNaN(val) && val >= 1) {
                      const max = selectedProduct ? Math.floor(remainingBudget / (selectedProduct.price || 1)) : 99
                      setSelectedQuantity(Math.min(val, Math.max(1, max)))
                    }
                  }}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#663399] focus:border-transparent text-black bg-white"
                />
                {selectedProduct && remainingBudget > 0 && (
                  <p className="mt-1 text-xs text-gray-500">
                    {t('maxToStayWithinBudget').replace('{max}', String(Math.floor(remainingBudget / (selectedProduct.price || 1))))}
                  </p>
                )}
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={!canAddMore || ((selectedProduct?.price || 0) * (selectedQuantity || 1) + currentTotal > MAX_BUDGET)}
                className="w-full px-6 py-2 text-white rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#663399] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                style={{ backgroundColor: '#663399' }}
              >
                {t('addToCart')}
              </button>
            </div>
          )}

          <div className="mt-8 flex justify-between">
            <button
              onClick={() => {
                // Check if cart has items - if so, show confirmation
                const savedCart = sessionStorage.getItem('cart')
                if (savedCart) {
                  try {
                    const parsedCart = JSON.parse(savedCart)
                    if (parsedCart && parsedCart.length > 0) {
                      setShowAbandonConfirm(true)
                      return
                    }
                  } catch (e) {
                    // Invalid cart, proceed without confirmation
                  }
                }
                // No cart items, go back directly
                router.push('/')
              }}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              {t('back')}
            </button>
            <button
              onClick={handleContinue}
              disabled={cart.length === 0}
              className="px-6 py-2 text-white rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#663399] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              style={{ backgroundColor: '#663399' }}
            >
              {t('continueShipping')}
            </button>
          </div>
        </div>
      </div>
      </div>

      {/* Budget Reminder Modal - encourage maxing out the $100 budget */}
      {showBudgetReminder && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          onClick={() => setShowBudgetReminder(false)}
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
          <div 
            className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {t('budgetReminderTitle')}
            </h2>
            <p className="text-gray-600 mb-6">
              {t('budgetReminderMessage')} <strong style={{ color: '#663399' }}>${remainingBudget.toFixed(2)}</strong> {t('budgetReminderMessageEnd')}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowBudgetReminder(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
              >
                {t('addMoreProducts')}
              </button>
              <button
                onClick={() => {
                  setShowBudgetReminder(false)
                  proceedToShipping()
                }}
                className="px-4 py-2 text-white rounded-md hover:opacity-90 font-medium"
                style={{ backgroundColor: '#663399' }}
              >
                {t('continueAnyway')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Abandon Cart Confirmation Modal */}
      {showAbandonConfirm && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAbandonConfirm(false)}
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
          <div 
            className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {t('abandonCartTitle')}
            </h2>
            <p className="text-gray-600 mb-6">
              {t('abandonCartMessage')}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowAbandonConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
              >
                {t('cancel')}
              </button>
              <button
                onClick={() => {
                  // Clear cart and navigate to landing page
                  sessionStorage.removeItem('cart')
                  sessionStorage.removeItem('product')
                  sessionStorage.removeItem('shipping')
                  window.dispatchEvent(new Event('cartUpdated'))
                  router.push('/')
                }}
                className="px-4 py-2 text-white rounded-md hover:opacity-90 font-medium"
                style={{ backgroundColor: '#dc2626' }}
              >
                {t('abandonCart')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
