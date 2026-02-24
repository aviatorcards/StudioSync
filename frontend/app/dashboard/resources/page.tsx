'use client'

import { useState, useRef, useCallback } from 'react'
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
    FolderOpen,
    Loader2,
    Image as ImageIcon,
    File,
    Trash2,
    Search,
    Filter,
    X,
    Plus,
    ExternalLink,
    Grid,
    Target,
    BookOpen,
    Sparkles,
    Trash
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogHeader, DialogContent, DialogFooter } from '@/components/ui/dialog'

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
    uploaded_by_name: string
    created_at: string
    file_size?: number
}

export default function ResourcesPage() {
    const { resources, loading, refetch } = useResources()
    const [uploading, setUploading] = useState(false)
    const [showUploadModal, setShowUploadModal] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterType, setFilterType] = useState<ResourceType | 'all'>('all')
    const [deleting, setDeleting] = useState<string | null>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)

    // Upload form state
    const [uploadForm, setUploadForm] = useState({
        title: '',
        description: '',
        resource_type: 'pdf' as ResourceType,
        file: null as File | null,
        external_url: '',
        category: '',
        tags: [] as string[]
    })

    const getIcon = (type: ResourceType, size: string = 'w-6 h-6') => {
        switch (type) {
            case 'audio':
                return <Music className={`${size} text-blue-500`} />
            case 'video':
                return <Video className={`${size} text-red-500`} />
            case 'image':
                return <ImageIcon className={`${size} text-purple-500`} />
            case 'link':
                return <LinkIcon className={`${size} text-green-500`} />
            case 'pdf':
                return <FileText className={`${size} text-orange-500`} />
            default:
                return <File className={`${size} text-gray-500`} />
        }
    }

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)

        const files = Array.from(e.dataTransfer.files)
        if (files.length > 0) {
            const file = files[0]
            handleFileSelect(file)
        }
    }, [])

    const handleFileSelect = (file: File) => {
        let resourceType: ResourceType = 'other'
        if (file.type.startsWith('audio/')) resourceType = 'audio'
        else if (file.type.startsWith('video/')) resourceType = 'video'
        else if (file.type.startsWith('image/')) resourceType = 'image'
        else if (file.type === 'application/pdf') resourceType = 'pdf'

        setUploadForm(prev => ({
            ...prev,
            file,
            resource_type: resourceType,
            title: prev.title || file.name.replace(/\.[^/.]+$/, '')
        }))
        setShowUploadModal(true)
    }

    const handleUpload = async () => {
        if (!uploadForm.title) {
            toast.error('Identity required (title)')
            return
        }

        if (uploadForm.resource_type === 'link' && !uploadForm.external_url) {
            toast.error('External URL required')
            return
        }

        if (uploadForm.resource_type !== 'link' && !uploadForm.file) {
            toast.error('File required')
            return
        }

        setUploading(true)
        try {
            const formData = new FormData()
            formData.append('title', uploadForm.title)
            formData.append('description', uploadForm.description)
            formData.append('resource_type', uploadForm.resource_type)
            formData.append('category', uploadForm.category)
            formData.append('tags', JSON.stringify(uploadForm.tags))

            if (uploadForm.resource_type === 'link') {
                formData.append('external_url', uploadForm.external_url)
            } else if (uploadForm.file) {
                formData.append('file', uploadForm.file)
            }

            await api.post('/resources/library/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })

            toast.success('Resource uploaded successfully')
            setShowUploadModal(false)
            setUploadForm({
                title: '',
                description: '',
                resource_type: 'pdf',
                file: null,
                external_url: '',
                category: '',
                tags: []
            })
            refetch()
        } catch (error: any) {
            console.error('Upload failed:', error)
            toast.error(error.response?.data?.message || 'Upload failed')
        } finally {
            setUploading(false)
        }
    }

    const handleDownload = async (resource: Resource) => {
        if (resource.resource_type === 'link') {
            window.open(resource.external_url, '_blank')
            return
        }

        if (!resource.file_url) {
            toast.error('File URL unavailable')
            return
        }

        try {
            window.open(resource.file_url, '_blank')
            toast.success('Download started')
        } catch (error) {
            console.error('Download failed:', error)
            toast.error('Download failed')
        }
    }

    const handleDelete = async (resourceId: string) => {
        if (!confirm('Are you sure you want to delete this resource?')) {
            return
        }

        setDeleting(resourceId)
        try {
            await api.delete(`/resources/library/${resourceId}/`)
            toast.success('Resource deleted')
            refetch()
        } catch (error) {
            console.error('Delete failed:', error)
            toast.error('Delete failed')
        } finally {
            setDeleting(null)
        }
    }

    const filteredResources = resources.filter((resource: Resource) => {
        const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            resource.description.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesFilter = filterType === 'all' || resource.resource_type === filterType
        return matchesSearch && matchesFilter
    })

    const resourceTypes: { value: ResourceType | 'all'; label: string }[] = [
        { value: 'all', label: 'All Resources' },
        { value: 'pdf', label: 'PDF Documents' },
        { value: 'audio', label: 'Audio Files' },
        { value: 'video', label: 'Video Files' },
        { value: 'image', label: 'Images' },
        { value: 'link', label: 'Links' },
        { value: 'other', label: 'Other' }
    ]

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-in fade-in duration-500">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Loading Library...</p>
            </div>
        )
    }

    return (
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4">
                <div className="space-y-2">
                    <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        Resources Library
                        <div className="bg-primary/10 px-3 py-1 rounded-full text-xs font-black text-primary uppercase tracking-widest">
                            {resources.length} Resources
                        </div>
                    </h1>
                    <p className="text-gray-500 font-medium max-w-lg">Access and manage all your teaching materials and files.</p>
                </div>
                <Button
                    onClick={() => setShowUploadModal(true)}
                    className="gap-2 hover:scale-105 shadow-xl shadow-primary/20 transition-all py-6 px-10 font-black uppercase tracking-widest text-[10px]"
                >
                    <Upload className="w-4 h-4" />
                    Upload Resource
                </Button>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                 {[
                    { label: 'Total Resources', value: resources.length, icon: Grid, color: 'blue' },
                    { label: 'Files', value: resources.filter((r: Resource) => r.file).length, icon: File, color: 'emerald' },
                    { label: 'Links', value: resources.filter((r: Resource) => r.resource_type === 'link').length, icon: LinkIcon, color: 'purple' },
                    { label: 'Collections', value: new Set(resources.map((r: Resource) => r.category).filter(Boolean)).size, icon: Target, color: 'orange' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                         <div className="flex items-center justify-between mb-4">
                            <div className={`w-10 h-10 bg-${stat.color}-50 rounded-xl flex items-center justify-center text-${stat.color}-600 group-hover:scale-110 transition-transform`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest">System Stat</div>
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight uppercase tracking-tighter">{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* Controls */}
            <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-3xl border border-gray-100 shadow-xl">
                    <div className="relative flex-1 w-full max-w-xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by title, tags, or description..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-transparent focus:bg-white border-2 focus:border-primary rounded-2xl font-bold text-sm text-gray-700 outline-none transition-all"
                        />
                    </div>
                    <div className="flex p-1 bg-gray-50 rounded-2xl border border-gray-100 overflow-x-auto w-full md:w-auto no-scrollbar">
                        {resourceTypes.slice(0, 4).map(type => (
                            <button
                                key={type.value}
                                onClick={() => setFilterType(type.value)}
                                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                    filterType === type.value
                                        ? 'bg-white text-primary shadow-sm'
                                        : 'text-gray-400 hover:text-gray-600'
                                }`}
                            >
                                {type.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Grid */}
            {filteredResources.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredResources.map((resource: Resource) => (
                        <div
                            key={resource.id}
                            className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group relative overflow-hidden flex flex-col"
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-primary/5 transition-colors" />
                            
                            <div className="flex items-start justify-between mb-8 relative z-10">
                                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center border-2 border-white shadow-sm group-hover:scale-110 transition-transform">
                                    {getIcon(resource.resource_type, 'w-6 h-6')}
                                </div>
                                <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest group-hover:text-primary transition-colors">
                                    {resource.resource_type}
                                </div>
                            </div>

                            <div className="flex-1 space-y-2 relative z-10">
                                <h3 className="text-base font-black text-gray-900 uppercase tracking-tighter leading-tight line-clamp-2">
                                    {resource.title}
                                </h3>
                                <p className="text-xs font-medium text-gray-500 line-clamp-3 leading-relaxed">
                                    {resource.description || 'No description provided.'}
                                </p>
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                <span>{resource.uploaded_by_name?.split(' ')[0]}</span>
                                <span>{new Date(resource.created_at).toLocaleDateString()}</span>
                            </div>

                            <div className="mt-6 flex gap-2 relative z-10">
                                <Button
                                    onClick={() => handleDownload(resource)}
                                    className="flex-1 px-4 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest gap-2 py-6 shadow-lg shadow-primary/10"
                                >
                                    {resource.resource_type === 'link' ? <ExternalLink className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
                                    {resource.resource_type === 'link' ? 'Open' : 'Download'}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDelete(resource.id)}
                                    disabled={deleting === resource.id}
                                    className="p-4 rounded-[1.25rem] text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all py-6 h-auto"
                                >
                                    {deleting === resource.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Trash className="w-4 h-4" />
                                    )}
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
                            <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Library Empty</h3>
                            <p className="text-sm font-medium text-gray-500 max-w-sm mx-auto leading-relaxed">
                                No resources matched your current search. Try adjusting your filters or upload a new resource.
                            </p>
                        </div>
                        <Button
                            onClick={() => setShowUploadModal(true)}
                            className="px-10 py-6 rounded-2xl shadow-lg shadow-primary/10"
                        >
                            <Plus className="w-4 h-4 mr-1" />
                            Upload New Resource
                        </Button>
                    </div>
                </div>
            )}

            {/* Upload Modal */}
            <Dialog
                open={showUploadModal}
                onOpenChange={setShowUploadModal}
                size="lg"
            >
                <DialogHeader title="Upload Resource" />
                <DialogContent>
                    <div className="space-y-8">
                            {/* Resource Type */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Resource Type</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {(['pdf', 'audio', 'video', 'image', 'link', 'other'] as ResourceType[]).map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setUploadForm(prev => ({ ...prev, resource_type: type }))}
                                            className={`p-5 rounded-2xl border-2 transition-all group flex flex-col items-center gap-3 ${
                                                uploadForm.resource_type === type
                                                    ? 'border-primary bg-primary/[0.03] text-primary'
                                                    : 'border-gray-50 bg-gray-50/30 hover:bg-gray-50 hover:border-gray-200'
                                            }`}
                                        >
                                            <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                                                {getIcon(type, 'w-5 h-5')}
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest">{type}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Payload Area */}
                            {uploadForm.resource_type === 'link' ? (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">External Reference (URL)</label>
                                    <div className="relative">
                                         <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                         <input
                                            type="url"
                                            value={uploadForm.external_url}
                                            onChange={(e) => setUploadForm(prev => ({ ...prev, external_url: e.target.value }))}
                                            placeholder="https://apexmusic.com/ref/102"
                                            className="w-full pl-12 pr-6 py-4 bg-gray-50 border-transparent border-2 focus:border-primary focus:bg-white rounded-2xl outline-none font-bold text-gray-900 transition-all placeholder:text-gray-300"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Upload File</label>
                                    <div
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                        onClick={() => !uploadForm.file && fileInputRef.current?.click()}
                                        className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer group ${
                                            isDragging ? 'border-primary bg-primary/[0.02]' : 'border-gray-100 bg-gray-50/30 hover:border-gray-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                                            className="hidden"
                                        />
                                        {uploadForm.file ? (
                                            <div className="flex items-center justify-center gap-6 animate-in zoom-in-95">
                                                <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center group-hover:rotate-6 transition-transform">
                                                    {getIcon(uploadForm.resource_type, 'w-8 h-8')}
                                                </div>
                                                <div className="text-left space-y-1">
                                                    <p className="text-sm font-black text-gray-900 uppercase tracking-tighter line-clamp-1">{uploadForm.file.name}</p>
                                                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">
                                                        {(uploadForm.file.size / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setUploadForm(prev => ({ ...prev, file: null }))
                                                    }}
                                                    className="p-3 hover:bg-red-50 hover:text-red-500 rounded-xl"
                                                >
                                                    <X className="w-5 h-5" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto group-hover:-translate-y-2 transition-transform">
                                                    <Upload className="w-6 h-6 text-gray-300 group-hover:text-primary transition-colors" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xs font-black text-gray-900 uppercase tracking-widest">Drop file here</p>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">or click to browse files</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Metadata */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={uploadForm.title}
                                        onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                                        placeholder="Enter resource title..."
                                        className="w-full px-6 py-4 bg-gray-50 border-transparent border-2 focus:border-primary focus:bg-white rounded-2xl outline-none font-bold text-gray-900 transition-all"
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</label>
                                    <textarea
                                        value={uploadForm.description}
                                        onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Add a brief description..."
                                        rows={3}
                                        className="w-full px-6 py-4 bg-gray-50 border-transparent border-2 focus:border-primary focus:bg-white rounded-2xl outline-none font-bold text-gray-900 transition-all resize-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Folder / Collection</label>
                                    <input
                                        type="text"
                                        value={uploadForm.category}
                                        onChange={(e) => setUploadForm(prev => ({ ...prev, category: e.target.value }))}
                                        placeholder="e.g. Piano Exercises, Sheet Music..."
                                        className="w-full px-6 py-4 bg-gray-50 border-transparent border-2 focus:border-primary focus:bg-white rounded-2xl outline-none font-bold text-gray-900 transition-all"
                                    />
                                </div>
                            </div>
                    </div>
                </DialogContent>
                <DialogFooter>
                    <Button
                        variant="ghost"
                        onClick={() => setShowUploadModal(false)}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleUpload}
                        disabled={uploading}
                        className="flex-[2] gap-2 active:scale-95 transition-transform"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4" />
                                Upload Resource
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </Dialog>
        </div>
    )
}
