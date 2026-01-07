'use client'

import * as React from 'react'

// ============================================================================
// Types
// ============================================================================

export type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral'

export interface StatusBadgeProps {
  label: string
  variant?: StatusVariant
  showPulse?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

// ============================================================================
// Variant Configuration
// ============================================================================

const variantConfig = {
  success: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    border: 'border-emerald-100',
    dot: 'bg-emerald-500',
  },
  warning: {
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    border: 'border-amber-100',
    dot: 'bg-amber-500',
  },
  error: {
    bg: 'bg-red-50',
    text: 'text-red-600',
    border: 'border-red-100',
    dot: 'bg-red-500',
  },
  info: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-100',
    dot: 'bg-blue-500',
  },
  neutral: {
    bg: 'bg-gray-50',
    text: 'text-gray-600',
    border: 'border-gray-100',
    dot: 'bg-gray-500',
  },
}

const sizeConfig = {
  sm: {
    container: 'px-2 py-0.5 gap-1',
    text: 'text-[9px]',
    dot: 'w-1 h-1',
  },
  md: {
    container: 'px-2.5 py-1 gap-1.5',
    text: 'text-[10px]',
    dot: 'w-1.5 h-1.5',
  },
  lg: {
    container: 'px-3 py-1.5 gap-2',
    text: 'text-xs',
    dot: 'w-2 h-2',
  },
}

// ============================================================================
// StatusBadge Component
// ============================================================================

export function StatusBadge({
  label,
  variant = 'neutral',
  showPulse = false,
  size = 'md',
  className = '',
}: StatusBadgeProps) {
  const config = variantConfig[variant]
  const sizing = sizeConfig[size]

  return (
    <span
      className={`
        inline-flex items-center ${sizing.container} rounded-full
        ${sizing.text} font-bold uppercase tracking-wide
        ${config.bg} ${config.text} border ${config.border}
        ${className}
      `}
    >
      {showPulse && (
        <div
          className={`${sizing.dot} rounded-full ${config.dot} ${showPulse ? 'animate-pulse' : ''}`}
        />
      )}
      {label}
    </span>
  )
}

// ============================================================================
// Convenience Components
// ============================================================================

export function ActiveBadge({ className = '' }: { className?: string }) {
  return (
    <StatusBadge
      label="Active"
      variant="success"
      showPulse={true}
      className={className}
    />
  )
}

export function InactiveBadge({ className = '' }: { className?: string }) {
  return (
    <StatusBadge
      label="Inactive"
      variant="neutral"
      showPulse={false}
      className={className}
    />
  )
}

export function PendingBadge({ className = '' }: { className?: string }) {
  return (
    <StatusBadge
      label="Pending"
      variant="warning"
      showPulse={true}
      className={className}
    />
  )
}

export function ErrorBadge({ className = '' }: { className?: string }) {
  return (
    <StatusBadge
      label="Error"
      variant="error"
      showPulse={false}
      className={className}
    />
  )
}
