'use client'

/**
 * AnimatedBackground - Subtle floating orbs for landing page.
 * Pure CSS animations, no dependencies. Orbs drift slowly to add
 * depth without distracting from the main content.
 */
export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      {/* Base gradient layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-indigo-50" />
      {/* Floating orb 1 - top right, purple */}
      <div
        className="absolute w-96 h-96 rounded-full bg-purple-300/40 blur-3xl"
        style={{
          top: '10%',
          right: '10%',
          animation: 'float-slow 20s ease-in-out infinite',
        }}
      />
      {/* Floating orb 2 - bottom left, indigo */}
      <div
        className="absolute w-80 h-80 rounded-full bg-indigo-300/30 blur-3xl"
        style={{
          bottom: '15%',
          left: '5%',
          animation: 'float-slow-reverse 25s ease-in-out infinite',
        }}
      />
      {/* Floating orb 3 - mid-right, violet accent with pulse */}
      <div
        className="absolute w-72 h-72 rounded-full bg-violet-200/35 blur-3xl"
        style={{
          top: '40%',
          right: '30%',
          animation: 'float-slow 18s ease-in-out infinite, pulse-soft 8s ease-in-out infinite',
        }}
      />
    </div>
  )
}
