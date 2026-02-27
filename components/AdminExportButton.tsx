'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import * as XLSX from 'xlsx'
import { OrderWithItems } from '@/types'

export default function AdminExportButton() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Admin access is granted via access code (stored in sessionStorage)
    const adminAuth = sessionStorage.getItem('adminAuth')
    const isAdminUser = adminAuth === 'true'
    setIsAdmin(Boolean(isAdminUser))
  }, [])

  const exportToExcel = async () => {
    if (!isAdmin) return

    try {
      setLoading(true)

      // Fetch all orders with their items
      const { data: ordersData, error: ordersError } = await supabase
        .from('cestes_orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (ordersError) throw ordersError

      // Fetch all products with fulfillment columns for export
      const { data: productsData, error: productsError } = await supabase
        .from('cestes_products')
        .select('id, deco, vendor_ref, vendor_item_num, unit_cost, unit_sell, logo, logo_colors_available, logo_location, notes')

      if (productsError) throw productsError

      // Map product_id -> product for lookup
      const productMap = new Map<string, Record<string, unknown>>()
      productsData?.forEach(product => {
        productMap.set(product.id, product as Record<string, unknown>)
      })

      // Fetch order items for each order
      const ordersWithItems: OrderWithItems[] = await Promise.all(
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

      // Sheet 1: Detailed Orders (one row per item)
      const detailedData = ordersWithItems.flatMap(order => {
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
      
      ordersWithItems.forEach(order => {
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

      // Convert map to array for Excel
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
        // Sort by product name, color, size, logo color
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
    } catch (error: any) {
      console.error('Export error:', error)
      alert('Failed to export orders. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isAdmin) return null

  // Icon-only circular button (matches HelpIcon style)
  return (
    <button
      onClick={exportToExcel}
      disabled={loading}
      className="fixed bottom-4 right-4 z-50 w-10 h-10 rounded-full flex items-center justify-center text-white transition-opacity shadow-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ backgroundColor: '#663399' }}
      title="Export all orders to Excel (Admin only)"
      aria-label="Export orders"
    >
      {loading ? (
        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"></circle>
          <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )}
    </button>
  )
}

