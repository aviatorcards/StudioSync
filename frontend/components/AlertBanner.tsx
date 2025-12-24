interface AlertBannerProps {
    type: 'info' | 'warning' | 'error' | 'success'
    message: string
    actionLabel?: string
    onAction?: () => void
    onDismiss?: () => void
}

export default function AlertBanner({ type, message, actionLabel, onAction, onDismiss }: AlertBannerProps) {
    const styles = {
        info: 'bg-blue-50 border-blue-500 text-blue-900',
        warning: 'bg-yellow-50 border-yellow-500 text-yellow-900',
        error: 'bg-red-50 border-red-500 text-red-900',
        success: 'bg-green-50 border-green-500 text-green-900',
    }

    const icons = {
        info: 'ℹ️',
        warning: '⚠️',
        error: '🔴',
        success: '✅',
    }

    return (
        <div className={`px-6 py-4 border-l-4 rounded-r-lg ${styles[type]} flex items-center justify-between`}>
            <div className="flex items-center space-x-3">
                <span className="text-2xl">{icons[type]}</span>
                <p className="font-medium">{message}</p>
            </div>
            <div className="flex items-center space-x-2">
                {actionLabel && onAction && (
                    <button
                        onClick={onAction}
                        className="px-4 py-1 bg-white/80 hover:bg-white rounded font-medium text-sm transition-colors"
                    >
                        {actionLabel}
                    </button>
                )}
                {onDismiss && (
                    <button
                        onClick={onDismiss}
                        className="p-1 hover:bg-white/50 rounded transition-colors"
                    >
                        ✕
                    </button>
                )}
            </div>
        </div>
    )
}
