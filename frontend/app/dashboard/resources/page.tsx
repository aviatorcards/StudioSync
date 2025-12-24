'use client'

import { useState } from 'react'
import { useResources, useLessonPlans } from '@/hooks/useDashboardData'
import {
    FileText,
    Music,
    Video,
    Link as LinkIcon,
    Download,
    Plus,
    BookOpen,
    Loader2,
    MoreVertical,
    Upload,
    FolderOpen
} from 'lucide-react'

export default function ResourcesPage() {
    const [activeTab, setActiveTab] = useState<'library' | 'plans'>('library')
    const { resources, loading: loadingResources } = useResources()
    const { plans, loading: loadingPlans } = useLessonPlans()

    const getIcon = (type: string) => {
        switch (type) {
            case 'audio': return <Music className="w-6 h-6 text-blue-500" />
            case 'video': return <Video className="w-6 h-6 text-red-500" />
            case 'link': return <LinkIcon className="w-6 h-6 text-purple-500" />
            default: return <FileText className="w-6 h-6 text-orange-500" />
        }
    }

    if (loadingResources && loadingPlans) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                <Loader2 className="w-10 h-10 text-[#F39C12] animate-spin mb-4" />
                <p className="text-gray-500 font-bold tracking-[0.2em] uppercase text-xs">Loading Resources...</p>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto px-4 pb-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Resources & Plans</h1>
                    <p className="text-lg text-gray-500 mt-2 font-medium">Manage teaching materials and curriculum library.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => alert("File upload modal coming soon!")}
                        className="px-5 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2 font-bold shadow-sm active:scale-95"
                    >
                        <Upload className="w-4 h-4" />
                        Upload Resource
                    </button>
                    <button
                        onClick={() => alert("Lesson Plan Builder coming soon!")}
                        className="px-5 py-3 bg-[#F39C12] text-white rounded-xl hover:bg-[#E67E22] transition-all flex items-center gap-2 font-bold shadow-lg hover:scale-105 active:scale-95"
                    >
                        <BookOpen className="w-4 h-4" />
                        Create Plan
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden">
                <nav className="flex border-b border-gray-100 bg-gray-50/30">
                    <button
                        onClick={() => setActiveTab('library')}
                        className={`flex-1 py-5 px-6 font-black text-sm uppercase tracking-widest transition-all ${activeTab === 'library'
                                ? 'bg-white text-[#F39C12] border-b-4 border-[#F39C12]'
                                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50/50'
                            }`}
                    >
                        Resource Library
                    </button>
                    <button
                        onClick={() => setActiveTab('plans')}
                        className={`flex-1 py-5 px-6 font-black text-sm uppercase tracking-widest transition-all ${activeTab === 'plans'
                                ? 'bg-white text-[#F39C12] border-b-4 border-[#F39C12]'
                                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50/50'
                            }`}
                    >
                        Lesson Plans
                    </button>
                </nav>

                {/* Content */}
                <div className="min-h-[500px]">
                    {activeTab === 'library' ? (
                        <div className="p-8">
                            {loadingResources ? (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <Loader2 className="w-8 h-8 text-[#F39C12] animate-spin mb-3" />
                                    <p className="text-gray-400 font-semibold text-sm">Loading resources...</p>
                                </div>
                            ) : resources.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {resources.map((resource: any) => (
                                        <div key={resource.id} className="group relative bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden">
                                            {/* Decorative Gradient */}
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-100/30 to-transparent rounded-bl-[3rem] group-hover:scale-150 transition-transform duration-500" />

                                            <div className="relative z-10">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-50 rounded-xl flex items-center justify-center border border-orange-200 shadow-inner group-hover:rotate-12 transition-transform">
                                                        {getIcon(resource.resource_type)}
                                                    </div>
                                                    <button className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-all">
                                                        <MoreVertical className="w-5 h-5" />
                                                    </button>
                                                </div>
                                                <h3 className="font-black text-gray-900 truncate mb-2 text-lg group-hover:text-[#F39C12] transition-colors">{resource.title}</h3>
                                                <p className="text-xs text-gray-400 mb-4 font-semibold uppercase tracking-wider">{resource.mime_type || 'Unknown Type'}</p>
                                                <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold pt-4 border-t border-gray-100">
                                                    <span className="truncate">{resource.uploaded_by_name}</span>
                                                    <span>•</span>
                                                    <span>{new Date(resource.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <button className="mt-4 w-full py-2.5 bg-gray-50 hover:bg-[#F39C12] hover:text-white rounded-xl text-sm font-black uppercase tracking-widest text-gray-500 transition-all flex items-center justify-center gap-2 active:scale-95">
                                                    <Download className="w-4 h-4" />
                                                    Download
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center border-2 border-dashed border-gray-200 mb-6">
                                        <FolderOpen className="w-12 h-12 text-gray-200" />
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900 mb-2">No resources yet</h3>
                                    <p className="text-gray-400 font-medium mb-6">Upload files for easy access during lessons</p>
                                    <button
                                        onClick={() => alert("File upload modal coming soon!")}
                                        className="px-6 py-3 text-[#F39C12] font-black uppercase tracking-widest text-xs border-2 border-[#F39C12]/20 rounded-xl hover:bg-[#F39C12]/5 transition-all"
                                    >
                                        + Upload First Resource
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="p-8">
                            {loadingPlans ? (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <Loader2 className="w-8 h-8 text-[#F39C12] animate-spin mb-3" />
                                    <p className="text-gray-400 font-semibold text-sm">Loading plans...</p>
                                </div>
                            ) : plans.length > 0 ? (
                                <div className="space-y-4">
                                    {plans.map((plan: any) => (
                                        <div key={plan.id} className="group bg-white border border-gray-100 rounded-[2rem] p-6 hover:shadow-lg transition-all hover:-translate-y-1">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h3 className="font-black text-gray-900 text-lg mb-2 group-hover:text-[#F39C12] transition-colors">{plan.title}</h3>
                                                    <p className="text-sm text-gray-600 line-clamp-2 mb-4 font-medium">{plan.description}</p>
                                                    <div className="flex flex-wrap gap-2 mb-4">
                                                        {plan.tags.map((tag: string) => (
                                                            <span key={tag} className="px-3 py-1 bg-gray-50 text-gray-600 text-xs rounded-lg font-bold border border-gray-100">{tag}</span>
                                                        ))}
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm text-gray-500 font-semibold">
                                                        <span className="flex items-center gap-1.5">
                                                            <span className="w-1.5 h-1.5 bg-[#F39C12] rounded-full"></span>
                                                            {plan.estimated_duration_minutes} min
                                                        </span>
                                                        <span className="capitalize">{plan.difficulty_level}</span>
                                                    </div>
                                                </div>
                                                <button className="p-3 hover:bg-gray-100 rounded-xl transition-all text-gray-400 hover:text-gray-600">
                                                    <MoreVertical className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center border-2 border-dashed border-gray-200 mb-6">
                                        <BookOpen className="w-12 h-12 text-gray-200" />
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900 mb-2">No lesson plans created</h3>
                                    <p className="text-gray-400 font-medium mb-6">Build reusable plans combining your resources</p>
                                    <button
                                        onClick={() => alert("Lesson Plan Builder coming soon!")}
                                        className="px-6 py-3 text-[#F39C12] font-black uppercase tracking-widest text-xs border-2 border-[#F39C12]/20 rounded-xl hover:bg-[#F39C12]/5 transition-all"
                                    >
                                        + Create First Plan
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
