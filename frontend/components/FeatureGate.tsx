'use client'

import { ReactNode } from 'react'
import { useFeatureFlag } from '@/hooks/useFeatureFlag'

interface FeatureGateProps {
  flag: string
  children: ReactNode
  fallback?: ReactNode
  invert?: boolean
}

export function FeatureGate({ flag, children, fallback = null, invert = false }: FeatureGateProps) {
  const { isEnabled, isLoading } = useFeatureFlag(flag)

  if (isLoading) {
    return <>{fallback}</>
  }

  const shouldRender = invert ? !isEnabled : isEnabled

  return <>{shouldRender ? children : fallback}</>
}

interface FeatureValueProps<T = any> {
  flag: string
  defaultValue?: T
  children: (value: T) => ReactNode
}

export function FeatureValue<T = any>({ flag, defaultValue, children }: FeatureValueProps<T>) {
  const { value, isLoading } = useFeatureFlag(flag, defaultValue)

  if (isLoading) {
    return null
  }

  return <>{children(value)}</>
}
