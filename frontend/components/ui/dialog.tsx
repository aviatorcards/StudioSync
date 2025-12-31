'use client'

import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

// ============================================================================
// Types
// ============================================================================

interface DialogContextValue {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closeOnBackdrop?: boolean
  closeOnEsc?: boolean
}

interface DialogHeaderProps {
  title: string
  subtitle?: string
  onClose?: () => void
  showClose?: boolean
  className?: string
}

interface DialogContentProps {
  children: React.ReactNode
  className?: string
}

interface DialogFooterProps {
  children: React.ReactNode
  className?: string
}

interface DialogCloseProps {
  onClick?: () => void
  className?: string
}

// ============================================================================
// Context
// ============================================================================

const DialogContext = React.createContext<DialogContextValue | undefined>(undefined)

function useDialogContext() {
  const context = React.useContext(DialogContext)
  if (!context) {
    throw new Error('Dialog components must be used within a Dialog')
  }
  return context
}

// ============================================================================
// Size Variants
// ============================================================================

const sizeClasses = {
  sm: 'max-w-[95vw] md:max-w-md',
  md: 'max-w-[95vw] md:max-w-2xl',
  lg: 'max-w-[95vw] md:max-w-4xl',
  xl: 'max-w-[95vw] md:max-w-6xl',
}

// ============================================================================
// Dialog Root Component
// ============================================================================

export function Dialog({
  open,
  onOpenChange,
  children,
  size = 'md',
  closeOnBackdrop = true,
  closeOnEsc = true,
}: DialogProps) {
  const contentRef = React.useRef<HTMLDivElement>(null)
  const previousActiveElement = React.useRef<HTMLElement | null>(null)

  // ESC key handler
  React.useEffect(() => {
    if (!open || !closeOnEsc) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, closeOnEsc, onOpenChange])

  // Focus management
  React.useEffect(() => {
    if (open) {
      // Store the currently focused element
      previousActiveElement.current = document.activeElement as HTMLElement

      // Focus the dialog content
      setTimeout(() => {
        const firstFocusable = contentRef.current?.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        firstFocusable?.focus()
      }, 100)
    } else {
      // Return focus to the previous element
      previousActiveElement.current?.focus()
    }
  }, [open])

  // Focus trap
  React.useEffect(() => {
    if (!open) return

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !contentRef.current) return

      const focusableElements = contentRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    document.addEventListener('keydown', handleTabKey)
    return () => document.removeEventListener('keydown', handleTabKey)
  }, [open])

  // Body scroll lock
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  const handleBackdropClick = () => {
    if (closeOnBackdrop) {
      onOpenChange(false)
    }
  }

  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
      >
        <div
          ref={contentRef}
          className={cn(
            'bg-background w-full rounded-xl md:rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300',
            sizeClasses[size]
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </DialogContext.Provider>
  )
}

// ============================================================================
// DialogHeader Component
// ============================================================================

export function DialogHeader({
  title,
  subtitle,
  onClose,
  showClose = true,
  className,
}: DialogHeaderProps) {
  const { onOpenChange } = useDialogContext()

  const handleClose = () => {
    if (onClose) {
      onClose()
    } else {
      onOpenChange(false)
    }
  }

  return (
    <div
      className={cn(
        'bg-primary-dark px-4 md:px-8 py-4 md:py-6 flex items-center justify-between text-white',
        className
      )}
      style={{
        backgroundColor: 'var(--color-primary-dark)',
      }}
    >
      <div className="flex-1 min-w-0">
        <h2 className="text-lg md:text-2xl font-black tracking-tight truncate" id="dialog-title">
          {title}
        </h2>
        {subtitle && (
          <p className="text-white/60 text-[10px] md:text-xs font-bold uppercase tracking-widest mt-0.5 md:mt-1">
            {subtitle}
          </p>
        )}
      </div>
      {showClose && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="bg-white/10 hover:bg-white/20 text-white shadow-none ml-2 md:ml-4 flex-shrink-0 h-10 w-10 md:h-11 md:w-11 active:scale-95"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5 md:w-6 md:h-6" />
        </Button>
      )}
    </div>
  )
}

// ============================================================================
// DialogContent Component
// ============================================================================

export function DialogContent({ children, className }: DialogContentProps) {
  return (
    <div
      className={cn(
        'p-4 md:p-8 max-h-[70vh] md:max-h-[80vh] overflow-y-auto custom-scrollbar',
        className
      )}
      id="dialog-description"
    >
      {children}
    </div>
  )
}

// ============================================================================
// DialogFooter Component
// ============================================================================

export function DialogFooter({ children, className }: DialogFooterProps) {
  return (
    <div
      className={cn(
        'p-4 md:p-6 border-t border-gray-100 bg-gray-50 dark:bg-gray-900 dark:border-gray-800 flex flex-col md:flex-row gap-2 md:gap-3 md:justify-end',
        className
      )}
    >
      {children}
    </div>
  )
}

// ============================================================================
// DialogClose Component
// ============================================================================

export function DialogClose({ onClick, className }: DialogCloseProps) {
  const { onOpenChange } = useDialogContext()

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      onOpenChange(false)
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleClick}
      className={className}
    >
      Cancel
    </Button>
  )
}

// ============================================================================
// Export All
// ============================================================================

export { type DialogProps, type DialogHeaderProps, type DialogContentProps, type DialogFooterProps }
