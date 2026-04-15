'use client'

import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useResources } from '@/hooks/useDashboardData'
import api, { getSetlists, createSetlist, addResourceToSetlist } from '@/services/api'
import { toast } from 'react-hot-toast'
import {
    FileText, Music, Download, Upload, Loader2, Search, X, Plus,
    FileMusic, Guitar, Piano, Mic, Drum, Music2, BookOpen, Filter,
    Eye, List, LayoutGrid, ChevronUp, ChevronDown, ListMusic,
    Trash, ExternalLink, Maximize2, Minimize2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogHeader, DialogContent, DialogFooter } from '@/components/ui/dialog'
import { proxyFileUrl } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type MusicResourceType = 'sheet_music' | 'chord_chart' | 'tablature' | 'lyrics'

interface SongbookResource {
    id: string
    title: string
    description: string
    resource_type: MusicResourceType
    file: string | null
    file_url: string | null
    external_url: string
    tags: string[]
    category: string
    uploaded_by_name: string
    created_at: string
    instrument: string
    composer: string
    key_signature: string
    tempo: string
    bpm: number | null
    capo: number | null
    chord_content: string
}

interface SetlistOption {
    id: string
    name: string
    status: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const INSTRUMENTS = [
    { value: 'Piano', icon: Piano, color: 'blue' },
    { value: 'Guitar', icon: Guitar, color: 'orange' },
    { value: 'Bass', icon: Music2, color: 'purple' },
    { value: 'Drums', icon: Drum, color: 'red' },
    { value: 'Voice', icon: Mic, color: 'green' },
    { value: 'Violin', icon: Music, color: 'pink' },
    { value: 'Other', icon: Music2, color: 'gray' },
]

const RESOURCE_TYPES: { value: MusicResourceType; label: string; icon: any }[] = [
    { value: 'sheet_music', label: 'Sheet Music', icon: FileMusic },
    { value: 'chord_chart', label: 'Chord Chart', icon: Music },
    { value: 'tablature', label: 'Tablature', icon: Guitar },
    { value: 'lyrics', label: 'Lyrics', icon: FileText },
]

function transposeKey(keySignature: string): string {
    return keySignature
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function AddToSetlistPopover({
    resource,
    anchorRef,
    onClose,
}: {
    resource: SongbookResource
    anchorRef: React.RefObject<HTMLElement>
    onClose: () => void
}) {
    const [setlists, setSetlists] = useState<SetlistOption[]>([])
    const [loading, setLoading] = useState(true)
    const [adding, setAdding] = useState<string | null>(null)
    const [creatingNew, setCreatingNew] = useState(false)
    const [newName, setNewName] = useState('')
    const [pos, setPos] = useState<{ top: number; left: number } | null>(null)
    const ref = useRef<HTMLDivElement>(null)

    // Position relative to anchor button using fixed coords so it escapes any overflow:hidden parent
    useEffect(() => {
        if (anchorRef.current) {
            const rect = anchorRef.current.getBoundingClientRect()
            setPos({ top: rect.bottom + 8, left: rect.right - 288 }) // 288 = w-72
        }
    }, [anchorRef])

    useEffect(() => {
        getSetlists()
            .then(res => setSetlists(res.data.results ?? res.data))
            .catch(() => toast.error('Could not load setlists'))
            .finally(() => setLoading(false))
    }, [])

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node) &&
                anchorRef.current && !anchorRef.current.contains(e.target as Node)) onClose()
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [onClose, anchorRef])

    const handleAdd = async (setlistId: string) => {
        setAdding(setlistId)
        try {
            await addResourceToSetlist(setlistId, resource.id)
            toast.success(`Added to setlist`)
            onClose()
        } catch {
            toast.error('Could not add to setlist')
        } finally {
            setAdding(null)
        }
    }

    const handleCreateAndAdd = async () => {
        if (!newName.trim()) return
        setCreatingNew(true)
        try {
            const res = await createSetlist({ name: newName.trim() })
            await addResourceToSetlist(res.data.id, resource.id)
            toast.success(`Created "${newName}" and added song`)
            onClose()
        } catch {
            toast.error('Could not create setlist')
        } finally {
            setCreatingNew(false)
        }
    }

    if (!pos) return null

    return createPortal(
        <div
            ref={ref}
            style={{ position: 'fixed', top: pos.top, left: pos.left }}
            className="z-[9999] w-72 bg-white rounded-2xl border-2 border-gray-100 shadow-2xl shadow-black/10 overflow-hidden"
        >
            <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Add to Setlist</p>
                <p className="text-xs font-bold text-gray-700 truncate mt-0.5">{resource.title}</p>
            </div>

            <div className="max-h-48 overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center py-6">
                        <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
                    </div>
                ) : setlists.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-4 px-4">No setlists yet</p>
                ) : (
                    setlists.map(sl => (
                        <button
                            key={sl.id}
                            onClick={() => handleAdd(sl.id)}
                            disabled={adding === sl.id}
                            className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left group"
                        >
                            <div className="flex items-center gap-2 min-w-0">
                                <ListMusic className="w-4 h-4 text-gray-400 shrink-0" />
                                <span className="text-sm font-bold text-gray-700 truncate">{sl.name}</span>
                            </div>
                            {adding === sl.id
                                ? <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
                                : <Plus className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors shrink-0" />
                            }
                        </button>
                    ))
                )}
            </div>

            <div className="px-4 py-3 border-t border-gray-100 space-y-2">
                {creatingNew ? (
                    <div className="flex gap-2">
                        <input
                            autoFocus
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleCreateAndAdd()}
                            placeholder="Setlist name..."
                            className="flex-1 px-3 py-2 bg-gray-50 border-2 border-transparent focus:border-primary rounded-xl outline-none text-sm font-bold text-gray-900"
                        />
                        <Button
                            size="icon"
                            onClick={handleCreateAndAdd}
                            disabled={!newName.trim()}
                            className="rounded-xl h-9 w-9 shrink-0"
                        >
                            {creatingNew ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        </Button>
                    </div>
                ) : (
                    <button
                        onClick={() => setCreatingNew(true)}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black text-primary uppercase tracking-widest hover:bg-primary/5 transition-colors"
                    >
                        <Plus className="w-4 h-4" /> New Setlist
                    </button>
                )}
            </div>
        </div>,
        document.body
    )
}

function ListViewSetlistButton({ resource, open, onToggle, onClose }: {
    resource: SongbookResource
    open: boolean
    onToggle: () => void
    onClose: () => void
}) {
    const btnRef = useRef<HTMLButtonElement>(null)
    return (
        <div className="relative">
            <button
                ref={btnRef}
                onClick={onToggle}
                className="p-2 rounded-xl text-gray-400 hover:text-primary hover:bg-primary/5 transition-all"
                title="Add to setlist"
            >
                <ListMusic className="w-4 h-4" />
            </button>
            {open && <AddToSetlistPopover resource={resource} anchorRef={btnRef} onClose={onClose} />}
        </div>
    )
}

function ViewerModal({
    resource,
    onClose,
}: {
    resource: SongbookResource
    onClose: () => void
}) {
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => { setMounted(true) }, [])

    const fileUrl = proxyFileUrl(resource.file_url)
    const isPdf = resource.resource_type === 'sheet_music'
        || resource.resource_type === 'chord_chart'
        || resource.resource_type === 'tablature'
        || resource.resource_type === 'lyrics'
        || resource.file_url?.toLowerCase().endsWith('.pdf')
    const isImage = !isPdf && resource.file_url?.match(/\.(png|jpe?g|gif|webp|svg)$/i)

    // Close fullscreen overlay on Escape key
    useEffect(() => {
        if (!isFullscreen) return
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsFullscreen(false)
        }
        document.addEventListener('keydown', onKeyDown)
        return () => document.removeEventListener('keydown', onKeyDown)
    }, [isFullscreen])

    const toggleFullscreen = () => setIsFullscreen(fs => !fs)

    const controls = (
        <div className={`flex flex-wrap items-center gap-4 ${isFullscreen
            ? 'bg-black/80 backdrop-blur-md px-6 py-3 rounded-2xl'
            : 'bg-gray-50 border-2 border-gray-100 px-4 py-3 rounded-2xl'}`
        }>
            {/* Badges + fullscreen toggle */}
            <div className="flex items-center gap-2 ml-auto">
                {resource.bpm && (
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isFullscreen ? 'bg-white/10 text-white/70' : 'bg-green-50 text-green-700'}`}>
                        {resource.bpm} BPM
                    </span>
                )}
                {resource.instrument && (
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isFullscreen ? 'bg-white/10 text-white/70' : 'bg-gray-100 text-gray-600'}`}>
                        {resource.instrument}
                    </span>
                )}
                <button
                    onClick={toggleFullscreen}
                    title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                    className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${isFullscreen
                        ? 'bg-white/10 border-white/20 hover:border-primary text-white'
                        : 'bg-white border-gray-200 hover:border-primary hover:text-primary text-gray-500 shadow-sm'}`}
                >
                    {isFullscreen
                        ? <Minimize2 className="w-4 h-4" />
                        : <Maximize2 className="w-4 h-4" />
                    }
                </button>
            </div>
        </div>
    )

    // ---------- Fullscreen overlay (portalled — never unmounts during transition) ----------
    const fullscreenOverlay = mounted && isFullscreen && createPortal(
        <div className="fixed inset-0 z-[9999] bg-black flex flex-col">
            <div className="shrink-0 px-4 pt-4 pb-2">{controls}</div>
            <div className="flex-1 overflow-hidden">
                {fileUrl && isPdf && (
                    <embed src={fileUrl} type="application/pdf" className="w-full h-full" />
                )}
                {fileUrl && isImage && (
                    <img src={fileUrl} alt={resource.title} className="w-full h-full object-contain" />
                )}
            </div>
        </div>,
        document.body
    )

    // ---------- Normal dialog render ----------
    return (
        <>
            {fullscreenOverlay}
            <Dialog open onOpenChange={onClose} size="xl">
                <DialogHeader title={resource.title} />
                <DialogContent>
                    {resource.composer && (
                        <p className="text-sm font-bold text-gray-500 -mt-1 mb-4">by {resource.composer}</p>
                    )}

                    {/* Performance controls */}
                    <div className="mb-5">{controls}</div>

                    {/* File display */}
                {fileUrl ? (
                    isPdf ? (
                        <div className="w-full rounded-2xl overflow-hidden border-2 border-gray-100" style={{ height: '62vh' }}>
                            <embed
                                src={fileUrl}
                                type="application/pdf"
                                className="w-full h-full"
                            />
                        </div>
                    ) : isImage ? (
                        <div className="w-full flex items-center justify-center rounded-2xl border-2 border-gray-100 bg-gray-50 p-4 min-h-64">
                            <img
                                src={fileUrl}
                                alt={resource.title}
                                className="max-w-full max-h-[60vh] object-contain rounded-xl"
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-4 py-12 text-gray-400">
                            <FileMusic className="w-16 h-16 text-gray-200" />
                            <p className="text-sm font-bold">Preview not available for this file type.</p>
                        </div>
                    )
                ) : resource.external_url ? (
                    <div className="flex flex-col items-center gap-4 py-12">
                        <ExternalLink className="w-12 h-12 text-primary/30" />
                        <a href={resource.external_url} target="_blank" rel="noopener noreferrer"
                            className="text-primary font-bold underline underline-offset-2 text-sm">
                            Open external link
                        </a>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4 py-12 text-gray-400">
                        <BookOpen className="w-16 h-16 text-gray-200" />
                        <p className="text-sm font-bold">No file attached.</p>
                    </div>
                )}

                {resource.description && (
                    <p className="mt-4 text-sm text-gray-500 font-medium leading-relaxed">{resource.description}</p>
                )}
            </DialogContent>
            <DialogFooter>
                <Button variant="ghost" onClick={onClose} className="flex-1">Close</Button>
                {fileUrl && (
                    <a
                        href={fileUrl}
                        download={resource.title}
                        className="flex-1"
                    >
                        <Button className="w-full gap-2">
                            <Download className="w-4 h-4" /> Download
                        </Button>
                    </a>
                )}
            </DialogFooter>
        </Dialog>
        </>
    )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function SongbookPage() {
    const { resources, loading, refetch } = useResources()

    // View & filter state
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [searchQuery, setSearchQuery] = useState('')
    const [filterInstrument, setFilterInstrument] = useState('all')
    const [filterType, setFilterType] = useState<MusicResourceType | 'all'>('all')


    // Active modals
    const [viewingResource, setViewingResource] = useState<SongbookResource | null>(null)
    const [setlistPopoverFor, setSetlistPopoverFor] = useState<string | null>(null)

    // Upload state
    const [showUploadModal, setShowUploadModal] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const [deleting, setDeleting] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [uploadForm, setUploadForm] = useState({
        title: '',
        file: null as File | null,
        composer: '',
        notes: '',
    })

    const musicResources: SongbookResource[] = (resources ?? []).filter((r: any) =>
        ['sheet_music', 'chord_chart', 'tablature', 'lyrics'].includes(r.resource_type)
    )

    const filteredResources = musicResources.filter(r => {
        const q = searchQuery.toLowerCase()
        const matchesSearch = r.title.toLowerCase().includes(q)
            || r.description?.toLowerCase().includes(q)
            || r.composer?.toLowerCase().includes(q)
        const matchesInstrument = filterInstrument === 'all' || r.instrument === filterInstrument
        const matchesType = filterType === 'all' || r.resource_type === filterType
        return matchesSearch && matchesInstrument && matchesType
    })

    const getInstrumentInfo = (instrument: string) =>
        INSTRUMENTS.find(i => i.value.toLowerCase() === instrument?.toLowerCase()) ?? INSTRUMENTS[INSTRUMENTS.length - 1]

    // ---- Drag & drop ----
    const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }, [])
    const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false) }, [])
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault(); setIsDragging(false)
        const file = e.dataTransfer.files[0]
        if (file) handleFileSelect(file)
    }, [])

    const handleFileSelect = (file: File) => {
        setUploadForm(prev => ({ ...prev, file, title: prev.title || file.name.replace(/\.[^/.]+$/, '') }))
        setShowUploadModal(true)
    }

    // ---- Upload ----
    const handleUpload = async () => {
        if (!uploadForm.title) { toast.error('Title is required'); return }
        if (!uploadForm.file) { toast.error('File is required'); return }

        setUploading(true)
        try {
            const fd = new FormData()
            fd.append('title', uploadForm.title)
            fd.append('description', uploadForm.notes)
            fd.append('resource_type', 'sheet_music')
            fd.append('composer', uploadForm.composer)
            fd.append('tags', JSON.stringify([]))
            fd.append('file', uploadForm.file)

            await api.post('/resources/library/', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
            toast.success('Chart uploaded!')
            setShowUploadModal(false)
            setUploadForm({ title: '', file: null, composer: '', notes: '' })
            refetch()
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Upload failed')
        } finally {
            setUploading(false)
        }
    }

    // ---- Delete ----
    const handleDelete = async (id: string) => {
        if (!confirm('Delete this chart?')) return
        setDeleting(id)
        try {
            await api.delete(`/resources/library/${id}/`)
            toast.success('Deleted')
            refetch()
        } catch { toast.error('Delete failed') }
        finally { setDeleting(null) }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-in fade-in duration-500">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Loading Songbook...</p>
            </div>
        )
    }

    return (
        <div
            className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {/* Drag-over overlay */}
            {isDragging && (
                <div className="fixed inset-0 z-50 bg-primary/5 border-4 border-dashed border-primary/40 rounded-3xl flex items-center justify-center pointer-events-none">
                    <div className="text-center space-y-3">
                        <Upload className="w-16 h-16 text-primary/50 mx-auto" />
                        <p className="text-2xl font-black text-primary uppercase tracking-widest">Drop to Upload</p>
                    </div>
                </div>
            )}

            {/* ---- Header ---- */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4">
                <div className="space-y-2">
                    <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <Music className="w-8 h-8 text-primary" />
                        Songbook
                        <div className="bg-primary/10 px-3 py-1 rounded-full text-xs font-black text-primary uppercase tracking-widest">
                            {musicResources.length} Charts
                        </div>
                    </h1>
                    <p className="text-gray-500 font-medium max-w-lg">Sheet music, chord charts, and tablature for your students.</p>
                </div>
                <Button
                    onClick={() => setShowUploadModal(true)}
                    className="gap-2 hover:scale-105 shadow-xl shadow-primary/20 transition-all py-6 px-10 font-black uppercase tracking-widest text-[10px]"
                >
                    <Upload className="w-4 h-4" /> Upload Chart
                </Button>
            </header>

            {/* ---- Filters ---- */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                    {/* Search */}
                    <div className="relative flex-1 max-w-xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by title, composer..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-100 focus:border-primary rounded-2xl font-bold text-sm text-gray-700 outline-none transition-all shadow-sm"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Instrument filter */}
                    <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-2xl border-2 border-gray-100 shadow-sm">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select
                            value={filterInstrument}
                            onChange={e => setFilterInstrument(e.target.value)}
                            className="bg-transparent text-sm font-bold text-gray-700 outline-none cursor-pointer"
                        >
                            <option value="all">All Instruments</option>
                            {INSTRUMENTS.map(i => <option key={i.value} value={i.value}>{i.value}</option>)}
                        </select>
                    </div>

                    {/* Type filter */}
                    <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-2xl border-2 border-gray-100 shadow-sm">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select
                            value={filterType}
                            onChange={e => setFilterType(e.target.value as MusicResourceType | 'all')}
                            className="bg-transparent text-sm font-bold text-gray-700 outline-none cursor-pointer"
                        >
                            <option value="all">All Types</option>
                            {RESOURCE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                    </div>

                    {/* View toggle */}
                    <div className="flex items-center gap-1 bg-white border-2 border-gray-100 rounded-2xl p-1 shadow-sm">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-primary text-white shadow' : 'text-gray-400 hover:text-gray-700'}`}
                            title="Grid view"
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-primary text-white shadow' : 'text-gray-400 hover:text-gray-700'}`}
                            title="List view"
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* ---- Content ---- */}
            {filteredResources.length === 0 ? (
                <div className="bg-white rounded-[3rem] border-2 border-gray-100 shadow-xl p-24 text-center">
                    <div className="flex flex-col items-center gap-6">
                        <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center border-2 border-dashed border-gray-200">
                            <BookOpen className="w-12 h-12 text-gray-200" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Songbook Empty</h3>
                            <p className="text-sm font-medium text-gray-500 max-w-sm mx-auto leading-relaxed">
                                {searchQuery || filterInstrument !== 'all' || filterType !== 'all'
                                    ? 'No charts match your filters.'
                                    : 'Upload your first chart to get started.'}
                            </p>
                        </div>
                        <Button onClick={() => setShowUploadModal(true)} className="px-10 py-6 rounded-2xl shadow-lg shadow-primary/10">
                            <Plus className="w-4 h-4 mr-1" /> Upload Chart
                        </Button>
                    </div>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredResources.map(resource => (
                        <SongCard
                            key={resource.id}
                            resource={resource}
                            onView={() => setViewingResource(resource)}
                            onDelete={() => handleDelete(resource.id)}
                            deleting={deleting === resource.id}
                            setlistPopoverOpen={setlistPopoverFor === resource.id}
                            onToggleSetlistPopover={() => setSetlistPopoverFor(prev => prev === resource.id ? null : resource.id)}
                            onCloseSetlistPopover={() => setSetlistPopoverFor(null)}
                            getInstrumentInfo={getInstrumentInfo}
                        />
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b-2 border-gray-100">
                                <th className="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Title</th>
                                <th className="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest hidden md:table-cell">Instrument</th>
                                <th className="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest hidden lg:table-cell">Key</th>
                                <th className="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest hidden lg:table-cell">BPM</th>
                                <th className="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest hidden xl:table-cell">Type</th>
                                <th className="text-right px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredResources.map(resource => {
                                const inst = getInstrumentInfo(resource.instrument)
                                const Icon = inst.icon
                                return (
                                    <tr key={resource.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-9 h-9 bg-${inst.color}-50 rounded-xl flex items-center justify-center shrink-0`}>
                                                    <Icon className={`w-4 h-4 text-${inst.color}-600`} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-gray-900">{resource.title}</p>
                                                    {resource.composer && <p className="text-xs font-bold text-gray-400">by {resource.composer}</p>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            <span className="text-xs font-bold text-gray-600">{resource.instrument || '—'}</span>
                                        </td>
                                        <td className="px-6 py-4 hidden lg:table-cell">
                                            {resource.key_signature
                                                ? <span className="text-xs font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg">{resource.key_signature}</span>
                                                : <span className="text-gray-300">—</span>
                                            }
                                        </td>
                                        <td className="px-6 py-4 hidden lg:table-cell">
                                            <span className="text-xs font-bold text-gray-600">{resource.bpm ? `${resource.bpm}` : '—'}</span>
                                        </td>
                                        <td className="px-6 py-4 hidden xl:table-cell">
                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                                {RESOURCE_TYPES.find(t => t.value === resource.resource_type)?.label ?? resource.resource_type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setViewingResource(resource)}
                                                    className="p-2 rounded-xl text-gray-400 hover:text-primary hover:bg-primary/5 transition-all"
                                                    title="View"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <ListViewSetlistButton
                                                    resource={resource}
                                                    open={setlistPopoverFor === resource.id}
                                                    onToggle={() => setSetlistPopoverFor(p => p === resource.id ? null : resource.id)}
                                                    onClose={() => setSetlistPopoverFor(null)}
                                                />
                                                <button
                                                    onClick={() => handleDelete(resource.id)}
                                                    disabled={deleting === resource.id}
                                                    className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                                                    title="Delete"
                                                >
                                                    {deleting === resource.id
                                                        ? <Loader2 className="w-4 h-4 animate-spin" />
                                                        : <Trash className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ---- Viewer modal ---- */}
            {viewingResource && (
                <ViewerModal
                    resource={viewingResource}
                    onClose={() => setViewingResource(null)}
                />
            )}

            {/* ---- Upload modal ---- */}
            <Dialog open={showUploadModal} onOpenChange={setShowUploadModal} size="lg">
                <DialogHeader title="Upload Chart" />
                <DialogContent>
                    <div className="space-y-6">
                        {/* Drop zone */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">File</label>
                            <div
                                onClick={() => !uploadForm.file && fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer group ${isDragging ? 'border-primary bg-primary/5' : 'border-gray-200 bg-gray-50/30 hover:border-gray-300 hover:bg-gray-50'}`}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                                    className="hidden"
                                />
                                {uploadForm.file ? (
                                    <div className="flex items-center justify-center gap-4">
                                        <FileMusic className="w-10 h-10 text-primary" />
                                        <div className="text-left space-y-1">
                                            <p className="text-sm font-black text-gray-900">{uploadForm.file.name}</p>
                                            <p className="text-[10px] font-black text-primary uppercase tracking-widest">{(uploadForm.file.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                        <Button variant="ghost" onClick={e => { e.stopPropagation(); setUploadForm(p => ({ ...p, file: null })) }} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-lg">
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <Upload className="w-10 h-10 text-gray-300 mx-auto group-hover:text-primary transition-colors" />
                                        <div className="space-y-1">
                                            <p className="text-xs font-black text-gray-900 uppercase tracking-widest">Drop file here</p>
                                            <p className="text-[10px] font-bold text-gray-400">or click to browse · PDF, JPG, PNG</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Metadata */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Title *</label>
                                <input
                                    type="text"
                                    value={uploadForm.title}
                                    onChange={e => setUploadForm(p => ({ ...p, title: e.target.value }))}
                                    placeholder="Song or piece title..."
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-xl outline-none font-bold text-gray-900 transition-all"
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Composer / Artist</label>
                                <input
                                    type="text"
                                    value={uploadForm.composer}
                                    onChange={e => setUploadForm(p => ({ ...p, composer: e.target.value }))}
                                    placeholder="e.g. Beethoven, The Beatles..."
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-xl outline-none font-bold text-gray-900 transition-all"
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Notes</label>
                                <textarea
                                    value={uploadForm.notes}
                                    onChange={e => setUploadForm(p => ({ ...p, notes: e.target.value }))}
                                    placeholder="Key, BPM, instrument notes, capo position..."
                                    rows={3}
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-xl outline-none font-bold text-gray-900 transition-all resize-none"
                                />
                            </div>
                        </div>
                    </div>
                </DialogContent>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setShowUploadModal(false)} className="flex-1">Cancel</Button>
                    <Button onClick={handleUpload} disabled={uploading} className="flex-[2] gap-2 active:scale-95 transition-transform">
                        {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</> : <><Upload className="w-4 h-4" /> Upload Chart</>}
                    </Button>
                </DialogFooter>
            </Dialog>
        </div>
    )
}

// ---------------------------------------------------------------------------
// Song card (grid view)
// ---------------------------------------------------------------------------

function SongCard({
    resource,
    onView,
    onDelete,
    deleting,
    setlistPopoverOpen,
    onToggleSetlistPopover,
    onCloseSetlistPopover,
    getInstrumentInfo,
}: {
    resource: SongbookResource
    onView: () => void
    onDelete: () => void
    deleting: boolean
    setlistPopoverOpen: boolean
    onToggleSetlistPopover: () => void
    onCloseSetlistPopover: () => void
    getInstrumentInfo: (instrument: string) => typeof INSTRUMENTS[number]
}) {
    const inst = getInstrumentInfo(resource.instrument)
    const setlistBtnRef = useRef<HTMLButtonElement>(null)
    const Icon = inst.icon

    return (
        <div className="bg-white rounded-[2rem] border-2 border-gray-100 p-6 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all group relative overflow-hidden flex flex-col">
            {/* Instrument icon */}
            <div className={`absolute top-4 right-4 w-12 h-12 bg-${inst.color}-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <Icon className={`w-6 h-6 text-${inst.color}-600`} />
            </div>

            {/* Content */}
            <div className="flex-1 space-y-3 pt-2">
                <div className="space-y-1">
                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight leading-tight line-clamp-2 pr-14">
                        {resource.title}
                    </h3>
                    {resource.composer && (
                        <p className="text-xs font-bold text-gray-500">by {resource.composer}</p>
                    )}
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                    {resource.instrument && (
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-${inst.color}-50 text-${inst.color}-700`}>
                            {resource.instrument}
                        </span>
                    )}
                    {resource.key_signature && (
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-700">
                            Key: {resource.key_signature}
                        </span>
                    )}
                    {resource.bpm && (
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-50 text-green-700">
                            {resource.bpm} BPM
                        </span>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <span>{resource.uploaded_by_name?.split(' ')[0]}</span>
                <span>{new Date(resource.created_at).toLocaleDateString()}</span>
            </div>

            {/* Action row */}
            <div className="mt-4 flex gap-2">
                <Button
                    onClick={onView}
                    className="flex-1 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest gap-2 py-5 shadow-lg shadow-primary/10"
                >
                    <Eye className="w-3.5 h-3.5" /> View
                </Button>

                {/* Add to setlist */}
                <div className="relative">
                    <Button
                        ref={setlistBtnRef}
                        variant="outline"
                        size="icon"
                        onClick={onToggleSetlistPopover}
                        className="p-0 w-11 h-11 rounded-xl border-2 border-gray-100 text-gray-400 hover:text-primary hover:border-primary transition-all"
                        title="Add to setlist"
                    >
                        <ListMusic className="w-4 h-4" />
                    </Button>
                    {setlistPopoverOpen && (
                        <AddToSetlistPopover resource={resource} anchorRef={setlistBtnRef} onClose={onCloseSetlistPopover} />
                    )}
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onDelete}
                    disabled={deleting}
                    className="p-0 w-11 h-11 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                >
                    {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash className="w-4 h-4" />}
                </Button>
            </div>
        </div>
    )
}
