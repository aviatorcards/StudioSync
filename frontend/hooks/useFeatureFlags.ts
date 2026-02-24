import { useFeatureFlagContext } from '@/contexts/FeatureFlagContext'
import { FeatureFlags } from '@/types/setup'

/**
 * Hook to access feature flags from anywhere in the app.
 *
 * Usage:
 *   const { flags, isLoading } = useFeatureFlags()
 *   if (flags.billing_enabled) { ... }
 *
 *   // Or check a single flag:
 *   const { isEnabled } = useFeatureFlags('billing_enabled')
 */
export function useFeatureFlags(): { flags: FeatureFlags; isLoading: boolean; refresh: () => Promise<void> }
export function useFeatureFlags(flag: keyof FeatureFlags): { isEnabled: boolean; isLoading: boolean }
export function useFeatureFlags(flag?: keyof FeatureFlags) {
    const { flags, isLoading, refresh } = useFeatureFlagContext()

    if (flag !== undefined) {
        return { isEnabled: flags[flag], isLoading }
    }

    return { flags, isLoading, refresh }
}
