'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useResources } from '@/hooks/useDashboardData'
import api from '@/services/api'
import { toast } from 'react-hot-toast'
import {
    FileText,
    Music,
    Video,
    Link as LinkIcon,
    Download,
    Upload,
    Loader2,
    Image as ImageIcon,
    File,
    Trash,
    Search,
    X,
    Plus,
    ExternalLink,
    Grid,
    BookOpen,
    Sparkles,
    Folder,
    FolderOpen,
    FolderPlus,
    ChevronRight,
    Home,
    MoreVertical,
    MoveRight,
    CheckCircle2,
    AlertCircle,
    CloudUpload,
    Target,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { proxyFileUrl } from '@/lib/utils'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type ResourceType = 'pdf' | 'audio' | 'video' | 'image' | 'link' | 'other'

interface Resource {
    id: string
    title: string
    description: string
    resource_type: ResourceType
    file: string | null
    file_url: string | null
    external_url: string
    tags: string[]
    category: string
    folder: string | null
    folder_name: string | null
    uploaded_by_name: string
    created_at: string
    file_size?: number
}

interface ResourceFolder {
    id: string
    name: string
    parent: string | null
    children_count: number
    resources_count: number
    created_at: string
}

type UploadStatus = 'idle' | 'uploading' | 'done' | 'error'

interface QueueItem {
    id: string          // local-only uuid
    file: File
    title: string
    detectedType: ResourceType
    status: UploadStatus
    progress: number    // 0-100
    error?: string
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function detectType(file: File): ResourceType {
    if (file.type === 'application/pdf') return 'pdf'
    if (file.type.startsWith('audio/')) return 'audio'
    if (file.type.startsWith('video/')) return 'video'
    if (file.type.startsWith('image/')) return 'image'
    return 'other'
}

function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

function localId() {
    return Math.random().toString(36).slice(2)
}

// ─────────────────────────────────────────────
// Icon helper
// ─────────────────────────────────────────────

function ResourceIcon({ type, size = 'w-5 h-5' }: { type: ResourceType; size?: string }) {
    switch (type) {
        case 'audio':  return <Music className={`${size} text-blue-500`} />
        case 'video':  return <Video className={`${size} text-red-500`} />
        case 'image':  return <ImageIcon className={`${size} text-purple-500`} />
        case 'link':   return <LinkIcon className={`${size} text-green-500`} />
        case 'pdf':    return <FileText className={`${size} text-orange-500`} />
        default:       return <File className={`${size} text-gray-500`} />
    }
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────

export default function ResourcesPage() {
    const { resources, loading, refetch } = useResources()

    // Folder state
    const [folders, setFolders] = useState<ResourceFolder[]>([])
    const [foldersLoading, setFoldersLoading] = useState(true)
    const [activeFolderId, setActiveFolderId] = useState<string | 'root'>('root')
    const [breadcrumb, setBreadcrumb] = useState<ResourceFolder[]>([])
    const [newFolderName, setNewFolderName] = useState('')
    const [creatingFolder, setCreatingFolder] = useState(false)
    const [showNewFolderInput, setShowNewFolderInput] = useState(false)

    // Upload panel state
    const [showUploadPanel, setShowUploadPanel] = useState(false)
    const [queue, setQueue] = useState<QueueItem[]>([])
    const [uploadingAll, setUploadingAll] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const [panelDragging, setPanelDragging] = useState(false)

    // Resource management
    const [searchQuery, setSearchQuery] = useState('')
    const [filterType, setFilterType] = useState<ResourceType | 'all'>('all')
    const [deleting, setDeleting] = useState<string | null>(null)
    const [movingResource, setMovingResource] = useState<Resource | null>(null)
    const [openMenuId, setOpenMenuId] = useState<string | null>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const newFolderInputRef = useRef<HTMLInputElement>(null)

    // ── Load folders ──────────────────────────

    const fetchFolders = useCallback(async () => {
        setFoldersLoading(true)
        try {
            const res = await api.get('/resources/folders/')
            setFolders(res.data?.results ?? res.data ?? [])
        } catch {
            // non-fatal
        } finally {
            setFoldersLoading(false)
        }
    }, [])

    useEffect(() => { fetchFolders() }, [fetchFolders])

    // ── Folder navigation ─────────────────────

    const navigateToFolder = (folder: ResourceFolder | null) => {
        if (!folder) {
            setActiveFolderId('root')
            setBreadcrumb([])
        } else {
            setActiveFolderId(folder.id)
            setBreadcrumb(prev => {
                const idx = prev.findIndex(f => f.id === folder.id)
                if (idx !== -1) return prev.slice(0, idx + 1)
                return [...prev, folder]
            })
        }
    }

    // Root-level folders (no parent)
    const rootFolders = folders.filter(f => f.parent === null)
    // Children of active folder
    const childFolders = folders.filter(f => f.parent === activeFolderId)
    const visibleFolders = activeFolderId === 'root' ? rootFolders : childFolders

    const createFolder = async () => {
        if (!newFolderName.trim()) return
        setCreatingFolder(true)
        try {
            await api.post('/resources/folders/', {
                name: newFolderName.trim(),
                parent: activeFolderId === 'root' ? null : activeFolderId,
            })
            setNewFolderName('')
            setShowNewFolderInput(false)
            fetchFolders()
            toast.success('Folder created')
        } catch {
            toast.error('Failed to create folder')
        } finally {
            setCreatingFolder(false)
        }
    }

    // ── Queue management ──────────────────────

    const addFilesToQueue = (files: FileList | File[]) => {
        const arr = Array.from(files)
        const items: QueueItem[] = arr.map(f => ({
            id: localId(),
            file: f,
            title: f.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '),
            detectedType: detectType(f),
            status: 'idle',
            progress: 0,
        }))
        setQueue(prev => [...prev, ...items])
    }

    const removeFromQueue = (id: string) => {
        setQueue(prev => prev.filter(q => q.id !== id))
    }

    const updateQueueItem = (id: string, patch: Partial<QueueItem>) => {
        setQueue(prev => prev.map(q => q.id === id ? { ...q, ...patch } : q))
    }

    // ── Drag & drop (page level) ──────────────

    const handlePageDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    const handlePageDragLeave = useCallback((e: React.DragEvent) => {
        if (e.currentTarget === e.target) setIsDragging(false)
    }, [])

    const handlePageDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const files = e.dataTransfer.files
        if (files.length > 0) {
            addFilesToQueue(files)
            setShowUploadPanel(true)
        }
    }, [])

    // ── Panel drag & drop ─────────────────────

    const handlePanelDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setPanelDragging(true)
    }

    const handlePanelDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setPanelDragging(false)
    }

    const handlePanelDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setPanelDragging(false)
        addFilesToQueue(e.dataTransfer.files)
    }

    // ── Upload all ────────────────────────────

    const uploadAll = async () => {
        const pending = queue.filter(q => q.status === 'idle')
        if (pending.length === 0) return

        setUploadingAll(true)

        await Promise.all(pending.map(async (item) => {
            updateQueueItem(item.id, { status: 'uploading', progress: 0 })
            try {
                const fd = new FormData()
                fd.append('files', item.file)
                if (activeFolderId !== 'root') fd.append('folder', activeFolderId)

                await api.post('/resources/library/bulk-upload/', fd, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    onUploadProgress: (evt) => {
                        if (evt.total) {
                            const pct = Math.round((evt.loaded / evt.total) * 100)
                            updateQueueItem(item.id, { progress: pct })
                        }
                    },
                })
                updateQueueItem(item.id, { status: 'done', progress: 100 })
            } catch (err: any) {
                const msg = err.response?.data?.detail || err.message || 'Upload failed'
                updateQueueItem(item.id, { status: 'error', error: msg })
            }
        }))

        setUploadingAll(false)
        const anyDone = queue.some(q => q.status === 'done')
        if (anyDone) {
            refetch()
            toast.success('Files uploaded successfully')
        }
    }

    const clearCompleted = () => {
        setQueue(prev => prev.filter(q => q.status !== 'done'))
    }

    // ── Resource actions ──────────────────────

    const handleDownload = (resource: Resource) => {
        if (resource.resource_type === 'link') {
            window.open(resource.external_url, '_blank')
            return
        }
        if (!resource.file_url) { toast.error('File URL unavailable'); return }
        const downloadUrl = proxyFileUrl(resource.file_url)
        if (downloadUrl) {
            window.open(downloadUrl, '_blank')
            toast.success('Download started')
        }
    }

    const handleDelete = async (resourceId: string) => {
        if (!confirm('Delete this resource?')) return
        setDeleting(resourceId)
        try {
            await api.delete(`/resources/library/${resourceId}/`)
            toast.success('Resource deleted')
            refetch()
        } catch {
            toast.error('Delete failed')
        } finally {
            setDeleting(null)
        }
    }

    const handleMoveResource = async (folderId: string | null) => {
        if (!movingResource) return
        try {
            await api.patch(`/resources/library/${movingResource.id}/`, { folder: folderId })
            toast.success(folderId ? 'Moved to folder' : 'Moved to root')
            refetch()
        } catch {
            toast.error('Move failed')
        } finally {
            setMovingResource(null)
        }
    }

    // ── Filter ────────────────────────────────

    const filteredResources = (resources as Resource[]).filter(r => {
        const matchSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            r.description.toLowerCase().includes(searchQuery.toLowerCase())
        const matchType   = filterType === 'all' || r.resource_type === filterType
        const matchFolder = activeFolderId === 'root'
            ? r.folder === null
            : r.folder === activeFolderId
        return matchSearch && matchType && matchFolder
    })

    const typeFilters: { value: ResourceType | 'all'; label: string }[] = [
        { value: 'all',   label: 'All' },
        { value: 'pdf',   label: 'PDF' },
        { value: 'audio', label: 'Audio' },
        { value: 'video', label: 'Video' },
        { value: 'image', label: 'Image' },
        { value: 'other', label: 'Other' },
    ]

    // ── Loading ───────────────────────────────

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Loading Library...</p>
            </div>
        )
    }

    // ─────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────

    return (
        <div
            className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700"
            onDragOver={handlePageDragOver}
            onDragLeave={handlePageDragLeave}
            onDrop={handlePageDrop}
        >
            {/* ── Page-level drop overlay ── */}
            {isDragging && (
                <div className="fixed inset-0 z-50 bg-primary/5 border-4 border-dashed border-primary/40 rounded-none flex items-center justify-center pointer-events-none">
                    <div className="text-center space-y-3">
                        <CloudUpload className="w-16 h-16 text-primary mx-auto animate-bounce" />
                        <p className="text-xl font-black text-primary uppercase tracking-widest">Drop files anywhere</p>
                        <p className="text-sm font-medium text-primary/60">Release to add to upload queue</p>
                    </div>
                </div>
            )}

            {/* ── Header ── */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4">
                <div className="space-y-2">
                    <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        Resources Library
                        <div className="bg-primary/10 px-3 py-1 rounded-full text-xs font-black text-primary uppercase tracking-widest">
                            {resources.length} Files
                        </div>
                    </h1>
                    <p className="text-gray-500 font-medium max-w-lg">Your studio's cloud file storage — drag & drop or pick multiple files at once.</p>
                </div>
                <Button
                    onClick={() => setShowUploadPanel(true)}
                    className="gap-2 hover:scale-105 shadow-xl shadow-primary/20 transition-all py-6 px-10 font-black uppercase tracking-widest text-[10px]"
                >
                    <CloudUpload className="w-4 h-4" />
                    Upload Files
                </Button>
            </header>

            {/* ── Stats ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Files',   value: resources.length, icon: Grid,    color: 'blue' },
                    { label: 'Folders',       value: rootFolders.length, icon: Folder, color: 'amber' },
                    { label: 'Links',         value: (resources as Resource[]).filter(r => r.resource_type === 'link').length, icon: LinkIcon, color: 'purple' },
                    { label: 'Collections',   value: new Set((resources as Resource[]).map(r => r.category).filter(Boolean)).size, icon: Target, color: 'orange' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-10 h-10 bg-${stat.color}-50 rounded-xl flex items-center justify-center text-${stat.color}-600 group-hover:scale-110 transition-transform`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                        <h3 className="text-2xl font-black text-gray-900">{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* ── Main layout: sidebar + grid ── */}
            <div className="flex gap-6">

                {/* ─── Folder sidebar ─── */}
                <aside className="w-64 shrink-0 bg-white rounded-[2rem] border border-gray-100 shadow-sm p-5 space-y-4 self-start sticky top-6">
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Folders</p>
                        <button
                            onClick={() => { setShowNewFolderInput(v => !v); setTimeout(() => newFolderInputRef.current?.focus(), 50) }}
                            className="w-7 h-7 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 flex items-center justify-center transition-colors"
                            title="New folder"
                        >
                            <FolderPlus className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {showNewFolderInput && (
                        <div className="flex gap-2">
                            <input
                                ref={newFolderInputRef}
                                value={newFolderName}
                                onChange={e => setNewFolderName(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') createFolder(); if (e.key === 'Escape') setShowNewFolderInput(false) }}
                                placeholder="Folder name…"
                                className="flex-1 px-3 py-2 rounded-xl bg-gray-50 border-2 border-transparent focus:border-primary text-xs font-bold outline-none"
                            />
                            <button
                                onClick={createFolder}
                                disabled={creatingFolder || !newFolderName.trim()}
                                className="px-3 py-2 rounded-xl bg-primary text-white text-xs font-black disabled:opacity-40"
                            >
                                {creatingFolder ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                            </button>
                        </div>
                    )}

                    {/* Root */}
                    <button
                        onClick={() => navigateToFolder(null)}
                        className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                            activeFolderId === 'root' ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                        <Home className="w-3.5 h-3.5 shrink-0" />
                        Root
                        <span className="ml-auto text-[10px] font-bold opacity-50">
                            {(resources as Resource[]).filter(r => r.folder === null).length}
                        </span>
                    </button>

                    {/* Folder list */}
                    {foldersLoading ? (
                        <div className="flex justify-center py-4">
                            <Loader2 className="w-4 h-4 text-gray-300 animate-spin" />
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {/* Breadcrumb back navigation */}
                            {breadcrumb.length > 0 && (
                                <div className="flex items-center gap-1 text-[10px] font-black text-gray-400 uppercase tracking-wider px-1 pb-2 overflow-x-auto">
                                    <button onClick={() => navigateToFolder(null)} className="hover:text-primary shrink-0">Root</button>
                                    {breadcrumb.map((f, i) => (
                                        <span key={f.id} className="flex items-center gap-1 shrink-0">
                                            <ChevronRight className="w-2.5 h-2.5" />
                                            <button onClick={() => navigateToFolder(f)} className={i === breadcrumb.length - 1 ? 'text-primary' : 'hover:text-primary'}>
                                                {f.name}
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}

                            {visibleFolders.length === 0 && (
                                <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest text-center py-4">No folders yet</p>
                            )}

                            {visibleFolders.map(folder => (
                                <button
                                    key={folder.id}
                                    onClick={() => navigateToFolder(folder)}
                                    className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all group ${
                                        activeFolderId === folder.id ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    {activeFolderId === folder.id
                                        ? <FolderOpen className="w-3.5 h-3.5 shrink-0 text-primary" />
                                        : <Folder className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                                    }
                                    <span className="truncate">{folder.name}</span>
                                    <span className="ml-auto text-[10px] opacity-40 shrink-0">{folder.resources_count}</span>
                                    {folder.children_count > 0 && <ChevronRight className="w-3 h-3 opacity-30 shrink-0" />}
                                </button>
                            ))}
                        </div>
                    )}
                </aside>

                {/* ─── Content area ─── */}
                <div className="flex-1 min-w-0 space-y-6">

                    {/* Search + filter bar */}
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-3xl border border-gray-100 shadow-xl">
                        <div className="relative flex-1 w-full max-w-xl">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search resources…"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-transparent focus:bg-white border-2 focus:border-primary rounded-2xl font-bold text-sm text-gray-700 outline-none transition-all"
                            />
                        </div>
                        <div className="flex p-1 bg-gray-50 rounded-2xl border border-gray-100 overflow-x-auto no-scrollbar">
                            {typeFilters.map(t => (
                                <button
                                    key={t.value}
                                    onClick={() => setFilterType(t.value)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                        filterType === t.value ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'
                                    }`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Resource grid */}
                    {filteredResources.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredResources.map((resource: Resource) => (
                                <div
                                    key={resource.id}
                                    className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all group relative overflow-hidden flex flex-col"
                                >
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-primary/5 transition-colors" />

                                    <div className="flex items-start justify-between mb-8 relative z-10">
                                        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center border-2 border-white shadow-sm group-hover:scale-110 transition-transform">
                                            <ResourceIcon type={resource.resource_type} size="w-6 h-6" />
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{resource.resource_type}</span>
                                            {/* Kebab menu */}
                                            <div className="relative">
                                                <button
                                                    onClick={() => setOpenMenuId(openMenuId === resource.id ? null : resource.id)}
                                                    className="p-1 rounded-lg hover:bg-gray-100 text-gray-300 hover:text-gray-600 transition-colors"
                                                >
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                                {openMenuId === resource.id && (
                                                    <div className="absolute right-0 top-7 z-20 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 w-44 animate-in zoom-in-95 fade-in">
                                                        <button
                                                            onClick={() => { setMovingResource(resource); setOpenMenuId(null) }}
                                                            className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors text-left"
                                                        >
                                                            <MoveRight className="w-3.5 h-3.5" /> Move to folder
                                                        </button>
                                                        <button
                                                            onClick={() => { handleDelete(resource.id); setOpenMenuId(null) }}
                                                            className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors text-left"
                                                        >
                                                            <Trash className="w-3.5 h-3.5" /> Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-1 space-y-2 relative z-10">
                                        <h3 className="text-base font-black text-gray-900 uppercase tracking-tighter leading-tight line-clamp-2">{resource.title}</h3>
                                        <p className="text-xs font-medium text-gray-500 line-clamp-2 leading-relaxed">{resource.description || 'No description.'}</p>
                                        {resource.folder_name && (
                                            <div className="flex items-center gap-1.5 text-[10px] font-black text-amber-600 uppercase tracking-wider">
                                                <Folder className="w-3 h-3" /> {resource.folder_name}
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        <span>{resource.uploaded_by_name?.split(' ')[0]}</span>
                                        <span>{new Date(resource.created_at).toLocaleDateString()}</span>
                                    </div>

                                    <div className="mt-4 flex gap-2 relative z-10">
                                        <Button
                                            onClick={() => handleDownload(resource)}
                                            className="flex-1 px-4 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest gap-2 py-5 shadow-lg shadow-primary/10"
                                        >
                                            {resource.resource_type === 'link' ? <ExternalLink className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
                                            {resource.resource_type === 'link' ? 'Open' : 'Download'}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(resource.id)}
                                            disabled={deleting === resource.id}
                                            className="p-4 rounded-[1.25rem] text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all py-5 h-auto"
                                        >
                                            {deleting === resource.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash className="w-4 h-4" />}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl p-24 text-center">
                            <div className="flex flex-col items-center gap-6">
                                <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center border-2 border-dashed border-gray-200">
                                    <BookOpen className="w-12 h-12 text-gray-200" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Empty</h3>
                                    <p className="text-sm font-medium text-gray-500 max-w-sm mx-auto leading-relaxed">
                                        {activeFolderId !== 'root'
                                            ? 'This folder is empty. Upload files or move existing resources here.'
                                            : 'No resources yet. Drop files anywhere on the page to start uploading.'}
                                    </p>
                                </div>
                                <Button onClick={() => setShowUploadPanel(true)} className="px-10 py-6 rounded-2xl shadow-lg shadow-primary/10">
                                    <CloudUpload className="w-4 h-4 mr-2" /> Upload Files
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ══════════════════════════════════════════════════
                Upload Side Panel (Drawer)
            ══════════════════════════════════════════════════ */}
            {showUploadPanel && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
                        onClick={() => !uploadingAll && setShowUploadPanel(false)}
                    />

                    {/* Panel */}
                    <div className="fixed right-0 top-0 h-full w-full max-w-lg z-50 bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">

                        {/* Panel header */}
                        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
                            <div>
                                <h2 className="text-lg font-black text-gray-900 uppercase tracking-tighter">Upload Files</h2>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                                    {activeFolderId !== 'root'
                                        ? `Uploading to: ${folders.find(f => f.id === activeFolderId)?.name}`
                                        : 'Uploading to: Root'}
                                </p>
                            </div>
                            <button
                                onClick={() => !uploadingAll && setShowUploadPanel(false)}
                                className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Drop zone */}
                        <div
                            onDragOver={handlePanelDragOver}
                            onDragLeave={handlePanelDragLeave}
                            onDrop={handlePanelDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`mx-6 mt-6 border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all flex-shrink-0 ${
                                panelDragging ? 'border-primary bg-primary/[0.03]' : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50/50'
                            }`}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                className="hidden"
                                onChange={e => e.target.files && addFilesToQueue(e.target.files)}
                            />
                            <CloudUpload className={`w-10 h-10 mx-auto mb-3 transition-colors ${panelDragging ? 'text-primary' : 'text-gray-300'}`} />
                            <p className="text-xs font-black text-gray-700 uppercase tracking-widest">Drop files here</p>
                            <p className="text-[10px] font-bold text-gray-400 mt-1">or click to browse — select multiple</p>
                        </div>

                        {/* Queue */}
                        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                            {queue.length === 0 && (
                                <p className="text-center text-[10px] font-black text-gray-300 uppercase tracking-widest py-8">Add files above to get started</p>
                            )}

                            {queue.map(item => (
                                <div key={item.id} className={`bg-gray-50 rounded-2xl p-4 flex gap-3 items-start transition-all ${
                                    item.status === 'done' ? 'bg-green-50' : item.status === 'error' ? 'bg-red-50' : ''
                                }`}>
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                                        <ResourceIcon type={item.detectedType} size="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-black text-gray-900 truncate">{item.file.name}</p>
                                        <p className="text-[10px] font-medium text-gray-400 mt-0.5">{formatBytes(item.file.size)}</p>

                                        {/* Progress bar */}
                                        {item.status === 'uploading' && (
                                            <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary rounded-full transition-all duration-200"
                                                    style={{ width: `${item.progress}%` }}
                                                />
                                            </div>
                                        )}

                                        {item.status === 'error' && (
                                            <p className="text-[10px] text-red-500 font-bold mt-1">{item.error}</p>
                                        )}
                                    </div>

                                    {/* Status icon */}
                                    <div className="shrink-0">
                                        {item.status === 'done' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                                        {item.status === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
                                        {item.status === 'uploading' && <Loader2 className="w-5 h-5 text-primary animate-spin" />}
                                        {item.status === 'idle' && (
                                            <button onClick={() => removeFromQueue(item.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                                                <X className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Footer actions */}
                        <div className="px-6 py-6 border-t border-gray-100 flex gap-3">
                            {queue.some(q => q.status === 'done') && (
                                <Button variant="ghost" onClick={clearCompleted} className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                    Clear done
                                </Button>
                            )}
                            <Button
                                onClick={uploadAll}
                                disabled={uploadingAll || !queue.some(q => q.status === 'idle')}
                                className="flex-1 py-6 gap-2 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20"
                            >
                                {uploadingAll ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</>
                                ) : (
                                    <><Sparkles className="w-4 h-4" /> Upload All ({queue.filter(q => q.status === 'idle').length} files)</>
                                )}
                            </Button>
                        </div>
                    </div>
                </>
            )}

            {/* ══════════════════════════════════════════════════
                Move-to-folder modal
            ══════════════════════════════════════════════════ */}
            {movingResource && (
                <>
                    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-8 space-y-6 animate-in zoom-in-95">
                            <div>
                                <h2 className="text-lg font-black text-gray-900 uppercase tracking-tighter">Move Resource</h2>
                                <p className="text-xs text-gray-500 mt-1 font-medium">Choose a destination for <span className="font-black text-gray-800">"{movingResource.title}"</span></p>
                            </div>

                            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                                {/* Root option */}
                                <button
                                    onClick={() => handleMoveResource(null)}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-primary/5 hover:text-primary text-gray-600 transition-all text-left"
                                >
                                    <Home className="w-4 h-4 shrink-0" />
                                    <span className="text-sm font-bold">Root (no folder)</span>
                                </button>

                                {folders.map(folder => (
                                    <button
                                        key={folder.id}
                                        onClick={() => handleMoveResource(folder.id)}
                                        disabled={movingResource.folder === folder.id}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-primary/5 hover:text-primary text-gray-600 transition-all text-left disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        <Folder className="w-4 h-4 text-amber-400 shrink-0" />
                                        <span className="text-sm font-bold">{folder.name}</span>
                                        {movingResource.folder === folder.id && (
                                            <span className="ml-auto text-[10px] font-black text-primary uppercase">Current</span>
                                        )}
                                    </button>
                                ))}
                            </div>

                            <Button variant="ghost" onClick={() => setMovingResource(null)} className="w-full">
                                Cancel
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
