'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/** Redirect legacy /wearables route to /wearables-1 */
export default function WearablesPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/wearables-1')
  }, [router])
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg">Redirecting...</div>
    </div>
  )
}
