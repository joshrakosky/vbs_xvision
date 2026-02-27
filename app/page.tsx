'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import VBSLogo from '@/components/VBSLogo'
import AdminExportButton from '@/components/AdminExportButton'
import HelpIcon from '@/components/HelpIcon'
import AnimatedBackground from '@/components/AnimatedBackground'
import { useLanguage } from '@/lib/languageContext'

// Access code for entry - email is collected during checkout
const ACCESS_CODE = 'CestasSpine*2026!'
// Admin code - grants export access (separate from access code)
const ADMIN_CODE = 'admin'

export default function LandingPage() {
  const router = useRouter()
  const { language, setLanguage, t } = useLanguage()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!code.trim()) {
      setError(t('accessCodeRequired'))
      return
    }

    if (code !== ACCESS_CODE && code !== ADMIN_CODE) {
      setError(t('accessCodeInvalid'))
      return
    }

    // Grant access - email will be collected at checkout
    sessionStorage.setItem('accessGranted', 'true')
    if (code === ADMIN_CODE) {
      sessionStorage.setItem('adminAuth', 'true')
    } else {
      sessionStorage.removeItem('adminAuth')
    }

    router.push('/product')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <AnimatedBackground />
      <AdminExportButton />
      <HelpIcon />
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 py-10">
        <div className="text-center mb-6">
          <div className="mb-6 flex justify-center">
            <VBSLogo className="text-xl" />
          </div>
          
          {/* Language Toggle */}
          <div className="mb-4 flex justify-center items-center gap-3">
            <span className={`text-sm font-medium ${language === 'en' ? 'text-gray-900' : 'text-gray-400'}`}>EN</span>
            <button
              type="button"
              onClick={() => setLanguage(language === 'en' ? 'fr' : 'en')}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#663399] focus:ring-offset-2"
              style={{ backgroundColor: language === 'en' ? '#663399' : '#D9C2FF' }}
              aria-label="Toggle language"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  language === 'en' ? 'translate-x-1' : 'translate-x-6'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${language === 'fr' ? 'text-gray-900' : 'text-gray-400'}`}>FR</span>
          </div>

          <p className="text-gray-600">
            {t('enterAccessCode')}
          </p>
        </div>

        <form onSubmit={handleStart} className="space-y-6">
          <div>
            <label htmlFor="accessCode" className="block text-sm font-medium text-gray-700 mb-2">
              {t('accessCode')}
            </label>
            <input
              type="text"
              id="accessCode"
              value={code}
              onChange={(e) => {
                setCode(e.target.value)
                setError('')
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#663399] focus:border-transparent text-black bg-white"
              placeholder={t('accessCodePlaceholder')}
              required
            />
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full text-white py-3 px-4 rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#663399] focus:ring-offset-2 transition-colors font-medium"
            style={{ backgroundColor: '#663399' }}
          >
            {t('startShopping')}
          </button>
        </form>
      </div>
    </div>
  )
}
