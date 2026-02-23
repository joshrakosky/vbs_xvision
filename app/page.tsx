'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import VBSLogo from '@/components/VBSLogo'
import AdminExportButton from '@/components/AdminExportButton'
import HelpIcon from '@/components/HelpIcon'
import AnimatedBackground from '@/components/AnimatedBackground'
import { useLanguage } from '@/lib/languageContext'

// Allowed email addresses (case-insensitive) - whitelist for VB Spine access
const ALLOWED_EMAILS = [
  'josh.rakosky@proforma.com',
  'test@vbspineco.com',
  'bryan.webb@proforma.com'
  // Add more whitelisted emails here as needed
]

const ADMIN_EMAIL = 'josh.rakosky@proforma.com'

export default function LandingPage() {
  const router = useRouter()
  const { language, setLanguage, t } = useLanguage()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      setError(t('emailRequired'))
      return
    }

    // Normalize email to lowercase for comparison
    const normalizedEmail = email.toLowerCase().trim()

    // Check if admin email
    if (normalizedEmail === ADMIN_EMAIL.toLowerCase()) {
      sessionStorage.setItem('userEmail', normalizedEmail)
      sessionStorage.setItem('adminAuth', 'true')
      router.push('/product')
      return
    }

    // Check if email is in allowed list (case-insensitive)
    const isAllowed = ALLOWED_EMAILS.some(
      allowedEmail => allowedEmail.toLowerCase() === normalizedEmail
    )

    if (!isAllowed) {
      setError(t('emailNotAuthorized'))
      return
    }

    // Store user email and clear admin auth for regular users
    sessionStorage.setItem('userEmail', normalizedEmail)
    sessionStorage.removeItem('adminAuth')

    // Navigate to product selection page
    router.push('/product')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <AnimatedBackground />
      <AdminExportButton />
      <HelpIcon />
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="mb-3 flex justify-center">
            <VBSLogo className="text-xl" />
          </div>
          
          {/* Language Toggle */}
          <div className="mb-3 flex justify-center items-center gap-3">
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
            {t('enterEmail')}
          </p>
        </div>

        <form onSubmit={handleStart} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              {t('email')}
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError('')
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#663399] focus:border-transparent text-black bg-white"
              placeholder={t('emailPlaceholder')}
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
