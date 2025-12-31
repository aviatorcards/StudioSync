'use client'

import { FeatureGate, FeatureValue } from '@/components/FeatureGate'
import { useFeatureFlag } from '@/hooks/useFeatureFlag'

export function FeatureFlagExamples() {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Feature Flag Examples</h3>

        {/* Example 1: Simple boolean flag */}
        <div className="mb-6">
          <h4 className="font-medium text-sm text-gray-700 mb-2">1. Boolean Flag with FeatureGate</h4>
          <FeatureGate flag="stripe_payments">
            <div className="p-3 bg-green-50 border border-green-200 rounded">
              Stripe payments are enabled!
            </div>
          </FeatureGate>
          <FeatureGate flag="stripe_payments" invert>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded">
              Stripe payments are disabled
            </div>
          </FeatureGate>
        </div>

        {/* Example 2: Using the hook directly */}
        <div className="mb-6">
          <h4 className="font-medium text-sm text-gray-700 mb-2">2. Using useFeatureFlag Hook</h4>
          <DirectHookExample />
        </div>

        {/* Example 3: Value-based flags */}
        <div className="mb-6">
          <h4 className="font-medium text-sm text-gray-700 mb-2">3. Value-based Flags</h4>
          <FeatureValue flag="max_file_upload_size" defaultValue={10}>
            {(maxSize) => (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                Maximum file upload size: {maxSize}MB
              </div>
            )}
          </FeatureValue>
        </div>

        {/* Example 4: Conditional rendering with fallback */}
        <div className="mb-6">
          <h4 className="font-medium text-sm text-gray-700 mb-2">4. With Fallback Content</h4>
          <FeatureGate
            flag="advanced_analytics"
            fallback={
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                Upgrade to view advanced analytics
              </div>
            }
          >
            <div className="p-3 bg-green-50 border border-green-200 rounded">
              Advanced analytics dashboard would be shown here
            </div>
          </FeatureGate>
        </div>
      </div>
    </div>
  )
}

function DirectHookExample() {
  const { isEnabled, isLoading } = useFeatureFlag('email_notifications')

  if (isLoading) {
    return <div className="p-3 bg-gray-100 rounded animate-pulse">Loading...</div>
  }

  return (
    <div className={`p-3 rounded border ${isEnabled ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
      Email notifications: {isEnabled ? 'Enabled' : 'Disabled'}
    </div>
  )
}
