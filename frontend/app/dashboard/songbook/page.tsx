'use client'

import { useState, useRef, useCallback } from 'react'
import { useResources } from '@/hooks/useDashboardData'
import api from '@/services/api'
import { toast } from 'react-hot-toast'
import {
    FileText,
    Music,
    Download,
    Upload,
    Loader2,
    Search,
    X,
    Plus,
    ExternalLink,
    Trash,
    FileMusic,
    Guitar,
    Piano,
    Mic,
    Drum,
    Music2,
    BookOpen,
    Filter,
    Share2,
    Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogHeader, DialogContent, DialogFooter } from '@/components/ui/dialog'
import { proxyFileUrl } from '@/lib/utils'

type MusicResourceType = 'sheet_music' | 'chord_chart' | 'tablature' | 'lyrics'
type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'professional'

interface SongbookResource {
    id: string
    title: string
    description: string
    resource_type: MusicResourceType
    file: string | null
    file_url: string | null
    tags: string[]
    category: string
    uploaded_by_name: string
    created_at: string
    instrument: string
    composer: string
    key_signature: string
    tempo: string
}

const INSTRUMENTS = [
    { value: 'Piano', icon: Piano, color: 'blue' },
    { value: 'Guitar', icon: Guitar, color: 'orange' },
    { value: 'Bass', icon: Music2, color: 'purple' },
    { value: 'Drums', icon: Drum, color: 'red' },
    { value: 'Voice', icon: Mic, color: 'green' },
    { value: 'Violin', icon: Music, color: 'pink' },
    { value: 'Other', icon: Music2, color: 'gray' }
]


const RESOURCE_TYPES: { value: MusicResourceType; label: string; icon: any }[] = [
    { value: 'sheet_music', label: 'Sheet Music', icon: FileMusic },
    { value: 'chord_chart', label: 'Chord Chart', icon: Music },
    { value: 'tablature', label: 'Tablature', icon: Guitar },
    { value: 'lyrics', label: 'Lyrics', icon: FileText }
]

export default function SongbookPage() {
    const { resources, loading, refetch } = useResources()
    const [uploading, setUploading] = useState(false)
    const [showUploadModal, setShowUploadModal] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterInstrument, setFilterInstrument] = useState<string>('all')
    const [filterType, setFilterType] = useState<MusicResourceType | 'all'>('all')
    const [deleting, setDeleting] = useState<string | null>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)

    // Upload form state
    const [uploadForm, setUploadForm] = useState({
        title: '',
        description: '',
        resource_type: 'sheet_music' as MusicResourceType,
        file: null as File | null,
        category: '',
        tags: [] as string[],
        instrument: '',
        composer: '',
        key_signature: '',
        tempo: ''
    })

    // Filter only music resources
    const musicResources = resources.filter((r: any) => 
        ['sheet_music', 'chord_chart', 'tablature', 'lyrics'].includes(r.resource_type)
    )

    const getInstrumentIcon = (instrument: string) => {
        const inst = INSTRUMENTS.find(i => i.value.toLowerCase() === instrument.toLowerCase())
        return inst || INSTRUMENTS[INSTRUMENTS.length - 1]
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
        setUploadForm(prev => ({
            ...prev,
            file,
            title: prev.title || file.name.replace(/\.[^/.]+$/, '')
        }))
        setShowUploadModal(true)
    }

    const handleUpload = async () => {
        if (!uploadForm.title) {
            toast.error('Title is required')
            return
        }

        if (!uploadForm.file) {
            toast.error('File is required')
            return
        }

        if (!uploadForm.instrument) {
            toast.error('Instrument is required for songbook items')
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
            formData.append('instrument', uploadForm.instrument)
            formData.append('key_signature', uploadForm.key_signature)
            formData.append('tempo', uploadForm.tempo)
            formData.append('file', uploadForm.file)

            await api.post('/resources/library/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })

            toast.success('Chart uploaded successfully!')
            setShowUploadModal(false)
            setUploadForm({
                title: '',
                description: '',
                resource_type: 'sheet_music',
                file: null,
                category: '',
                tags: [],
                instrument: '',
                composer: '',
                key_signature: '',
                tempo: ''
            })
            refetch()
        } catch (error: any) {
            console.error('Upload failed:', error)
            toast.error(error.response?.data?.message || 'Upload failed')
        } finally {
            setUploading(false)
        }
    }

    const handleDownload = async (resource: SongbookResource) => {
        if (!resource.file_url) {
            toast.error('File URL unavailable')
            return
        }

        try {
            const downloadUrl = proxyFileUrl(resource.file_url)
            if (downloadUrl) {
                window.open(downloadUrl, '_blank')
                toast.success('Opening chart...')
            } else {
                toast.error('Could not generate chart URL')
            }
        } catch (error) {
            console.error('Download failed:', error)
            toast.error('Download failed')
        }
    }

    const handleDelete = async (resourceId: string) => {
        if (!confirm('Are you sure you want to delete this chart?')) {
            return
        }

        setDeleting(resourceId)
        try {
            await api.delete(`/resources/library/${resourceId}/`)
            toast.success('Chart deleted')
            refetch()
        } catch (error) {
            console.error('Delete failed:', error)
            toast.error('Delete failed')
        } finally {
            setDeleting(null)
        }
    }

    const filteredResources = musicResources.filter((resource: SongbookResource) => {
        const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            resource.composer?.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesInstrument = filterInstrument === 'all' || resource.instrument === filterInstrument
        const matchesType = filterType === 'all' || resource.resource_type === filterType
        return matchesSearch && matchesInstrument && matchesType
    })

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-in fade-in duration-500">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Loading Songbook...</p>
            </div>
        )
    }

    return (
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4">
                <div className="space-y-2">
                    <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <Music className="w-8 h-8 text-primary" />
                        Songbook
                        <div className="bg-primary/10 px-3 py-1 rounded-full text-xs font-black text-primary uppercase tracking-widest">
                            {musicResources.length} Charts
                        </div>
                    </h1>
                    <p className="text-gray-500 font-medium max-w-lg">Manage sheet music, chord charts, and tablature for your students.</p>
                </div>
                <Button
                    onClick={() => setShowUploadModal(true)}
                    className="gap-2 hover:scale-105 shadow-xl shadow-primary/20 transition-all py-6 px-10 font-black uppercase tracking-widest text-[10px]"
                >
                    <Upload className="w-4 h-4" />
                    Upload Chart
                </Button>
            </header>

            {/* Filters */}
            <div className="flex flex-col gap-4">
                {/* Search */}
                <div className="relative w-full max-w-xl">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by title, composer, or description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-100 focus:border-primary rounded-2xl font-bold text-sm text-gray-700 outline-none transition-all shadow-sm"
                    />
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap gap-3">
                    {/* Instrument Filter */}
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border-2 border-gray-100 shadow-sm">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select
                            value={filterInstrument}
                            onChange={(e) => setFilterInstrument(e.target.value)}
                            className="bg-transparent text-sm font-bold text-gray-700 outline-none cursor-pointer"
                        >
                            <option value="all">All Instruments</option>
                            {INSTRUMENTS.map(inst => (
                                <option key={inst.value} value={inst.value}>{inst.value}</option>
                            ))}
                        </select>
                    </div>


                    {/* Type Filter */}
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border-2 border-gray-100 shadow-sm">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value as MusicResourceType | 'all')}
                            className="bg-transparent text-sm font-bold text-gray-700 outline-none cursor-pointer"
                        >
                            <option value="all">All Types</option>
                            {RESOURCE_TYPES.map(type => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Grid */}
            {filteredResources.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredResources.map((resource: SongbookResource) => {
                        const instInfo = getInstrumentIcon(resource.instrument)
                        const Icon = instInfo.icon
                        
                        return (
                            <div
                                key={resource.id}
                                className="bg-white rounded-[2rem] border-2 border-gray-100 p-6 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group relative overflow-hidden flex flex-col"
                            >
                                {/* Instrument Badge */}
                                <div className={`absolute top-4 right-4 w-12 h-12 bg-${instInfo.color}-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                    <Icon className={`w-6 h-6 text-${instInfo.color}-600`} />
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

                                    {/* Metadata */}
                                    <div className="flex flex-wrap gap-2">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-${instInfo.color}-50 text-${instInfo.color}-700`}>
                                            {resource.instrument}
                                        </span>
                                        {resource.key_signature && (
                                            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-700">
                                                Key: {resource.key_signature}
                                            </span>
                                        )}
                                    </div>

                                    {resource.description && (
                                        <p className="text-xs font-medium text-gray-500 line-clamp-2 leading-relaxed">
                                            {resource.description}
                                        </p>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    <span>{resource.uploaded_by_name?.split(' ')[0]}</span>
                                    <span>{new Date(resource.created_at).toLocaleDateString()}</span>
                                </div>

                                {/* Actions */}
                                <div className="mt-4 flex gap-2">
                                    <Button
                                        onClick={() => handleDownload(resource)}
                                        className="flex-1 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest gap-2 py-5 shadow-lg shadow-primary/10"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        Download
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(resource.id)}
                                        disabled={deleting === resource.id}
                                        className="p-4 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all h-auto"
                                    >
                                        {deleting === resource.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Trash className="w-4 h-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="bg-white rounded-[3rem] border-2 border-gray-100 shadow-xl p-24 text-center">
                    <div className="flex flex-col items-center gap-6">
                        <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center border-2 border-dashed border-gray-200">
                            <BookOpen className="w-12 h-12 text-gray-200" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Songbook Empty</h3>
                            <p className="text-sm font-medium text-gray-500 max-w-sm mx-auto leading-relaxed">
                                No charts match your filters. Try adjusting your search or upload a new chart.
                            </p>
                        </div>
                        <Button
                            onClick={() => setShowUploadModal(true)}
                            className="px-10 py-6 rounded-2xl shadow-lg shadow-primary/10"
                        >
                            <Plus className="w-4 h-4 mr-1" />
                            Upload Chart
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
                <DialogHeader title="Upload Chart" />
                <DialogContent>
                    <div className="space-y-6">
                        {/* Resource Type */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Chart Type</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {RESOURCE_TYPES.map(type => {
                                    const TypeIcon = type.icon
                                    return (
                                        <button
                                            key={type.value}
                                            onClick={() => setUploadForm(prev => ({ ...prev, resource_type: type.value }))}
                                            className={`p-4 rounded-xl border-2 transition-all group flex flex-col items-center gap-2 ${
                                                uploadForm.resource_type === type.value
                                                    ? 'border-primary bg-primary/5 text-primary'
                                                    : 'border-gray-100 bg-gray-50/30 hover:bg-gray-50 hover:border-gray-200'
                                            }`}
                                        >
                                            <TypeIcon className="w-6 h-6" />
                                            <span className="text-[9px] font-black uppercase tracking-widest text-center">{type.label}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* File Upload */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">File</label>
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => !uploadForm.file && fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer group ${
                                    isDragging ? 'border-primary bg-primary/5' : 'border-gray-200 bg-gray-50/30 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                                    className="hidden"
                                />
                                {uploadForm.file ? (
                                    <div className="flex items-center justify-center gap-4">
                                        <FileMusic className="w-10 h-10 text-primary" />
                                        <div className="text-left space-y-1">
                                            <p className="text-sm font-black text-gray-900">{uploadForm.file.name}</p>
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
                                            className="p-2 hover:bg-red-50 hover:text-red-500 rounded-lg"
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <Upload className="w-10 h-10 text-gray-300 mx-auto group-hover:text-primary transition-colors" />
                                        <div className="space-y-1">
                                            <p className="text-xs font-black text-gray-900 uppercase tracking-widest">Drop file here</p>
                                            <p className="text-[10px] font-bold text-gray-400">or click to browse</p>
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
                                    required
                                    value={uploadForm.title}
                                    onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="Song or piece title..."
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-xl outline-none font-bold text-gray-900 transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Instrument *</label>
                                <select
                                    value={uploadForm.instrument}
                                    onChange={(e) => setUploadForm(prev => ({ ...prev, instrument: e.target.value }))}
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-xl outline-none font-bold text-gray-900 transition-all"
                                >
                                    <option value="">Select instrument...</option>
                                    {INSTRUMENTS.map(inst => (
                                        <option key={inst.value} value={inst.value}>{inst.value}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Composer/Artist</label>
                                <input
                                    type="text"
                                    value={uploadForm.composer}
                                    onChange={(e) => setUploadForm(prev => ({ ...prev, composer: e.target.value }))}
                                    placeholder="e.g. Beethoven, The Beatles..."
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-xl outline-none font-bold text-gray-900 transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Key Signature</label>
                                <input
                                    type="text"
                                    value={uploadForm.key_signature}
                                    onChange={(e) => setUploadForm(prev => ({ ...prev, key_signature: e.target.value }))}
                                    placeholder="e.g. C, Am, G major..."
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-xl outline-none font-bold text-gray-900 transition-all"
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</label>
                                <textarea
                                    value={uploadForm.description}
                                    onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Add notes about this chart..."
                                    rows={3}
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-xl outline-none font-bold text-gray-900 transition-all resize-none"
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
                                <Upload className="w-4 h-4" />
                                Upload Chart
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </Dialog>
        </div>
    )
}
