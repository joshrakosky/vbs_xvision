'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import VBSLogo from '@/components/VBSLogo'
import AdminExportButton from '@/components/AdminExportButton'
import HelpIcon from '@/components/HelpIcon'
import CartIcon from '@/components/CartIcon'
import { useLanguage } from '@/lib/languageContext'

export default function ConfirmationPage() {
  const router = useRouter()
  const { t } = useLanguage()
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
      {/* Fixed position icons - rendered outside relative container */}
      <AdminExportButton />
      <HelpIcon />
      <CartIcon />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center px-4 relative">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="mb-4 flex justify-center">
            <VBSLogo className="text-2xl mb-4" />
          </div>
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('orderConfirmed')}</h1>
          <p className="text-gray-600">
            {t('thankYouOrder')}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <p className="text-sm text-gray-600 mb-2">{t('yourOrderNumber')}</p>
          <p className="text-2xl font-bold" style={{ color: '#663399' }}>{orderNumber}</p>
        </div>

        <p className="text-sm text-gray-600 mb-6">
          {t('screenshotInfo')}
        </p>

        <a
          href={`mailto:?subject=VB Spine Order Confirmation - ${orderNumber}&body=Thank you for your VB Spine order!%0D%0A%0D%0AYour Order Number: ${orderNumber}%0D%0A%0D%0APlease save this order number for your records.%0D%0A%0D%0AThank you for your order!`}
          onClick={() => {
            // Clear session after a short delay to allow mailto to open
            setTimeout(() => {
              sessionStorage.clear()
            }, 100)
          }}
          className="w-full px-6 py-2 text-white rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#663399] focus:ring-offset-2 font-medium inline-block text-center"
          style={{ backgroundColor: '#663399' }}
        >
          {t('emailConfirmation')}
        </a>
      </div>
      </div>
    </>
  )
}

