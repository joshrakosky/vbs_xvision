'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import VBSLogo from '@/components/VBSLogo'
import AdminExportButton from '@/components/AdminExportButton'
import HelpIcon from '@/components/HelpIcon'
import AnimatedBackground from '@/components/AnimatedBackground'
import { isEmailAllowed } from '@/lib/whitelist'

export default function LandingPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      setError('Please enter your email address')
      return
    }

    if (!isEmailAllowed(email)) {
      setError('This email is not authorized to access the store. Please contact support.')
      return
    }

    sessionStorage.setItem('accessGranted', 'true')
    sessionStorage.setItem('orderEmail', email.trim().toLowerCase())
    if (email.trim().toLowerCase() === 'admin') {
      sessionStorage.setItem('adminAuth', 'true')
    } else {
      sessionStorage.removeItem('adminAuth')
    }
    router.push('/instructions')
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

          <p className="text-gray-600">
            Enter your email to start shopping
          </p>
        </div>

        <form onSubmit={handleStart} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="text"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError('')
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#663399] focus:border-transparent text-black bg-white"
              placeholder="Enter your email"
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
            Start Shopping →
          </button>
        </form>
      </div>
    </div>
  )
}
