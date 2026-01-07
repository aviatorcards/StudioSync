'use client'

import * as React from 'react'
import { AlertTriangle } from 'lucide-react'
import { Dialog, DialogHeader, DialogContent, DialogFooter } from './dialog'
import { Button } from './button'

// ============================================================================
// Types
// ============================================================================

export interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
  onConfirm: () => void | Promise<void>
  onCancel?: () => void
  loading?: boolean
}

// ============================================================================
// ConfirmDialog Component
// ============================================================================

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) {
  const [isProcessing, setIsProcessing] = React.useState(false)

  const handleConfirm = async () => {
    setIsProcessing(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } catch (error) {
      console.error('Confirm action failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    }
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      size="sm"
      closeOnBackdrop={!isProcessing && !loading}
      closeOnEsc={!isProcessing && !loading}
    >
      <DialogHeader
        title={title}
        showClose={!isProcessing && !loading}
      />
      <DialogContent>
        <div className="flex items-start gap-4">
          {variant === 'destructive' && (
            <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-destructive" />
            </div>
          )}
          <div className="flex-1">
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
              {message}
            </p>
          </div>
        </div>
      </DialogContent>
      <DialogFooter>
        <Button
          variant="outline"
          onClick={handleCancel}
          disabled={isProcessing || loading}
          className="flex-1 md:flex-initial"
        >
          {cancelText}
        </Button>
        <Button
          variant={variant === 'destructive' ? 'destructive' : 'default'}
          onClick={handleConfirm}
          disabled={isProcessing || loading}
          className="flex-1 md:flex-initial"
        >
          {isProcessing || loading ? 'Processing...' : confirmText}
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
