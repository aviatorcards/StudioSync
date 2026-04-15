'use client'

import { useState, useEffect, useRef } from 'react'
import {
    ListMusic, Plus, Loader2, ChevronRight, Calendar, MapPin,
    MessageSquare, CheckCircle2, Send, ThumbsUp, Trash, X,
    Music, FileText, Video, Image as ImageIcon, Link as LinkIcon,
    File, Clock, Sparkles, Users as UsersIcon,
    ChevronDown, Edit3, Check, Coffee, Mic, PauseCircle
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Dialog, DialogHeader, DialogContent, DialogFooter } from '@/components/ui/dialog'
import {
    getSetlists, getSetlist, createSetlist, updateSetlist, deleteSetlist,
    addSetlistItem, removeSetlistItem, reorderSetlist,
    addSetlistComment, approveSetlist, revokeSetlistApproval
} from '@/services/api'
import { useUser } from '@/contexts/UserContext'
import { proxyFileUrl } from '@/lib/utils'

// Types
interface SetlistItem {
    id: string
    order: number
    title: string
    artist: string
    item_type: 'song' | 'break'
    duration_minutes: number | null
    notes: string
    resource: {
        id: string
        title: string
        description: string
        resource_type: string
        composer: string
        key_signature: string
        tempo: string
        file_url: string | null
        external_url: string | null
    } | null
}

interface SetlistComment {
    id: string
    user: string
    user_name: string
    user_initials: string
    text: string
    is_approval: boolean
    created_at: string
}

interface Setlist {
    id: string
    name: string
    description: string
    status: 'draft' | 'proposed' | 'confirmed' | 'archived'
    event_date: string | null
    venue: string
    band: string | null
    band_name: string | null
    created_by_name: string
    created_at: string
    updated_at: string
    resources: SetlistItem[]
    comments: SetlistComment[]
    approval_count: number
    total_members: number
    approved_by: { user_id: string; user_name: string; user_initials: string }[]
}

interface BandSetlistsProps {
    bandId: string
    bandName: string
}

const STATUS_CONFIG = {
    draft: { label: 'Draft', color: 'bg-gray-100 text-gray-600 border-gray-200', dot: 'bg-gray-400' },
    proposed: { label: 'Proposed', color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-400' },
    confirmed: { label: 'Confirmed', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-400' },
    archived: { label: 'Archived', color: 'bg-slate-100 text-slate-500 border-slate-200', dot: 'bg-slate-400' },
}

export default function BandSetlists({ bandId, bandName }: BandSetlistsProps) {
    const { currentUser } = useUser()
    const [setlists, setSetlists] = useState<Setlist[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedSetlist, setSelectedSetlist] = useState<Setlist | null>(null)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [creating, setCreating] = useState(false)
    const [commentText, setCommentText] = useState('')
    const [sendingComment, setSendingComment] = useState(false)
    const [approving, setApproving] = useState(false)

    // Quick-add song form
    const [showAddForm, setShowAddForm] = useState(false)
    const [addingItem, setAddingItem] = useState(false)
    const [songForm, setSongForm] = useState({ title: '', artist: '', notes: '' })
    const songTitleRef = useRef<HTMLInputElement>(null)

    // Create form
    const [createForm, setCreateForm] = useState({
        name: '',
        description: '',
        venue: '',
        event_date: '',
        status: 'draft' as string,
    })

    const fetchSetlists = async () => {
        try {
            const res = await getSetlists(bandId)
            setSetlists(res.data.results || res.data || [])
        } catch (error) {
            console.error('Failed to fetch setlists:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchSetlistDetail = async (setlistId: string) => {
        try {
            const res = await getSetlist(setlistId)
            setSelectedSetlist(res.data)
        } catch (error) {
            console.error('Failed to fetch setlist:', error)
        }
    }

    useEffect(() => {
        fetchSetlists()
    }, [bandId])

    // Focus the title input when the add form opens
    useEffect(() => {
        if (showAddForm && songTitleRef.current) {
            setTimeout(() => songTitleRef.current?.focus(), 100)
        }
    }, [showAddForm])

    const handleCreateSetlist = async () => {
        if (!createForm.name.trim()) {
            toast.error('Setlist name is required')
            return
        }

        setCreating(true)
        try {
            const payload: any = {
                name: createForm.name,
                description: createForm.description,
                band: bandId,
                status: createForm.status,
                venue: createForm.venue,
            }
            if (createForm.event_date) {
                payload.event_date = new Date(createForm.event_date).toISOString()
            }

            await createSetlist(payload)
            toast.success('Setlist created!')
            setShowCreateModal(false)
            setCreateForm({ name: '', description: '', venue: '', event_date: '', status: 'draft' })
            fetchSetlists()
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Failed to create setlist')
        } finally {
            setCreating(false)
        }
    }

    const handleDeleteSetlist = async (setlistId: string) => {
        if (!confirm('Delete this setlist? This cannot be undone.')) return

        try {
            await deleteSetlist(setlistId)
            toast.success('Setlist deleted')
            if (selectedSetlist?.id === setlistId) setSelectedSetlist(null)
            fetchSetlists()
        } catch (error) {
            toast.error('Failed to delete setlist')
        }
    }

    const handleStatusChange = async (setlistId: string, newStatus: string) => {
        try {
            await updateSetlist(setlistId, { status: newStatus })
            toast.success(`Status updated to ${newStatus}`)
            fetchSetlists()
            if (selectedSetlist?.id === setlistId) fetchSetlistDetail(setlistId)
        } catch (error) {
            toast.error('Failed to update status')
        }
    }

    // ==== Add Song / Break ====

    const handleAddSong = async () => {
        if (!selectedSetlist || !songForm.title.trim()) {
            toast.error('Song title is required')
            return
        }

        setAddingItem(true)
        try {
            await addSetlistItem(selectedSetlist.id, {
                title: songForm.title,
                artist: songForm.artist,
                notes: songForm.notes,
                item_type: 'song',
            })
            toast.success('Song added!')
            setSongForm({ title: '', artist: '', notes: '' })
            fetchSetlistDetail(selectedSetlist.id)
            // Keep form open for quick successive adds
            songTitleRef.current?.focus()
        } catch (error) {
            toast.error('Failed to add song')
        } finally {
            setAddingItem(false)
        }
    }

    const handleAddBreak = async (label?: string) => {
        if (!selectedSetlist) return

        setAddingItem(true)
        try {
            await addSetlistItem(selectedSetlist.id, {
                title: label || 'Break',
                item_type: 'break',
            })
            toast.success('Break added!')
            fetchSetlistDetail(selectedSetlist.id)
        } catch (error) {
            toast.error('Failed to add break')
        } finally {
            setAddingItem(false)
        }
    }

    const handleRemoveItem = async (itemId: string) => {
        if (!selectedSetlist) return

        try {
            await removeSetlistItem(selectedSetlist.id, itemId)
            toast.success('Item removed')
            fetchSetlistDetail(selectedSetlist.id)
        } catch (error) {
            toast.error('Failed to remove item')
        }
    }

    const handleMoveItem = async (index: number, direction: 'up' | 'down') => {
        if (!selectedSetlist) return

        const items = [...selectedSetlist.resources]
        const swapIdx = direction === 'up' ? index - 1 : index + 1
        if (swapIdx < 0 || swapIdx >= items.length) return

        const temp = items[index]
        items[index] = items[swapIdx]
        items[swapIdx] = temp

        const itemIds = items.map(i => i.id)
        try {
            await reorderSetlist(selectedSetlist.id, itemIds)
            fetchSetlistDetail(selectedSetlist.id)
        } catch (error) {
            toast.error('Failed to reorder')
        }
    }

    const handleSendComment = async () => {
        if (!selectedSetlist || !commentText.trim()) return

        setSendingComment(true)
        try {
            await addSetlistComment(selectedSetlist.id, commentText)
            setCommentText('')
            fetchSetlistDetail(selectedSetlist.id)
            toast.success('Comment posted')
        } catch (error) {
            toast.error('Failed to post comment')
        } finally {
            setSendingComment(false)
        }
    }

    const handleApprove = async () => {
        if (!selectedSetlist) return

        setApproving(true)
        try {
            await approveSetlist(selectedSetlist.id)
            toast.success('Setlist approved! 🎸')
            fetchSetlistDetail(selectedSetlist.id)
            fetchSetlists()
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to approve')
        } finally {
            setApproving(false)
        }
    }

    const handleRevokeApproval = async () => {
        if (!selectedSetlist) return

        try {
            await revokeSetlistApproval(selectedSetlist.id)
            toast.success('Approval revoked')
            fetchSetlistDetail(selectedSetlist.id)
            fetchSetlists()
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to revoke')
        }
    }

    const userHasApproved = selectedSetlist?.approved_by?.some(
        a => a.user_id === currentUser?.id
    )

    // Compute total set duration
    const totalDuration = selectedSetlist?.resources.reduce((sum, item) => {
        return sum + (item.duration_minutes || 0)
    }, 0) || 0

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
        )
    }

    // ==============================================================
    // DETAIL VIEW
    // ==============================================================
    if (selectedSetlist) {
        const statusConf = STATUS_CONFIG[selectedSetlist.status]
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Back button */}
                <button
                    onClick={() => setSelectedSetlist(null)}
                    className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors group"
                >
                    <ChevronRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                    All Setlists
                </button>

                {/* Setlist Header */}
                <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 md:p-10 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="space-y-3 flex-1">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h2 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight uppercase">
                                    {selectedSetlist.name}
                                </h2>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusConf.color}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${statusConf.dot}`} />
                                    {statusConf.label}
                                </span>
                            </div>
                            {selectedSetlist.description && (
                                <p className="text-sm font-medium text-gray-500 max-w-2xl">{selectedSetlist.description}</p>
                            )}
                            <div className="flex items-center gap-6 text-xs font-bold text-gray-400 uppercase tracking-widest flex-wrap">
                                {selectedSetlist.venue && (
                                    <span className="flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5" />
                                        {selectedSetlist.venue}
                                    </span>
                                )}
                                {selectedSetlist.event_date && (
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {new Date(selectedSetlist.event_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                )}
                                <span className="flex items-center gap-1.5">
                                    <Music className="w-3.5 h-3.5" />
                                    {selectedSetlist.resources.filter(r => r.item_type === 'song').length} Songs
                                </span>
                                {totalDuration > 0 && (
                                    <span className="flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5" />
                                        ~{totalDuration} min
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Status Controls */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                            {selectedSetlist.status === 'draft' && (
                                <Button
                                    onClick={() => handleStatusChange(selectedSetlist.id, 'proposed')}
                                    className="gap-2 text-[10px] font-black uppercase tracking-widest py-5 px-6 bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/20"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                    Propose to Band
                                </Button>
                            )}
                            {selectedSetlist.status === 'proposed' && !userHasApproved && (
                                <Button
                                    onClick={handleApprove}
                                    disabled={approving}
                                    className="gap-2 text-[10px] font-black uppercase tracking-widest py-5 px-6 bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"
                                >
                                    {approving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ThumbsUp className="w-3.5 h-3.5" />}
                                    Approve
                                </Button>
                            )}
                            {userHasApproved && selectedSetlist.status !== 'confirmed' && (
                                <Button
                                    variant="ghost"
                                    onClick={handleRevokeApproval}
                                    className="gap-2 text-[10px] font-black uppercase tracking-widest py-5 px-6 text-gray-500 hover:text-red-500"
                                >
                                    <X className="w-3.5 h-3.5" />
                                    Revoke
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Approval Progress */}
                    {selectedSetlist.total_members > 0 && (selectedSetlist.status === 'proposed' || selectedSetlist.status === 'confirmed') && (
                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    Member Approvals
                                </span>
                                <span className="text-xs font-black text-gray-900">
                                    {selectedSetlist.approval_count} / {selectedSetlist.total_members}
                                </span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-700 ease-out ${
                                        selectedSetlist.approval_count >= selectedSetlist.total_members
                                            ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                                            : 'bg-gradient-to-r from-amber-400 to-amber-500'
                                    }`}
                                    style={{ width: `${Math.min(100, (selectedSetlist.approval_count / selectedSetlist.total_members) * 100)}%` }}
                                />
                            </div>
                            {selectedSetlist.approved_by.length > 0 && (
                                <div className="flex items-center gap-2 mt-3">
                                    {selectedSetlist.approved_by.map(member => (
                                        <div
                                            key={member.user_id}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-100"
                                            title={member.user_name}
                                        >
                                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">
                                                {member.user_initials}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Set Order */}
                <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight flex items-center gap-3">
                            <ListMusic className="w-5 h-5 text-primary" />
                            Set Order
                        </h3>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleAddBreak()}
                                className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 transition-all"
                            >
                                <Coffee className="w-3.5 h-3.5" />
                                Add Break
                            </button>
                            <Button
                                onClick={() => setShowAddForm(!showAddForm)}
                                size="sm"
                                className={`gap-2 text-[10px] font-black uppercase tracking-widest rounded-xl py-4 px-5 ${
                                    showAddForm ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 shadow-none' : ''
                                }`}
                            >
                                {showAddForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                                {showAddForm ? 'Close' : 'Add Song'}
                            </Button>
                        </div>
                    </div>

                    {/* Quick Add Song Form */}
                    {showAddForm && (
                        <div className="mb-6 p-5 bg-primary/[0.03] border-2 border-primary/10 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="flex-[2]">
                                    <input
                                        ref={songTitleRef}
                                        type="text"
                                        value={songForm.title}
                                        onChange={e => setSongForm(p => ({ ...p, title: e.target.value }))}
                                        placeholder="Song title *"
                                        className="w-full px-4 py-3 bg-white border-2 border-transparent focus:border-primary rounded-xl outline-none font-bold text-sm text-gray-900 transition-all placeholder:text-gray-300"
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') handleAddSong()
                                        }}
                                    />
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={songForm.artist}
                                        onChange={e => setSongForm(p => ({ ...p, artist: e.target.value }))}
                                        placeholder="Artist"
                                        className="w-full px-4 py-3 bg-white border-2 border-transparent focus:border-primary rounded-xl outline-none font-bold text-sm text-gray-900 transition-all placeholder:text-gray-300"
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') handleAddSong()
                                        }}
                                    />
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={songForm.notes}
                                        onChange={e => setSongForm(p => ({ ...p, notes: e.target.value }))}
                                        placeholder="Notes (key, tempo, capo...)"
                                        className="w-full px-4 py-3 bg-white border-2 border-transparent focus:border-primary rounded-xl outline-none font-bold text-sm text-gray-900 transition-all placeholder:text-gray-300"
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') handleAddSong()
                                        }}
                                    />
                                </div>
                                <Button
                                    onClick={handleAddSong}
                                    disabled={addingItem || !songForm.title.trim()}
                                    className="px-6 gap-2 rounded-xl"
                                >
                                    {addingItem ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Plus className="w-4 h-4" />
                                    )}
                                    Add
                                </Button>
                            </div>
                            <p className="text-[10px] font-bold text-gray-400 mt-2.5 pl-1">
                                Press Enter to add quickly. The form stays open for rapid entry.
                            </p>
                        </div>
                    )}

                    {/* Song / Break List */}
                    {selectedSetlist.resources.length > 0 ? (
                        <div className="space-y-2">
                            {selectedSetlist.resources.map((item, index) => (
                                item.item_type === 'break' ? (
                                    // Break item
                                    <div
                                        key={item.id}
                                        className="flex items-center gap-4 py-3 px-4 group"
                                    >
                                        <span className="text-lg font-black text-gray-200 w-8 text-center tabular-nums">
                                            {index + 1}
                                        </span>
                                        <div className="flex-1 flex items-center gap-3 border-t border-b border-dashed border-gray-200 py-2">
                                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                                <PauseCircle className="w-4 h-4 text-gray-400" />
                                            </div>
                                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                                                {item.title || 'Break'}
                                            </span>
                                            {item.notes && (
                                                <span className="text-[10px] font-medium text-gray-400 italic">— {item.notes}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleMoveItem(index, 'up')}
                                                disabled={index === 0}
                                                className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-30"
                                            >
                                                <ChevronDown className="w-4 h-4 rotate-180" />
                                            </button>
                                            <button
                                                onClick={() => handleMoveItem(index, 'down')}
                                                disabled={index === selectedSetlist.resources.length - 1}
                                                className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-30"
                                            >
                                                <ChevronDown className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleRemoveItem(item.id)}
                                                className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <Trash className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    // Song item
                                    <div
                                        key={item.id}
                                        className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-all group"
                                    >
                                        <span className="text-lg font-black text-gray-200 w-8 text-center tabular-nums">
                                            {index + 1}
                                        </span>
                                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center border border-gray-100">
                                            {item.resource ? (
                                                <FileText className="w-4 h-4 text-orange-500" />
                                            ) : (
                                                <Music className="w-4 h-4 text-primary" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-black text-gray-900 tracking-tight truncate">
                                                {item.title || item.resource?.title || 'Untitled'}
                                            </div>
                                            <div className="flex items-center gap-3 text-[11px] font-semibold text-gray-400 tracking-wide mt-0.5 flex-wrap">
                                                {item.artist && (
                                                    <span>{item.artist}</span>
                                                )}
                                                {item.notes && (
                                                    <span className="text-primary">{item.notes}</span>
                                                )}
                                                {item.duration_minutes && (
                                                    <span>{item.duration_minutes} min</span>
                                                )}
                                                {item.resource && (() => {
                                                    const url = item.resource.file_url
                                                        ? proxyFileUrl(item.resource.file_url)
                                                        : item.resource.external_url
                                                    return url ? (
                                                        <a
                                                            href={url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            onClick={e => e.stopPropagation()}
                                                            className="flex items-center gap-1 text-orange-500 hover:text-orange-600 hover:underline underline-offset-2 transition-colors cursor-pointer"
                                                        >
                                                            <FileText className="w-3 h-3" />
                                                            Chart linked
                                                        </a>
                                                    ) : (
                                                        <span className="flex items-center gap-1 text-orange-500">
                                                            <FileText className="w-3 h-3" />
                                                            Chart linked
                                                        </span>
                                                    )
                                                })()}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleMoveItem(index, 'up')}
                                                disabled={index === 0}
                                                className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-30"
                                            >
                                                <ChevronDown className="w-4 h-4 rotate-180" />
                                            </button>
                                            <button
                                                onClick={() => handleMoveItem(index, 'down')}
                                                disabled={index === selectedSetlist.resources.length - 1}
                                                className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-30"
                                            >
                                                <ChevronDown className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleRemoveItem(item.id)}
                                                className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <Trash className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-gray-200">
                                <ListMusic className="w-8 h-8 text-gray-200" />
                            </div>
                            <p className="text-sm font-black text-gray-900 uppercase tracking-tighter mb-1">No Songs Yet</p>
                            <p className="text-xs font-medium text-gray-400 mb-4">
                                Click &quot;Add Song&quot; to start building your set
                            </p>
                            <Button
                                onClick={() => setShowAddForm(true)}
                                size="sm"
                                className="gap-2 rounded-xl"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Add Your First Song
                            </Button>
                        </div>
                    )}

                    {/* Quick break presets */}
                    {selectedSetlist.resources.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest mr-2">Quick add:</span>
                            {[
                                { label: 'Intermission', icon: <Coffee className="w-3 h-3" /> },
                                { label: 'Tuning Break', icon: <Music className="w-3 h-3" /> },
                                { label: 'Band Intro', icon: <Mic className="w-3 h-3" /> },
                            ].map(preset => (
                                <button
                                    key={preset.label}
                                    onClick={() => handleAddBreak(preset.label)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-[10px] font-bold text-gray-500 transition-all"
                                >
                                    {preset.icon}
                                    {preset.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Comments Section */}
                <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight flex items-center gap-3 mb-6">
                        <MessageSquare className="w-5 h-5 text-primary" />
                        Discussion
                        {selectedSetlist.comments.length > 0 && (
                            <span className="bg-gray-100 text-gray-500 text-[10px] font-black px-2.5 py-1 rounded-full">
                                {selectedSetlist.comments.length}
                            </span>
                        )}
                    </h3>

                    {/* Comment Thread */}
                    <div className="space-y-4 mb-6">
                        {selectedSetlist.comments.length > 0 ? (
                            selectedSetlist.comments.map(comment => (
                                <div
                                    key={comment.id}
                                    className={`flex gap-4 p-4 rounded-2xl transition-colors ${
                                        comment.is_approval
                                            ? 'bg-emerald-50/50 border border-emerald-100'
                                            : 'bg-gray-50/50 border border-gray-100'
                                    }`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-black ${
                                        comment.is_approval
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                                    }`}>
                                        {comment.is_approval ? <Check className="w-4 h-4" /> : comment.user_initials}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-black text-gray-900 uppercase tracking-wider">
                                                {comment.user_name}
                                            </span>
                                            {comment.is_approval && (
                                                <span className="text-[9px] font-black text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-widest">
                                                    Approved
                                                </span>
                                            )}
                                            <span className="text-[10px] font-bold text-gray-300">
                                                {new Date(comment.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                {' '}
                                                {new Date(comment.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium text-gray-700 leading-relaxed">
                                            {comment.text}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-xs font-bold text-gray-400">No comments yet. Start the conversation!</p>
                            </div>
                        )}
                    </div>

                    {/* Comment Input */}
                    <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-black flex-shrink-0">
                            {currentUser?.first_name?.[0]}{currentUser?.last_name?.[0]}
                        </div>
                        <div className="flex-1 relative">
                            <textarea
                                value={commentText}
                                onChange={e => setCommentText(e.target.value)}
                                placeholder="Share your thoughts on this setlist..."
                                rows={2}
                                className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none font-medium text-sm text-gray-900 transition-all resize-none placeholder:text-gray-300"
                                onKeyDown={e => {
                                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                        handleSendComment()
                                    }
                                }}
                            />
                        </div>
                        <Button
                            onClick={handleSendComment}
                            disabled={sendingComment || !commentText.trim()}
                            size="icon"
                            className="w-10 h-10 rounded-xl flex-shrink-0 self-end"
                        >
                            {sendingComment ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    // ==============================================================
    // LIST VIEW
    // ==============================================================
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        Setlists
                        <div className="bg-primary/10 px-3 py-1 rounded-full text-xs font-black text-primary uppercase tracking-widest">
                            {setlists.length} {setlists.length === 1 ? 'Set' : 'Sets'}
                        </div>
                    </h2>
                    <p className="text-gray-500 font-medium text-sm">
                        Create and manage setlists for {bandName}. Propose, discuss, and get the whole band to sign off.
                    </p>
                </div>
                <Button
                    onClick={() => setShowCreateModal(true)}
                    className="gap-2 hover:scale-105 shadow-xl shadow-primary/20 transition-all py-6 px-10 font-black uppercase tracking-widest text-[10px]"
                >
                    <Plus className="w-4 h-4" />
                    New Setlist
                </Button>
            </div>

            {setlists.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {setlists.map(setlist => {
                        const statusConf = STATUS_CONFIG[setlist.status]
                        const songCount = setlist.resources.filter(r => r.item_type === 'song').length
                        return (
                            <button
                                key={setlist.id}
                                onClick={() => fetchSetlistDetail(setlist.id)}
                                className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all text-left group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-primary/5 transition-colors" />

                                <div className="relative z-10 space-y-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tighter">
                                                    {setlist.name}
                                                </h3>
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusConf.color}`}>
                                                    <span className={`w-1 h-1 rounded-full ${statusConf.dot}`} />
                                                    {statusConf.label}
                                                </span>
                                            </div>
                                            {setlist.description && (
                                                <p className="text-xs font-medium text-gray-500 line-clamp-2">{setlist.description}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={e => { e.stopPropagation(); handleDeleteSetlist(setlist.id) }}
                                                className="p-2 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest flex-wrap">
                                        <span className="flex items-center gap-1">
                                            <Music className="w-3 h-3" />
                                            {songCount} {songCount === 1 ? 'Song' : 'Songs'}
                                        </span>
                                        {setlist.venue && (
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                {setlist.venue}
                                            </span>
                                        )}
                                        {setlist.event_date && (
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(setlist.event_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </span>
                                        )}
                                        {setlist.comments.length > 0 && (
                                            <span className="flex items-center gap-1">
                                                <MessageSquare className="w-3 h-3" />
                                                {setlist.comments.length}
                                            </span>
                                        )}
                                    </div>

                                    {/* Approval Bar */}
                                    {setlist.total_members > 0 && setlist.status !== 'draft' && (
                                        <div className="pt-4 border-t border-gray-50">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Approvals</span>
                                                <span className="text-[10px] font-black text-gray-500">
                                                    {setlist.approval_count}/{setlist.total_members}
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${
                                                        setlist.approval_count >= setlist.total_members
                                                            ? 'bg-emerald-400' : 'bg-amber-400'
                                                    }`}
                                                    style={{ width: `${Math.min(100, (setlist.approval_count / setlist.total_members) * 100)}%` }}
                                                />
                                            </div>
                                            {setlist.approved_by.length > 0 && (
                                                <div className="flex items-center gap-1.5 mt-2">
                                                    {setlist.approved_by.map(a => (
                                                        <span
                                                            key={a.user_id}
                                                            className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-[8px] font-black"
                                                            title={a.user_name}
                                                        >
                                                            {a.user_initials}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between text-[10px] font-bold text-gray-300 uppercase tracking-widest pt-2">
                                        <span>{setlist.created_by_name}</span>
                                        <span>{new Date(setlist.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </button>
                        )
                    })}
                </div>
            ) : (
                <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl p-24 text-center">
                    <div className="flex flex-col items-center gap-6">
                        <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center border-2 border-dashed border-gray-200">
                            <ListMusic className="w-12 h-12 text-gray-200" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">No Setlists Yet</h3>
                            <p className="text-sm font-medium text-gray-500 max-w-sm mx-auto leading-relaxed">
                                Create your first setlist for {bandName}. Add songs, propose it to the band, and collect approvals.
                            </p>
                        </div>
                        <Button
                            onClick={() => setShowCreateModal(true)}
                            className="px-10 py-6 rounded-2xl shadow-lg shadow-primary/10 gap-2"
                        >
                            <Sparkles className="w-4 h-4" />
                            Create First Setlist
                        </Button>
                    </div>
                </div>
            )}

            {/* Create Setlist Modal */}
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal} size="lg">
                <DialogHeader title="Create Setlist" />
                <DialogContent>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Setlist Name *</label>
                            <input
                                type="text"
                                value={createForm.name}
                                onChange={e => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="e.g. Friday Night Set, Acoustic Hour"
                                className="w-full px-6 py-4 bg-gray-50 border-transparent border-2 focus:border-primary focus:bg-white rounded-2xl outline-none font-bold text-gray-900 transition-all placeholder:text-gray-300"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</label>
                            <textarea
                                value={createForm.description}
                                onChange={e => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Notes about the set..."
                                rows={3}
                                className="w-full px-6 py-4 bg-gray-50 border-transparent border-2 focus:border-primary focus:bg-white rounded-2xl outline-none font-bold text-gray-900 transition-all resize-none placeholder:text-gray-300"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Venue</label>
                                <input
                                    type="text"
                                    value={createForm.venue}
                                    onChange={e => setCreateForm(prev => ({ ...prev, venue: e.target.value }))}
                                    placeholder="e.g. The Blue Note"
                                    className="w-full px-6 py-4 bg-gray-50 border-transparent border-2 focus:border-primary focus:bg-white rounded-2xl outline-none font-bold text-gray-900 transition-all placeholder:text-gray-300"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Event Date</label>
                                <input
                                    type="datetime-local"
                                    value={createForm.event_date}
                                    onChange={e => setCreateForm(prev => ({ ...prev, event_date: e.target.value }))}
                                    className="w-full px-6 py-4 bg-gray-50 border-transparent border-2 focus:border-primary focus:bg-white rounded-2xl outline-none font-bold text-gray-900 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Initial Status</label>
                            <div className="flex p-1 bg-gray-50 rounded-2xl border border-gray-100 gap-1">
                                {(['draft', 'proposed'] as const).map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setCreateForm(prev => ({ ...prev, status: s }))}
                                        className={`flex-1 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                            createForm.status === s
                                                ? 'bg-white text-primary shadow-sm'
                                                : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                    >
                                        {s === 'draft' ? '📝 Draft' : '📤 Propose Now'}
                                    </button>
                                ))}
                            </div>
                            <p className="text-[10px] font-medium text-gray-400 mt-1">
                                {createForm.status === 'draft'
                                    ? 'You can add songs and finalize before sharing with the band.'
                                    : 'Band members will be able to comment and approve immediately.'
                                }
                            </p>
                        </div>
                    </div>
                </DialogContent>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setShowCreateModal(false)} className="flex-1">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreateSetlist}
                        disabled={creating || !createForm.name.trim()}
                        className="flex-[2] gap-2 active:scale-95 transition-transform"
                    >
                        {creating ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4" />
                                Create Setlist
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </Dialog>
        </div>
    )
}
