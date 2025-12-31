import { useFeatureFlags } from '@/contexts/FeatureFlagsContext'

export function useFeatureFlag(key: string, defaultValue: any = false) {
  const { flags, isLoading, isEnabled, getValue } = useFeatureFlags()

  return {
    isEnabled: isEnabled(key),
    value: getValue(key, defaultValue),
    isLoading,
  }
}
