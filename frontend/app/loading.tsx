import { Logo } from '@/components/Logo'

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30" />

      <div className="relative text-center">
        {/* Animated logo area */}
        <div className="relative w-16 h-16 mx-auto mb-6">
          {/* Outer glow ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 animate-pulse" />
          {/* Spinning ring */}
          <div className="absolute inset-0">
            <svg className="w-full h-full animate-spin" viewBox="0 0 64 64" fill="none">
              <circle
                cx="32" cy="32" r="28"
                stroke="#e0e7ff"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle
                cx="32" cy="32" r="28"
                stroke="url(#spinner-gradient)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="120 56"
              />
              <defs>
                <linearGradient id="spinner-gradient" x1="0" y1="0" x2="64" y2="64">
                  <stop stopColor="#6366f1" />
                  <stop offset="1" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          {/* Center logo */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Logo className="w-7 h-7" />
          </div>
        </div>

        <h2 className="text-lg font-bold text-gray-900 mb-1">Loading StudioSync...</h2>
        <p className="text-sm text-gray-400">Please wait a moment</p>
      </div>
    </div>
  )
}
