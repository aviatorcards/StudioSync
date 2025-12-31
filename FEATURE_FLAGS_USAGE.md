# Feature Flags Frontend Usage Guide

This guide shows how to use feature flags in your React components.

## Quick Start

### 1. Import the hooks/components

```typescript
import { useFeatureFlag } from '@/hooks/useFeatureFlag'
import { FeatureGate } from '@/components/FeatureGate'
```

### 2. Use in your components

#### Pattern 1: Simple Boolean Flag (Recommended)

```tsx
import { FeatureGate } from '@/components/FeatureGate'

export function PaymentSection() {
  return (
    <div>
      <h2>Payment Methods</h2>

      {/* Only show if stripe_payments is enabled */}
      <FeatureGate flag="stripe_payments">
        <StripePaymentButton />
      </FeatureGate>

      {/* Show fallback when disabled */}
      <FeatureGate
        flag="advanced_analytics"
        fallback={<UpgradeBanner />}
      >
        <AdvancedAnalyticsDashboard />
      </FeatureGate>
    </div>
  )
}
```

#### Pattern 2: Using the Hook

```tsx
import { useFeatureFlag } from '@/hooks/useFeatureFlag'

export function MessagingComponent() {
  const { isEnabled, isLoading } = useFeatureFlag('messaging_enabled')

  if (isLoading) {
    return <Spinner />
  }

  if (!isEnabled) {
    return <p>Messaging is not available</p>
  }

  return <MessagingInterface />
}
```

#### Pattern 3: Value-based Flags

```tsx
import { useFeatureFlag } from '@/hooks/useFeatureFlag'

export function FileUploader() {
  const { value: maxSize, isLoading } = useFeatureFlag('max_file_upload_size', 10)

  return (
    <input
      type="file"
      accept="*/*"
      max={maxSize * 1024 * 1024} // Convert MB to bytes
    />
  )
}
```

#### Pattern 4: Configuration Objects

```tsx
import { useFeatureFlag } from '@/hooks/useFeatureFlag'

export function EmailSettings() {
  const defaultConfig = {
    provider: 'sendgrid',
    daily_limit: 100
  }
  const { value: emailConfig } = useFeatureFlag('email_config', defaultConfig)

  return (
    <div>
      <p>Provider: {emailConfig.provider}</p>
      <p>Daily Limit: {emailConfig.daily_limit}</p>
    </div>
  )
}
```

## Common Use Cases

### Conditional Feature Rendering

```tsx
function BillingPage() {
  return (
    <div>
      {/* Show Stripe payment option */}
      <FeatureGate flag="stripe_payments">
        <button>Pay with Stripe</button>
      </FeatureGate>

      {/* Show PayPal option */}
      <FeatureGate flag="paypal_payments">
        <button>Pay with PayPal</button>
      </FeatureGate>
    </div>
  )
}
```

### A/B Testing

```tsx
function DashboardHeader() {
  const { value: variant } = useFeatureFlag('header_variant', 'A')

  if (variant === 'B') {
    return <NewHeaderDesign />
  }

  return <OriginalHeader />
}
```

### Gradual Rollout

```tsx
function ExperimentalFeature() {
  const { isEnabled } = useFeatureFlag('beta_editor')

  return (
    <div>
      {isEnabled ? (
        <BetaEditor />
      ) : (
        <ClassicEditor />
      )}
    </div>
  )
}
```

### Role-based Features

Feature flags can be scoped to roles on the backend. Just check the flag normally:

```tsx
function AdminTools() {
  // This flag is configured as role:admin on the backend
  return (
    <FeatureGate flag="advanced_admin_tools">
      <AdvancedAdminPanel />
    </FeatureGate>
  )
}
```

### Environment-specific Features

```tsx
function DebugPanel() {
  const { isEnabled } = useFeatureFlag('debug_mode')

  // Only show in development OR if flag is enabled
  if (process.env.NODE_ENV === 'development' || isEnabled) {
    return <DebugInfo />
  }

  return null
}
```

## Best Practices

### 1. Always provide defaults

```tsx
// ✅ Good: Provides fallback
const { value: theme } = useFeatureFlag('theme', 'light')

// ❌ Bad: No fallback, could be undefined
const { value: theme } = useFeatureFlag('theme')
```

### 2. Handle loading states

```tsx
// ✅ Good: Shows loading state
function Feature() {
  const { isEnabled, isLoading } = useFeatureFlag('feature')

  if (isLoading) return <Skeleton />
  return isEnabled ? <Feature /> : null
}

// ❌ Bad: Flicker during load
function Feature() {
  const { isEnabled } = useFeatureFlag('feature')
  return isEnabled ? <Feature /> : null
}
```

### 3. Use FeatureGate for simple cases

```tsx
// ✅ Good: Simple and clean
<FeatureGate flag="new_ui">
  <NewInterface />
</FeatureGate>

// ❌ Overkill: Hook not needed
function Wrapper() {
  const { isEnabled } = useFeatureFlag('new_ui')
  return isEnabled ? <NewInterface /> : null
}
```

### 4. Cache is automatic

The FeatureFlagsContext automatically caches flags for 5 minutes in localStorage. You don't need to implement your own caching.

### 5. Refresh when needed

```tsx
function AdminPanel() {
  const { refresh } = useFeatureFlags()

  const handleFlagUpdate = async () => {
    // Update flag via API...
    await refresh() // Reload all flags
  }

  return <button onClick={handleFlagUpdate}>Save</button>
}
```

## Debugging

### Development Debugger

In development mode, you'll see a "FF Debug" button in the bottom-right corner. Click it to:
- View all active flags
- See current values
- Refresh flags manually

### Console Logging

```tsx
import { useFeatureFlags } from '@/contexts/FeatureFlagsContext'

function MyComponent() {
  const { flags } = useFeatureFlags()
  console.log('All flags:', flags)

  return <div>...</div>
}
```

## API Reference

### useFeatureFlag(key, defaultValue?)

Returns:
- `isEnabled: boolean` - True if flag value is `true`
- `value: any` - The flag value (boolean, string, number, or object)
- `isLoading: boolean` - True while flags are being fetched

### useFeatureFlags()

Returns:
- `flags: Record<string, any>` - All flags as key-value map
- `isLoading: boolean` - True while loading
- `isEnabled(key): boolean` - Check if a boolean flag is enabled
- `getValue(key, default?): any` - Get flag value with optional default
- `refresh(): Promise<void>` - Refresh all flags from API

### FeatureGate

Props:
- `flag: string` - The flag key to check
- `children: ReactNode` - Content to show when enabled
- `fallback?: ReactNode` - Content to show when disabled (optional)
- `invert?: boolean` - Invert the check (show when disabled)

## Testing

### Mock flags in tests

```tsx
import { FeatureFlagsProvider } from '@/contexts/FeatureFlagsContext'

function TestWrapper({ children }) {
  return (
    <FeatureFlagsProvider initialFlags={{ stripe_payments: true }}>
      {children}
    </FeatureFlagsProvider>
  )
}
```

## Common Flags

Here are the initial feature flags available:

| Flag Key | Type | Description |
|----------|------|-------------|
| `stripe_payments` | boolean | Enable Stripe payment processing |
| `email_notifications` | boolean | Enable email notifications |
| `sms_notifications` | boolean | Enable SMS notifications |
| `advanced_analytics` | boolean | Premium analytics features |
| `calendar_sync` | boolean | CalDAV calendar integration |
| `api_webhooks` | boolean | Webhook functionality |
| `cloud_storage` | boolean | MinIO/R2 cloud storage |
| `messaging_enabled` | boolean | In-app messaging |
| `practice_rooms` | boolean | Practice room reservations |

## Learn More

- See [FeatureFlagExamples.tsx](./frontend/components/examples/FeatureFlagExamples.tsx) for live examples
- Visit `/dashboard/feature-flags` (admin only) to manage flags
- Read [KOTTSTER_INTEGRATION.md](./KOTTSTER_INTEGRATION.md) for backend details
