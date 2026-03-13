'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import AdminExportButton from '@/components/AdminExportButton'
import HelpIcon from '@/components/HelpIcon'
import { getNextRoute } from '@/lib/pageConfig'

export default function InstructionsPage() {
  const router = useRouter()

  useEffect(() => {
    if (!sessionStorage.getItem('accessGranted')) {
      router.push('/')
      return
    }
  }, [router])

  const handleContinue = () => {
    const next = getNextRoute('instructions')
    if (next) router.push(`/${next}`)
  }

  return (
    <>
      <AdminExportButton />
      <HelpIcon />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 py-12 px-4 relative">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">How It Works</h1>
            <p className="text-gray-600 mb-6">
              You will make your selections in the following order. Each step is required unless noted.
            </p>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#663399] text-white flex items-center justify-center font-bold text-sm">1</span>
                <div>
                  <span className="font-semibold text-gray-900">One bag</span>
                  <p className="text-sm text-gray-600 mt-0.5">Select your backpack</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#663399] text-white flex items-center justify-center font-bold text-sm">2</span>
                <div>
                  <span className="font-semibold text-gray-900">One water bottle</span>
                  <p className="text-sm text-gray-600 mt-0.5">Select your water bottle</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#663399] text-white flex items-center justify-center font-bold text-sm">3</span>
                <div>
                  <span className="font-semibold text-gray-900">Two wearables</span>
                  <p className="text-sm text-gray-600 mt-0.5">Select your first wearable, then your second. Scrubs (top + bottom) count as one wearable.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#663399] text-white flex items-center justify-center font-bold text-sm">4</span>
                <div>
                  <span className="font-semibold text-gray-900">Journal & name badge</span>
                  <p className="text-sm text-gray-600 mt-0.5">Optional add-ons</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#663399] text-white flex items-center justify-center font-bold text-sm">5</span>
                <div>
                  <span className="font-semibold text-gray-900">Shipping & confirmation</span>
                  <p className="text-sm text-gray-600 mt-0.5">Enter your address and review your order</p>
                </div>
              </li>
            </ul>

            <button
              type="button"
              onClick={handleContinue}
              className="w-full py-3 px-4 text-white rounded-md hover:opacity-90 font-medium"
              style={{ backgroundColor: '#663399' }}
            >
              Get Started →
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
