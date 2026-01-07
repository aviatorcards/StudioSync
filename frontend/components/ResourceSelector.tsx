'use client'

import { useState, useEffect } from 'react'
import { X, Search, FileText, Music, Video, Image, Link as LinkIcon, Package, CheckCircle2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useResources } from '@/hooks/useDashboardData'

interface ResourceSelectorProps {
  selectedIds: string[]
  onSelectionChange: (ids: string[]) => void
  isOpen: boolean
  onClose: () => void
}

const RESOURCE_TYPE_ICONS = {
  pdf: FileText,
  audio: Music,
  video: Video,
  image: Image,
  link: LinkIcon,
  physical: Package,
  other: FileText,
}

const RESOURCE_TYPE_COLORS = {
  pdf: 'text-red-600',
  audio: 'text-purple-600',
  video: 'text-blue-600',
  image: 'text-green-600',
  link: 'text-indigo-600',
  physical: 'text-orange-600',
  other: 'text-gray-600',
}

export default function ResourceSelector({ selectedIds, onSelectionChange, isOpen, onClose }: ResourceSelectorProps) {
  const { resources, loading } = useResources()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [localSelectedIds, setLocalSelectedIds] = useState<string[]>(selectedIds)

  useEffect(() => {
    setLocalSelectedIds(selectedIds)
  }, [selectedIds, isOpen])

  const filteredResources = resources.filter((resource: any) => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || resource.resource_type === filterType
    return matchesSearch && matchesType
  })

  const toggleResource = (id: string) => {
    setLocalSelectedIds(prev =>
      prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]
    )
  }

  const handleConfirm = () => {
    onSelectionChange(localSelectedIds)
    onClose()
  }

  const handleCancel = () => {
    setLocalSelectedIds(selectedIds) // Reset to original
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader title="Select Resources" />

        {/* Description */}
        <div className="px-6 -mt-2 mb-4">
          <p className="text-sm text-gray-600">
            Choose resources to attach to this lesson plan
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="pdf">PDFs</option>
            <option value="audio">Audio</option>
            <option value="video">Video</option>
            <option value="image">Images</option>
            <option value="link">Links</option>
            <option value="physical">Physical Items</option>
          </select>
        </div>

        {/* Selected Count */}
        <div className="mb-3 text-sm text-gray-600">
          {localSelectedIds.length} resource{localSelectedIds.length !== 1 ? 's' : ''} selected
        </div>

        {/* Resource List */}
        <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Loading resources...</div>
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Package className="w-12 h-12 mb-2 opacity-50" />
              <p>No resources found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredResources.map((resource: any) => {
                const Icon = RESOURCE_TYPE_ICONS[resource.resource_type as keyof typeof RESOURCE_TYPE_ICONS] || FileText
                const iconColor = RESOURCE_TYPE_COLORS[resource.resource_type as keyof typeof RESOURCE_TYPE_COLORS] || 'text-gray-600'
                const isSelected = localSelectedIds.includes(resource.id)

                return (
                  <div
                    key={resource.id}
                    onClick={() => toggleResource(resource.id)}
                    className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                      isSelected ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isSelected ? 'bg-primary border-primary' : 'border-gray-300'
                      }`}>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </div>

                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 ${iconColor}`}>
                        <Icon className="w-5 h-5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">{resource.title}</h4>
                        {resource.description && (
                          <p className="text-sm text-gray-600 line-clamp-2 mt-1">{resource.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                            {resource.resource_type.toUpperCase()}
                          </span>
                          {resource.category && (
                            <span className="text-xs text-gray-500">{resource.category}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={handleCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
          >
            Add Selected ({localSelectedIds.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
