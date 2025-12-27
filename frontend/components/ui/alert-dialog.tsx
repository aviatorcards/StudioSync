'use client'

import * as React from 'react'
import { CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react'
import { Dialog, DialogHeader, DialogContent, DialogFooter } from './dialog'
import { Button } from './button'

// ============================================================================
// Types
// ============================================================================

export type AlertVariant = 'success' | 'error' | 'warning' | 'info'

export interface AlertDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  message: string
  variant?: AlertVariant
  actionText?: string
  onAction?: () => void
  autoClose?: number // Auto-close after N milliseconds
}

// ============================================================================
// Icon & Color Mapping
// ============================================================================

const variantConfig = {
  success: {
    icon: CheckCircle2,
    iconColor: 'text-success',
    bgColor: 'bg-success/10',
  },
  error: {
    icon: XCircle,
    iconColor: 'text-destructive',
    bgColor: 'bg-destructive/10',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-warning',
    bgColor: 'bg-warning/10',
  },
  info: {
    icon: Info,
    iconColor: 'text-primary',
    bgColor: 'bg-primary/10',
  },
}

// ============================================================================
// AlertDialog Component
// ============================================================================

export function AlertDialog({
  open,
  onOpenChange,
  title,
  message,
  variant = 'info',
  actionText = 'OK',
  onAction,
  autoClose,
}: AlertDialogProps) {
  const handleAction = () => {
    if (onAction) {
      onAction()
    }
    onOpenChange(false)
  }

  // Auto-close functionality
  React.useEffect(() => {
    if (open && autoClose) {
      const timer = setTimeout(() => {
        onOpenChange(false)
      }, autoClose)

      return () => clearTimeout(timer)
    }
  }, [open, autoClose, onOpenChange])

  const config = variantConfig[variant]
  const Icon = config.icon

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      size="sm"
      closeOnBackdrop={true}
      closeOnEsc={true}
    >
      <DialogHeader title={title} />
      <DialogContent>
        <div className="flex items-start gap-4">
          <div className={`flex-shrink-0 w-12 h-12 rounded-full ${config.bgColor} flex items-center justify-center`}>
            <Icon className={`w-6 h-6 ${config.iconColor}`} />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {message}
            </p>
          </div>
        </div>
      </DialogContent>
      <DialogFooter>
        <Button
          variant={variant === 'error' ? 'destructive' : variant === 'success' ? 'success' : 'default'}
          onClick={handleAction}
          className="min-w-[100px]"
        >
          {actionText}
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
