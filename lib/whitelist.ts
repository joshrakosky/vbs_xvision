/**
 * XVision email whitelist - only these emails can access the store.
 * Add/remove emails as needed for your team.
 */

export const ALLOWED_EMAILS: string[] = [
  'admin', // Admin access - enter "admin" as email to access site
  'amy.ford@vbspineco.com',
  'gilberto.kabayao@vbspineco.com',
  'zach.reilman@vbspineco.com',
  'kevin.kett@vbspineco.com',
  'matthew.sandler@vbspineco.com',
  'austin.hatley@vbspineco.com',
  'eric.trama@vbspineco.com',
  'eddie.ahumada@vbspineco.com',
  'ian.spero@vbspineco.com',
  'eric.marohl@vbspineco.com',
  'jon.michalowski@vbspineco.com',
  'leanne.lewis@vbspineco.com',
  'kevin.sukowicz@vbspineco.com',
]

/**
 * Check if an email is allowed to access the XVision store.
 * Comparison is case-insensitive.
 */
export function isEmailAllowed(email: string): boolean {
  const normalized = email.trim().toLowerCase()
  return ALLOWED_EMAILS.some((allowed) => allowed.toLowerCase() === normalized)
}
