import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/** Generate order number: XVS-001, XVS-002, etc. */
async function generateOrderNumber(): Promise<string> {
  const { data: orders, error } = await supabase
    .from('xvision_orders')
    .select('order_number')
    .order('created_at', { ascending: false })
    .limit(1)

  if (error) {
    console.error('Error fetching orders:', error)
    return 'XVS-001'
  }

  if (!orders || orders.length === 0) return 'XVS-001'

  const lastOrderNumber = orders[0].order_number
  const match = lastOrderNumber.match(/XVS-(\d+)/i)
  if (match) {
    const nextNumber = parseInt(match[1], 10) + 1
    return `XVS-${String(nextNumber).padStart(3, '0')}`
  }
  return 'XVS-001'
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, shipping, cart } = body

    if (!email || !shipping || !cart) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const cartItems = Array.isArray(cart) ? cart : [cart]
    const orderNumber = await generateOrderNumber()

    // Name badge text for order (from name_badge cart item)
    const badgeItem = cartItems.find((i: { category?: string }) => i.category === 'name_badge')
    const nameBadgeText = badgeItem?.customText || null

    const { data: order, error: orderError } = await supabase
      .from('xvision_orders')
      .insert({
        email: email.toLowerCase(),
        order_number: orderNumber,
        shipping_name: shipping.name || '',
        shipping_phone: shipping.phone || null,
        shipping_address: shipping.address || '',
        shipping_address2: shipping.address2 || null,
        shipping_city: shipping.city || '',
        shipping_state: shipping.state || '',
        shipping_zip: shipping.zip || '',
        shipping_country: shipping.country || 'USA',
        name_badge_text: nameBadgeText,
      })
      .select()
      .single()

    if (orderError) throw orderError

    const orderItems: Array<{
      order_id: string
      product_id: string
      product_name: string
      customer_item_number?: string
      color?: string
      size?: string
      logo_color?: string
      custom_text?: string
    }> = []

    for (const item of cartItems) {
      // Scrub set: 2 order items (top + bottom)
      if (item.scrubTopId && item.scrubBottomId) {
        const { data: topProduct } = await supabase
          .from('xvision_products')
          .select('name, customer_item_number')
          .eq('id', item.scrubTopId)
          .single()
        const { data: bottomProduct } = await supabase
          .from('xvision_products')
          .select('name, customer_item_number')
          .eq('id', item.scrubBottomId)
          .single()

        orderItems.push({
          order_id: order.id,
          product_id: item.scrubTopId,
          product_name: topProduct?.name || item.scrubTopName || 'Scrub Top',
          customer_item_number: topProduct?.customer_item_number || undefined,
          size: item.scrubTopSize || null,
          color: item.scrubTopColor || 'Black',
        })
        orderItems.push({
          order_id: order.id,
          product_id: item.scrubBottomId,
          product_name: bottomProduct?.name || item.scrubBottomName || 'Scrub Bottom',
          customer_item_number: bottomProduct?.customer_item_number || undefined,
          size: item.scrubBottomSize || null,
          color: item.scrubBottomColor || 'Black',
        })
        continue
      }

      // Regular items (bags, water_bottle, wearables, journal, name_badge)
      const productId = item.productId
      if (!productId) continue

      const { data: productData } = await supabase
        .from('xvision_products')
        .select('name, customer_item_number, category')
        .eq('id', productId)
        .single()

      // Journal defaults to Grey for processing (not shown on frontend)
      const isJournal = productData?.category === 'journal'
      const itemColor = isJournal ? 'Grey' : (item.color || undefined)

      const qty = item.quantity ?? 1
      for (let i = 0; i < qty; i++) {
        orderItems.push({
          order_id: order.id,
          product_id: productId,
          product_name: productData?.name || item.productName || 'Unknown',
          customer_item_number: productData?.customer_item_number || undefined,
          color: itemColor,
          size: item.size || undefined,
          logo_color: item.logo_color || undefined,
          custom_text: item.category === 'name_badge' ? item.customText : undefined,
        })
      }
    }

    const { error: itemsError } = await supabase.from('xvision_order_items').insert(orderItems)
    if (itemsError) throw itemsError

    return NextResponse.json({
      success: true,
      order_number: orderNumber,
      order_id: order.id,
    })
  } catch (error: unknown) {
    console.error('Order creation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create order' },
      { status: 500 }
    )
  }
}
