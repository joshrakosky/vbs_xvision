import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { FIXED_SHIPPING_ADDRESS } from '@/lib/shippingConfig'

// Generate unique order number in format CES-001, CES-002, etc.
async function generateOrderNumber(): Promise<string> {
  // Get the highest existing order number
  const { data: orders, error } = await supabase
    .from('cestes_orders')
    .select('order_number')
    .order('created_at', { ascending: false })
    .limit(1)

  if (error) {
    console.error('Error fetching orders:', error)
    // Fallback: start from 1 if there's an error
    return 'CES-001'
  }

  if (!orders || orders.length === 0) {
    // First order
    return 'CES-001'
  }

  // Extract number from existing order (e.g., "CES-001" -> 1)
  const lastOrderNumber = orders[0].order_number
  const match = lastOrderNumber.match(/CES-(\d+)/i)
  
  if (match) {
    const lastNumber = parseInt(match[1], 10)
    const nextNumber = lastNumber + 1
    return `CES-${String(nextNumber).padStart(3, '0')}`
  }

  // If format doesn't match, start from 1
  return 'CES-001'
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, shipping, product } = body

    // Validate required fields
    if (!email || !shipping || !product) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Handle cart (array of products) or single product
    const cartItems = Array.isArray(product) ? product : [product]

    // Check for duplicate order by email (one order per email)
    const { data: existingOrder } = await supabase
      .from('cestes_orders')
      .select('id')
      .eq('email', email.toLowerCase())
      .single()

    if (existingOrder) {
      return NextResponse.json(
        { error: 'An order already exists for this email address. Only one order per email is allowed.' },
        { status: 400 }
      )
    }

    // Generate order number
    const orderNumber = await generateOrderNumber()

    // Create order with fixed shipping address (user shipping info collected but not used)
    const { data: order, error: orderError } = await supabase
      .from('cestes_orders')
      .insert({
        email: email.toLowerCase(),
        order_number: orderNumber,
        shipping_name: FIXED_SHIPPING_ADDRESS.name,
        shipping_address: FIXED_SHIPPING_ADDRESS.address,
        shipping_address2: FIXED_SHIPPING_ADDRESS.address2 || null,
        shipping_city: FIXED_SHIPPING_ADDRESS.city,
        shipping_state: FIXED_SHIPPING_ADDRESS.state,
        shipping_zip: FIXED_SHIPPING_ADDRESS.zip,
        shipping_country: FIXED_SHIPPING_ADDRESS.country
      })
      .select()
      .single()

    if (orderError) throw orderError

    // Process all cart items
    const orderItems: any[] = []
    
    for (const cartItem of cartItems) {
      // Get product details
      const { data: productData } = await supabase
        .from('cestes_products')
        .select('name, customer_item_number')
        .eq('id', cartItem.productId)
        .single()

      // Handle YETI Kit specially - creates 3 items (one for each size) with individual colors
      const isYetiKit = cartItem.isYetiKit || productData?.name === 'YETI Kit'
      
      if (isYetiKit && cartItem.yeti8ozColor && cartItem.yeti26ozColor && cartItem.yeti35ozColor) {
        // Create 3 order items for YETI Kit
        const yetiItems = [
          {
            size: '8oz',
            name: 'YETI Rambler 8oz Stackable Cup',
            color: cartItem.yeti8ozColor
          },
          {
            size: '26oz',
            name: 'YETI Rambler 26oz Straw Bottle',
            color: cartItem.yeti26ozColor
          },
          {
            size: '35oz',
            name: 'YETI Rambler 35oz Tumbler with Straw Lid',
            color: cartItem.yeti35ozColor
          }
        ]
        
        yetiItems.forEach(item => {
          orderItems.push({
            order_id: order.id,
            product_id: cartItem.productId,
            product_name: item.name,
            customer_item_number: productData?.customer_item_number || null,
            color: item.color,
            size: item.size
          })
        })
      } else {
        // Regular product
        orderItems.push({
          order_id: order.id,
          product_id: cartItem.productId,
          product_name: cartItem.productName || productData?.name || 'Unknown Product',
          customer_item_number: productData?.customer_item_number || null,
          color: cartItem.color || null,
          size: cartItem.size || null
        })
      }
    }

    const { error: itemsError } = await supabase
      .from('cestes_order_items')
      .insert(orderItems)

    if (itemsError) throw itemsError

    return NextResponse.json({
      success: true,
      order_number: orderNumber,
      order_id: order.id
    })

  } catch (error: any) {
    console.error('Order creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    )
  }
}

