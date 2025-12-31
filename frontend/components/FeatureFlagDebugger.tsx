'use client'

import { useState } from 'react'
import { useFeatureFlags } from '@/contexts/FeatureFlagsContext'

export function FeatureFlagDebugger() {
  const { flags, isLoading, refresh } = useFeatureFlags()
  const [isOpen, setIsOpen] = useState(false)

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-purple-700 text-sm z-50"
        title="Feature Flags Debugger"
      >
        FF Debug
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-xl p-4 max-w-md max-h-96 overflow-auto z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">Feature Flags</h3>
        <div className="flex gap-2">
          <button
            onClick={() => refresh()}
            className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Refresh'}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
      </div>

      {Object.keys(flags).length === 0 ? (
        <p className="text-sm text-gray-500">No feature flags loaded</p>
      ) : (
        <div className="space-y-2">
          {Object.entries(flags).map(([key, value]) => (
            <div key={key} className="flex items-start justify-between text-sm border-b border-gray-100 pb-2">
              <span className="font-mono text-xs text-gray-700 flex-1">{key}</span>
              <span className="ml-2 font-semibold">
                {typeof value === 'boolean' ? (
                  <span className={value ? 'text-green-600' : 'text-red-600'}>
                    {value ? 'ON' : 'OFF'}
                  </span>
                ) : (
                  <span className="text-blue-600">{JSON.stringify(value)}</span>
                )}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
