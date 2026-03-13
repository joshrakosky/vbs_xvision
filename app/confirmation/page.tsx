'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import AdminExportButton from '@/components/AdminExportButton'
import HelpIcon from '@/components/HelpIcon'
import CartIcon from '@/components/CartIcon'

export default function ConfirmationPage() {
  const router = useRouter()
  const [orderNumber, setOrderNumber] = useState<string>('')

  useEffect(() => {
    const orderNum = sessionStorage.getItem('orderNumber')
    if (!orderNum) {
      router.push('/')
      return
    }
    setOrderNumber(orderNum)
  }, [router])

  return (
    <>
      <AdminExportButton />
      <HelpIcon />
      <CartIcon />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center px-4 relative">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
            <p className="text-gray-600">Thank you for your order</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <p className="text-sm text-gray-600 mb-2">Your Order Number:</p>
            <p className="text-2xl font-bold" style={{ color: '#663399' }}>{orderNumber}</p>
          </div>

          <p className="text-sm text-gray-600 mb-6">
            Screenshot this page or email yourself your order number by clicking the button below
          </p>

          <a
            href={`mailto:?subject=${encodeURIComponent(`XVision Order Confirmation - ${orderNumber}`)}&body=${encodeURIComponent(`Thank you for your XVision order!\n\nYour Order Number: ${orderNumber}\n\nPlease save this order number for your records.\n\nThank you for your order!`).replace(/\n/g, '\r\n')}`}
            onClick={() => {
              setTimeout(() => sessionStorage.clear(), 100)
            }}
            className="w-full px-6 py-2 text-white rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#663399] focus:ring-offset-2 font-medium inline-block text-center"
            style={{ backgroundColor: '#663399' }}
          >
            Email Order Confirmation
          </a>
        </div>
      </div>
    </>
  )
}
