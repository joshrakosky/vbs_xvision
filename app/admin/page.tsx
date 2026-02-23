'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import * as XLSX from 'xlsx'
import { OrderWithItems } from '@/types'
import HelpIcon from '@/components/HelpIcon'

export default function AdminPage() {
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [loading, setLoading] = useState(true)
  const [password, setPassword] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [error, setError] = useState('')

  // Simple password protection (you can enhance this later)
  const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'vbspine2024'

  useEffect(() => {
    if (authenticated) {
      loadOrders()
    }
  }, [authenticated])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true)
      setError('')
    } else {
      setError('Incorrect password')
    }
  }

  const loadOrders = async () => {
    try {
      setLoading(true)
      
      // Fetch orders with their items
      const { data: ordersData, error: ordersError } = await supabase
        .from('cestes_orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (ordersError) throw ordersError

      // Fetch order items for each order
      const ordersWithItems = await Promise.all(
        (ordersData || []).map(async (order) => {
          const { data: items, error: itemsError } = await supabase
            .from('cestes_order_items')
            .select('*')
            .eq('order_id', order.id)
            .order('created_at')

          if (itemsError) throw itemsError

          return {
            ...order,
            items: items || []
          }
        })
      )

      setOrders(ordersWithItems)
    } catch (err: any) {
      setError(err.message || 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const exportToExcel = async () => {
    // Fetch all products with fulfillment columns for export
    const { data: productsData, error: productsError } = await supabase
      .from('cestes_products')
      .select('id, deco, vendor_ref, vendor_item_num, unit_cost, unit_sell, logo, logo_colors_available, logo_location, notes')

    if (productsError) {
      alert('Failed to load product information. Please try again.')
      return
    }

    const productMap = new Map<string, Record<string, unknown>>()
    productsData?.forEach(product => {
      productMap.set(product.id, product as Record<string, unknown>)
    })

    // Sheet 1: Detailed Orders (one row per item)
    const detailedData = orders.flatMap(order => {
      return order.items.map((item) => {
        const product = item.product_id ? productMap.get(item.product_id) : undefined
        const itemWithLogo = item as { logo_color?: string }
        return {
          'Order Number': order.order_number,
          'Email': order.email,
          'Product Name': item.product_name,
          'Customer Item #': item.customer_item_number || '',
          'Vendor Ref': product?.vendor_ref ?? '',
          'Vendor Item #': product?.vendor_item_num ?? '',
          'Unit Cost': product?.unit_cost ?? '',
          'Unit Sell': product?.unit_sell ?? '',
          'Color': item.color || '',
          'Size': item.size || '',
          'Logo': product?.logo ?? '',
          'Logo Colors': product?.logo_colors_available ?? '',
          'Logo Color': itemWithLogo.logo_color ?? '',
          'Logo Location': product?.logo_location ?? '',
          'Notes': product?.notes ?? '',
          'Shipping Name': order.shipping_name,
          'Shipping Address': order.shipping_address,
          'Shipping City': order.shipping_city,
          'Shipping State': order.shipping_state,
          'Shipping ZIP': order.shipping_zip,
          'Shipping Country': order.shipping_country,
          'Order Date': new Date(order.created_at).toLocaleDateString()
        }
      })
    })

    // Sheet 2: Distribution Summary (grouped by product/color/size/logo color)
    type SummaryEntry = { quantity: number; product: Record<string, unknown> | undefined }
    const summaryMap = new Map<string, SummaryEntry>()
    
    orders.forEach(order => {
      order.items.forEach(item => {
        const itemWithLogo = item as { logo_color?: string }
        const key = [
          item.product_name,
          item.customer_item_number || '',
          item.color || 'N/A',
          item.size || 'N/A',
          itemWithLogo.logo_color || 'N/A'
        ].join('|')
        
        const product = item.product_id ? productMap.get(item.product_id) : undefined
        const existing = summaryMap.get(key)
        if (existing) {
          summaryMap.set(key, { quantity: existing.quantity + 1, product: existing.product })
        } else {
          summaryMap.set(key, { quantity: 1, product })
        }
      })
    })

    const summaryData = Array.from(summaryMap.entries()).map(([key, data]) => {
      const [productName, customerItem, color, size, logoColor] = key.split('|')
      const product = data.product
      return {
        'Product Name': productName,
        'Customer Item #': customerItem,
        'Vendor Ref': product?.vendor_ref ?? '',
        'Vendor Item #': product?.vendor_item_num ?? '',
        'Unit Cost': product?.unit_cost ?? '',
        'Unit Sell': product?.unit_sell ?? '',
        'Color': color,
        'Size': size,
        'Logo': product?.logo ?? '',
        'Logo Colors': product?.logo_colors_available ?? '',
        'Logo Color': logoColor !== 'N/A' ? logoColor : '',
        'Logo Location': product?.logo_location ?? '',
        'Deco': product?.deco ?? '',
        'Notes': product?.notes ?? '',
        'Quantity': data.quantity
      }
    }).sort((a, b) => {
      if (a['Product Name'] !== b['Product Name']) {
        return (a['Product Name'] as string).localeCompare(b['Product Name'] as string)
      }
      if (a['Color'] !== b['Color']) {
        return (a['Color'] as string).localeCompare(b['Color'] as string)
      }
      if (a['Size'] !== b['Size']) {
        return (a['Size'] as string).localeCompare(b['Size'] as string)
      }
      return (a['Logo Color'] as string).localeCompare(b['Logo Color'] as string)
    })

    // Create workbook with two sheets
    const wb = XLSX.utils.book_new()
    
    // Detailed Orders sheet
    const wsDetailed = XLSX.utils.json_to_sheet(detailedData)
    XLSX.utils.book_append_sheet(wb, wsDetailed, 'Detailed Orders')
    
    // Distribution Summary sheet
    const wsSummary = XLSX.utils.json_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Distribution Summary')

    // Generate filename with current date
    const filename = `cestes-orders-${new Date().toISOString().split('T')[0]}.xlsx`

    // Write file
    XLSX.writeFile(wb, filename)
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 relative">
        <HelpIcon />
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Access</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError('')
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#663399] focus:border-transparent"
                required
              />
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full text-white py-2 px-4 rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#663399] focus:ring-offset-2"
              style={{ backgroundColor: '#663399' }}
            >
              Login
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 relative">
      <HelpIcon />
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">VB Spine Order Management</h1>
              <p className="text-gray-600 mt-1">Total Orders: {orders.length}</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={loadOrders}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Refresh
              </button>
              <button
                onClick={exportToExcel}
                disabled={orders.length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Exports two sheets: Detailed Orders and Distribution Summary"
              >
                Export to Excel
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="text-lg text-gray-600">Loading orders...</div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-lg text-gray-600">No orders yet</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Products
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Shipping Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.order_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="space-y-1">
                          {order.items.map((item, idx) => (
                            <div key={idx}>
                              {item.product_name}
                              {item.customer_item_number && ` [${item.customer_item_number}]`}
                              {item.color && ` - ${item.color}`}
                              {item.size && ` (${item.size})`}
                              {(item as { logo_color?: string }).logo_color && ` Logo: ${(item as { logo_color?: string }).logo_color}`}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div>
                          {order.shipping_name}<br />
                          {order.shipping_address}<br />
                          {order.shipping_city}, {order.shipping_state} {order.shipping_zip}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

