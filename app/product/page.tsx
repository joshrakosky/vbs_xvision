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
import { useLanguage } from '@/lib/languageContext'

const MAX_BUDGET = 200

interface CartItem {
  productId: string
  productName: string
  price: number
  color?: string
  size?: string
  isYetiKit?: boolean
  yeti8ozColor?: string
  yeti26ozColor?: string
  yeti35ozColor?: string
}

export default function ProductPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProductId, setSelectedProductId] = useState<string>('')
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const cartRef = useRef<CartItem[]>([])
  const isInitialLoad = useRef(true)
  const [showAbandonConfirm, setShowAbandonConfirm] = useState(false)
  
  // YETI Kit specific state
  const [activeYetiSize, setActiveYetiSize] = useState<string>('8oz')
  const [yeti8ozColor, setYeti8ozColor] = useState<string>('')
  const [yeti26ozColor, setYeti26ozColor] = useState<string>('')
  const [yeti35ozColor, setYeti35ozColor] = useState<string>('')

  const selectedProduct = products.find(p => p.id === selectedProductId)
  const isYetiKit = selectedProduct?.name === 'YETI Kit'
  
  // Calculate totals
  const currentTotal = cart.reduce((sum, item) => sum + item.price, 0)
  const remainingBudget = MAX_BUDGET - currentTotal
  const canAddMore = remainingBudget > 0

  // Load cart from sessionStorage on mount
  useEffect(() => {
    const savedCart = sessionStorage.getItem('cart')
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        if (Array.isArray(parsedCart) && parsedCart.length > 0) {
          // Valid cart with items - load it
          setCart(parsedCart)
          cartRef.current = parsedCart
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

  // Get the appropriate thumbnail based on selected color
  const getThumbnailUrl = () => {
    if (!selectedProduct) return null
    
    const productWithColors = selectedProduct as any
    
    if (isYetiKit) {
      const activeColor = activeYetiSize === '8oz' ? yeti8ozColor : 
                         activeYetiSize === '26oz' ? yeti26ozColor : 
                         yeti35ozColor
      
      if (activeColor) {
        const generatedPath = getProductImagePath(
          productWithColors.customer_item_number, 
          activeColor,
          activeYetiSize
        )
        if (generatedPath) return generatedPath
      }
      
      if (selectedProduct.available_colors && selectedProduct.available_colors.length > 0) {
        const firstColor = selectedProduct.available_colors[0]
        return getProductImagePath(
          productWithColors.customer_item_number,
          firstColor,
          '8oz'
        )
      }
      
      return null
    }
    
    if (selectedColor) {
      if (productWithColors.color_thumbnails && productWithColors.color_thumbnails[selectedColor]) {
        return productWithColors.color_thumbnails[selectedColor]
      }
      
      const generatedPath = getProductImagePath(productWithColors.customer_item_number, selectedColor)
      if (generatedPath) return generatedPath
    }
    
    if (productWithColors.thumbnail_url_black) return productWithColors.thumbnail_url_black
    if (productWithColors.thumbnail_url_white) return productWithColors.thumbnail_url_white
    
    if (selectedProduct.available_colors && selectedProduct.available_colors.length > 0) {
      const firstColor = selectedProduct.available_colors[0]
      const generatedPath = getProductImagePath(productWithColors.customer_item_number, firstColor)
      if (generatedPath) return generatedPath
    }
    
    return selectedProduct.thumbnail_url || null
  }

  useEffect(() => {
    const userEmail = sessionStorage.getItem('userEmail')
    if (!userEmail) {
      router.push('/')
      return
    }

    loadProducts()
  }, [router])

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('cestes_products')
        .select('*, thumbnail_url_black, thumbnail_url_white, color_thumbnails, customer_item_number, price')
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

    // Check budget
    if (currentTotal + productPrice > MAX_BUDGET) {
      setError(t('budgetExceeded'))
      return
    }

    // Special validation for YETI Kit
    if (isYetiKit) {
      if (!yeti8ozColor || !yeti26ozColor || !yeti35ozColor) {
        setError('Please select a color for each size')
        return
      }
      
      const newItem: CartItem = {
        productId: selectedProductId,
        productName: selectedProduct.name,
        price: productPrice,
        isYetiKit: true,
        yeti8ozColor,
        yeti26ozColor,
        yeti35ozColor
      }
      
      setCart([...cart, newItem])
      
      // Reset form
      setSelectedProductId('')
      setYeti8ozColor('')
      setYeti26ozColor('')
      setYeti35ozColor('')
      setActiveYetiSize('8oz')
    } else {
      // Regular product validation
      if (selectedProduct.requires_color && !selectedColor) {
        setError(t('pleaseSelectColor'))
        return
      }

      if (selectedProduct.requires_size && !selectedSize) {
        setError(t('pleaseSelectSize'))
        return
      }

      const newItem: CartItem = {
        productId: selectedProductId,
        productName: selectedProduct.name,
        price: productPrice,
        color: selectedColor || undefined,
        size: selectedSize || undefined
      }
      
      setCart([...cart, newItem])
      
      // Reset form
      setSelectedProductId('')
      setSelectedColor('')
      setSelectedSize('')
    }
    
    setError('')
  }

  const handleContinue = () => {
    if (cart.length === 0) {
      setError('Please add at least one product to your cart')
      return
    }

    // Store cart as product selection (convert to format expected by shipping page)
    sessionStorage.setItem('product', JSON.stringify(cart))
    router.push('/shipping')
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


          {/* Product Selection */}
          <div className="mb-6">
            <label htmlFor="product-select" className="block text-sm font-medium text-gray-700 mb-2">
              {t('selectProductLabel')}
            </label>
            <select
              id="product-select"
              value={selectedProductId}
              onChange={(e) => {
                const productId = e.target.value
                setSelectedProductId(productId)
                setSelectedSize('')
                setSelectedColor('')
                setError('')
                
                setActiveYetiSize('8oz')
                setYeti8ozColor('')
                setYeti26ozColor('')
                setYeti35ozColor('')
                
                const product = products.find(p => p.id === productId)
                
                if (product?.name !== 'YETI Kit') {
                  if (product?.requires_color && product.available_colors && product.available_colors.length > 0) {
                    setSelectedColor(product.available_colors[0])
                  } else if (product?.requires_color && product.available_colors?.includes('Black')) {
                    setSelectedColor('Black')
                  }
                  
                  if (product?.requires_size && product.available_sizes && product.available_sizes.length === 1) {
                    setSelectedSize(product.available_sizes[0])
                  }
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#663399] focus:border-transparent text-black bg-white"
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
                    {wouldExceedBudget && ` (Exceeds budget)`}
                  </option>
                )
              })}
            </select>
            {!canAddMore && (
              <p className="mt-1 text-xs text-red-600">Budget limit reached. Remove items to add more.</p>
            )}
          </div>

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
                        {!isYetiKit && <div className="text-4xl mb-2">📦</div>}
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

              {/* YETI Kit - Size buttons and individual color selection */}
              {isYetiKit && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Size to Configure
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveYetiSize('8oz')
                          setError('')
                        }}
                        className={`px-4 py-3 rounded-md border-2 font-medium transition-colors ${
                          activeYetiSize === '8oz'
                            ? 'border-[#663399] bg-[#663399] text-white'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        8oz Cup
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveYetiSize('26oz')
                          setError('')
                        }}
                        className={`px-4 py-3 rounded-md border-2 font-medium transition-colors ${
                          activeYetiSize === '26oz'
                            ? 'border-[#663399] bg-[#663399] text-white'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        26oz Bottle
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveYetiSize('35oz')
                          setError('')
                        }}
                        className={`px-4 py-3 rounded-md border-2 font-medium transition-colors ${
                          activeYetiSize === '35oz'
                            ? 'border-[#663399] bg-[#663399] text-white'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        35oz Tumbler
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color for {activeYetiSize === '8oz' ? '8oz Cup' : activeYetiSize === '26oz' ? '26oz Bottle' : '35oz Tumbler'}
                      {activeYetiSize === '8oz' && yeti8ozColor && <span className="text-green-600 ml-2">✓</span>}
                      {activeYetiSize === '26oz' && yeti26ozColor && <span className="text-green-600 ml-2">✓</span>}
                      {activeYetiSize === '35oz' && yeti35ozColor && <span className="text-green-600 ml-2">✓</span>}
                    </label>
                    <select
                      value={
                        activeYetiSize === '8oz' ? yeti8ozColor :
                        activeYetiSize === '26oz' ? yeti26ozColor :
                        yeti35ozColor
                      }
                      onChange={(e) => {
                        const color = e.target.value
                        if (activeYetiSize === '8oz') {
                          setYeti8ozColor(color)
                        } else if (activeYetiSize === '26oz') {
                          setYeti26ozColor(color)
                        } else {
                          setYeti35ozColor(color)
                        }
                        setError('')
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#663399] focus:border-transparent text-black bg-white"
                    >
                      <option value="">{t('selectColor')}</option>
                      {selectedProduct.available_colors
                        ?.filter(color => {
                          if (activeYetiSize === '26oz' && color === 'White') {
                            return false
                          }
                          return true
                        })
                        .map(color => (
                          <option key={color} value={color}>{color}</option>
                        ))}
                    </select>
                  </div>

                  <div className="pt-2">
                    <p className="text-xs text-gray-600 mb-1">Selection Progress:</p>
                    <div className="flex gap-2">
                      <div className={`flex-1 h-2 rounded ${yeti8ozColor ? 'bg-green-500' : 'bg-gray-200'}`} title="8oz"></div>
                      <div className={`flex-1 h-2 rounded ${yeti26ozColor ? 'bg-green-500' : 'bg-gray-200'}`} title="26oz"></div>
                      <div className={`flex-1 h-2 rounded ${yeti35ozColor ? 'bg-green-500' : 'bg-gray-200'}`} title="35oz"></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Regular product color selection */}
              {!isYetiKit && selectedProduct.requires_color && selectedProduct.available_colors && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('color')}
                  </label>
                  <select
                    value={selectedColor}
                    onChange={(e) => {
                      setSelectedColor(e.target.value)
                      setError('')
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#663399] focus:border-transparent text-black bg-white"
                  >
                    <option value="">{t('selectColor')}</option>
                    {selectedProduct.available_colors.map(color => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                </div>
              )}

              {selectedProduct.requires_size && selectedProduct.available_sizes && (
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
                    {selectedProduct.available_sizes.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={!canAddMore || (selectedProduct.price || 0) + currentTotal > MAX_BUDGET}
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
