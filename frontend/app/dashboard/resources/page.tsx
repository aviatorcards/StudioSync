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
    ExternalLink
} from 'lucide-react'
import Modal from '@/components/Modal'
import { Button } from '@/components/ui/button'

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
        // Determine resource type from mime type
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
            toast.error('Please enter a title')
            return
        }

        if (uploadForm.resource_type === 'link' && !uploadForm.external_url) {
            toast.error('Please enter a URL for link resources')
            return
        }

        if (uploadForm.resource_type !== 'link' && !uploadForm.file) {
            toast.error('Please select a file to upload')
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
            toast.error(error.response?.data?.message || 'Failed to upload resource')
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
            toast.error('No file available for download')
            return
        }

        try {
            // Open file in new tab for download
            window.open(resource.file_url, '_blank')
            toast.success('Download started')
        } catch (error) {
            console.error('Download failed:', error)
            toast.error('Failed to download file')
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
            toast.error('Failed to delete resource')
        } finally {
            setDeleting(null)
        }
    }

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return 'Unknown size'
        const kb = bytes / 1024
        const mb = kb / 1024
        if (mb > 1) return `${mb.toFixed(1)} MB`
        return `${kb.toFixed(1)} KB`
    }

    const filteredResources = resources.filter((resource: Resource) => {
        const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            resource.description.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesFilter = filterType === 'all' || resource.resource_type === filterType
        return matchesSearch && matchesFilter
    })

    const resourceTypes: { value: ResourceType | 'all'; label: string }[] = [
        { value: 'all', label: 'All' },
        { value: 'pdf', label: 'PDFs' },
        { value: 'audio', label: 'Audio' },
        { value: 'video', label: 'Video' },
        { value: 'image', label: 'Images' },
        { value: 'link', label: 'Links' },
        { value: 'other', label: 'Other' }
    ]

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-[#F39C12] animate-spin mb-4" />
                <p className="text-gray-500 font-bold tracking-wider uppercase text-xs">Loading Resources...</p>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Resource Library</h1>
                <p className="text-sm text-gray-600 mt-1">Upload and manage teaching materials</p>
            </div>

            {/* Upload Button */}
            <button
                onClick={() => setShowUploadModal(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#F39C12] text-white rounded-lg hover:bg-[#E67E22] transition-colors font-medium shadow-sm"
            >
                <Upload className="w-5 h-5" />
                Upload Resource
            </button>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <p className="text-xs font-medium text-gray-600 uppercase">Total Resources</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{resources.length}</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <p className="text-xs font-medium text-gray-600 uppercase">Files</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                        {resources.filter((r: Resource) => r.file).length}
                    </p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <p className="text-xs font-medium text-gray-600 uppercase">Links</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                        {resources.filter((r: Resource) => r.resource_type === 'link').length}
                    </p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <p className="text-xs font-medium text-gray-600 uppercase">Categories</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                        {new Set(resources.map((r: Resource) => r.category).filter(Boolean)).size}
                    </p>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search resources..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                    {resourceTypes.map(type => (
                        <button
                            key={type.value}
                            onClick={() => setFilterType(type.value)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                                filterType === type.value
                                    ? 'bg-[#F39C12] text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {type.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Resources Grid */}
            {filteredResources.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredResources.map((resource: Resource) => (
                        <div
                            key={resource.id}
                            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start gap-3">
                                <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200 shrink-0">
                                    {getIcon(resource.resource_type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 truncate">{resource.title}</h3>
                                    <p className="text-xs text-gray-500 uppercase mt-0.5">
                                        {resource.resource_type}
                                    </p>
                                </div>
                            </div>

                            {resource.description && (
                                <p className="text-sm text-gray-600 mt-3 line-clamp-2">{resource.description}</p>
                            )}

                            <div className="mt-3 flex flex-wrap gap-1">
                                {resource.tags.slice(0, 3).map((tag, idx) => (
                                    <span
                                        key={idx}
                                        className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                                <span>{resource.uploaded_by_name}</span>
                                <span>{new Date(resource.created_at).toLocaleDateString()}</span>
                            </div>

                            <div className="mt-3 flex gap-2">
                                <button
                                    onClick={() => handleDownload(resource)}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#F39C12] text-white rounded-lg hover:bg-[#E67E22] transition-colors text-sm font-medium"
                                >
                                    {resource.resource_type === 'link' ? (
                                        <>
                                            <ExternalLink className="w-4 h-4" />
                                            Open
                                        </>
                                    ) : (
                                        <>
                                            <Download className="w-4 h-4" />
                                            Download
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => handleDelete(resource.id)}
                                    disabled={deleting === resource.id}
                                    className="px-3 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors disabled:opacity-50"
                                >
                                    {deleting === resource.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <FolderOpen className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {searchQuery || filterType !== 'all' ? 'No resources found' : 'No resources yet'}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                        {searchQuery || filterType !== 'all'
                            ? 'Try adjusting your search or filters'
                            : 'Upload your first resource to get started'}
                    </p>
                    {!searchQuery && filterType === 'all' && (
                        <button
                            onClick={() => setShowUploadModal(true)}
                            className="px-6 py-2 bg-[#F39C12] text-white rounded-lg hover:bg-[#E67E22] transition-colors font-medium"
                        >
                            Upload Resource
                        </button>
                    )}
                </div>
            )}

            {/* Upload Modal */}
            {showUploadModal && (
                <Modal
                    isOpen={showUploadModal}
                    onClose={() => setShowUploadModal(false)}
                    title="Upload Resource"
                    footer={
                        <>
                            <Button
                                variant="outline"
                                onClick={() => setShowUploadModal(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleUpload}
                                disabled={uploading}
                                className="gap-2"
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-4 h-4" />
                                        Upload
                                    </>
                                )}
                            </Button>
                        </>
                    }
                >
                    <div className="space-y-4">
                            {/* Resource Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Resource Type
                                </label>
                                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                    {(['pdf', 'audio', 'video', 'image', 'link', 'other'] as ResourceType[]).map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setUploadForm(prev => ({ ...prev, resource_type: type }))}
                                            className={`p-3 border rounded-lg text-xs font-medium capitalize transition-colors ${
                                                uploadForm.resource_type === type
                                                    ? 'border-primary bg-primary/10 text-primary'
                                                    : 'border-gray-200 hover:bg-gray-50'
                                            }`}
                                        >
                                            <div className="flex flex-col items-center gap-1">
                                                {getIcon(type, 'w-5 h-5')}
                                                {type}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* File Upload / URL Input */}
                            {uploadForm.resource_type === 'link' ? (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        URL *
                                    </label>
                                    <input
                                        type="url"
                                        value={uploadForm.external_url}
                                        onChange={(e) => setUploadForm(prev => ({ ...prev, external_url: e.target.value }))}
                                        placeholder="https://example.com"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    />
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        File *
                                    </label>
                                    <div
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                                            isDragging
                                                ? 'border-primary bg-primary/5'
                                                : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                    >
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                                            className="hidden"
                                        />
                                        {uploadForm.file ? (
                                            <div className="flex items-center justify-center gap-3">
                                                {getIcon(uploadForm.resource_type, 'w-8 h-8')}
                                                <div className="text-left">
                                                    <p className="font-medium text-gray-900">{uploadForm.file.name}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {(uploadForm.file.size / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => setUploadForm(prev => ({ ...prev, file: null }))}
                                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                                <p className="text-gray-600 mb-2">
                                                    Drag and drop your file here, or
                                                </p>
                                                <Button
                                                    onClick={() => fileInputRef.current?.click()}
                                                    type="button"
                                                >
                                                    Browse Files
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    value={uploadForm.title}
                                    onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="Resource title"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={uploadForm.description}
                                    onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Add a description..."
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Category
                                </label>
                                <input
                                    type="text"
                                    value={uploadForm.category}
                                    onChange={(e) => setUploadForm(prev => ({ ...prev, category: e.target.value }))}
                                    placeholder="e.g., Sheet Music, Practice Tracks"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>
                    </div>
                </Modal>
            )}
        </div>
    )
}
