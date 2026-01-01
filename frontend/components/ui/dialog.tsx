'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

// ============================================================================
// Types
// ============================================================================

export interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closeOnBackdrop?: boolean
  closeOnEsc?: boolean
}

export interface DialogHeaderProps {
  title: string
  showClose?: boolean
  className?: string
}

export interface DialogContentProps {
  children: React.ReactNode
  className?: string
}

export interface DialogFooterProps {
  children: React.ReactNode
  className?: string
}

// ============================================================================
// Size Mapping
// ============================================================================

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-full mx-4',
}

// ============================================================================
// Dialog Context (for accessing onOpenChange in child components)
// ============================================================================

interface DialogContextValue {
  onOpenChange: (open: boolean) => void
}

const DialogContext = React.createContext<DialogContextValue | null>(null)

// ============================================================================
// Dialog Component
// ============================================================================

export function Dialog({
  open,
  onOpenChange,
  children,
  size = 'md',
  closeOnBackdrop = true,
  closeOnEsc = true,
}: DialogProps) {
  const [mounted, setMounted] = React.useState(false)

  // Handle mounting for portal
  React.useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Handle ESC key
  React.useEffect(() => {
    if (!open || !closeOnEsc) return

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false)
      }
    }

    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [open, closeOnEsc, onOpenChange])

  // Lock body scroll when dialog is open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [open])

  if (!open || !mounted) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onOpenChange(false)
    }
  }

  const dialogContent = (
    <DialogContext.Provider value={{ onOpenChange }}>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={handleBackdropClick}
      >
        <div
          className={`
            relative w-full ${sizeClasses[size]}
            bg-white dark:bg-gray-800
            rounded-3xl shadow-2xl
            animate-in zoom-in-95 duration-200
            flex flex-col
            max-h-[90vh]
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </DialogContext.Provider>
  )

  return createPortal(dialogContent, document.body)
}

// ============================================================================
// DialogHeader Component
// ============================================================================

export function DialogHeader({ title, showClose = true, className = '' }: DialogHeaderProps) {
  const dialogContext = React.useContext(DialogContext)

  return (
    <div className={`relative px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-700 ${className}`}>
      <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">
        {title}
      </h2>
      {showClose && dialogContext?.onOpenChange && (
        <button
          onClick={() => dialogContext.onOpenChange(false)}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" />
        </button>
      )}
    </div>
  )
}

// ============================================================================
// DialogContent Component
// ============================================================================

export function DialogContent({ children, className = '' }: DialogContentProps) {
  return (
    <div className={`px-6 py-4 overflow-y-auto flex-1 ${className}`}>
      {children}
    </div>
  )
}

// ============================================================================
// DialogFooter Component
// ============================================================================

export function DialogFooter({ children, className = '' }: DialogFooterProps) {
  return (
    <div className={`px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex flex-col-reverse md:flex-row md:justify-end gap-2 md:gap-3 ${className}`}>
      {children}
    </div>
  )
}
