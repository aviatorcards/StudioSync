'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, RefreshCw, Download, ChevronDown, ChevronUp, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react'
import api from '@/services/api'
import { useUser } from '@/contexts/UserContext'
import { Button } from '@/components/ui/button'

interface UpdateInfo {
    current_version: string
    latest_version: string
    update_available: boolean
    release_notes: string | null
    download_url: string | null
    manifest_url: string
    error: string | null
}

type UpdateState = 'idle' | 'checking' | 'updating' | 'success' | 'error'

const DISMISSED_KEY = 'studiosync_update_dismissed'

export default function UpdateBanner() {
    const { currentUser } = useUser()
    const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null)
    const [updateState, setUpdateState] = useState<UpdateState>('idle')
    const [updateOutput, setUpdateOutput] = useState<string | null>(null)
    const [showNotes, setShowNotes] = useState(false)
    const [dismissed, setDismissed] = useState(false)

    // Only admins see this
    const isAdmin = currentUser?.role === 'admin'

    const checkForUpdates = useCallback(async () => {
        if (!isAdmin) return
        try {
            setUpdateState('checking')
            const res = await api.get('/system/update/status/')
            setUpdateInfo(res.data)
        } catch {
            // Silently ignore — update checks are non-critical
        } finally {
            setUpdateState('idle')
        }
    }, [isAdmin])

    useEffect(() => {
        if (!isAdmin) return
        // Check on mount, then every hour
        checkForUpdates()
        const interval = setInterval(checkForUpdates, 60 * 60 * 1000)
        return () => clearInterval(interval)
    }, [isAdmin, checkForUpdates])

    // Reset dismissal when a new version is detected
    useEffect(() => {
        if (!updateInfo?.update_available) return
        const lastDismissed = localStorage.getItem(DISMISSED_KEY)
        if (lastDismissed === updateInfo.latest_version) {
            setDismissed(true)
        } else {
            setDismissed(false)
        }
    }, [updateInfo?.latest_version, updateInfo?.update_available])

    const handleDismiss = () => {
        if (updateInfo?.latest_version) {
            localStorage.setItem(DISMISSED_KEY, updateInfo.latest_version)
        }
        setDismissed(true)
    }

    const handleUpdate = async () => {
        if (!window.confirm(
            `This will update StudioSync to v${updateInfo?.latest_version} and restart the server.\n\nThe app may be briefly unavailable. Continue?`
        )) return

        setUpdateState('updating')
        setUpdateOutput(null)

        try {
            const res = await api.post('/system/update/perform/')
            setUpdateOutput(res.data.output || null)
            if (res.data.success) {
                setUpdateState('success')
                // Refresh update info after a short delay so the banner re-evaluates
                setTimeout(checkForUpdates, 3000)
            } else {
                setUpdateState('error')
            }
        } catch (err: any) {
            const msg = err?.response?.data?.output || err?.response?.data?.detail || String(err)
            setUpdateOutput(msg)
            setUpdateState('error')
        }
    }

    // Don't render anything if not admin, no update, or dismissed
    if (!isAdmin || !updateInfo?.update_available || dismissed) return null

    const isWorking = updateState === 'updating'

    return (
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-4 py-3 relative z-30">
            <div className="max-w-screen-xl mx-auto">
                {/* Main row */}
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <RefreshCw className="w-4 h-4 flex-shrink-0 opacity-80" />
                        <span className="text-sm font-medium truncate">
                            StudioSync{' '}
                            <span className="font-bold">v{updateInfo.latest_version}</span>{' '}
                            is available
                            <span className="hidden sm:inline text-indigo-200 ml-1">
                                — you're on v{updateInfo.current_version}
                            </span>
                        </span>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Release notes toggle */}
                        {updateInfo.release_notes && (
                            <button
                                onClick={() => setShowNotes(n => !n)}
                                className="text-xs text-indigo-200 hover:text-white underline underline-offset-2 flex items-center gap-0.5 transition-colors"
                            >
                                {showNotes ? 'Hide' : 'What\'s new'}
                                {showNotes ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                        )}

                        {/* External download link (shown alongside the update button) */}
                        {updateInfo.download_url && (
                            <a
                                href={updateInfo.download_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-indigo-200 hover:text-white flex items-center gap-1 transition-colors"
                                title="View release on GitHub"
                            >
                                <Download className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Release</span>
                            </a>
                        )}

                        {/* One-click update */}
                        {updateState === 'success' ? (
                            <span className="flex items-center gap-1 text-xs font-semibold text-green-300">
                                <CheckCircle2 className="w-4 h-4" />
                                Updated!
                            </span>
                        ) : updateState === 'error' ? (
                            <span className="flex items-center gap-1 text-xs font-semibold text-red-300">
                                <AlertTriangle className="w-4 h-4" />
                                Failed — see output below
                            </span>
                        ) : (
                            <Button
                                size="sm"
                                onClick={handleUpdate}
                                disabled={isWorking}
                                className="bg-white text-indigo-700 hover:bg-indigo-50 font-semibold text-xs h-7 px-3 shadow-sm disabled:opacity-60"
                            >
                                {isWorking ? (
                                    <>
                                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                        Updating…
                                    </>
                                ) : (
                                    'Update now'
                                )}
                            </Button>
                        )}

                        {/* Dismiss */}
                        {!isWorking && updateState !== 'success' && (
                            <button
                                onClick={handleDismiss}
                                className="text-indigo-200 hover:text-white transition-colors ml-1"
                                title="Dismiss"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Release notes (collapsible) */}
                {showNotes && updateInfo.release_notes && (
                    <div className="mt-3 text-sm text-indigo-100 bg-indigo-800/40 rounded-lg px-4 py-3 whitespace-pre-wrap leading-relaxed border border-indigo-500/30">
                        {updateInfo.release_notes}
                    </div>
                )}

                {/* Update output (shown after attempt) */}
                {updateOutput && (
                    <div className={`mt-3 text-xs font-mono rounded-lg px-4 py-3 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto border ${
                        updateState === 'error'
                            ? 'bg-red-900/40 text-red-200 border-red-500/30'
                            : 'bg-indigo-800/40 text-indigo-100 border-indigo-500/30'
                    }`}>
                        {updateOutput}
                    </div>
                )}
            </div>
        </div>
    )
}
