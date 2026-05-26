'use client'

import { usePublicResources } from '@/hooks/usePublicResources'
import {
    FileText,
    Music,
    Loader2,
    FileMusic,
    Guitar,
    Piano,
    Mic,
    Drum,
    Music2,
    BookOpen,
} from 'lucide-react'

type MusicResourceType = 'sheet_music' | 'chord_chart' | 'tablature' | 'lyrics'

interface PublicResource {
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

export default function LibraryPage() {
    const { resources: publicResources, loading, refetch } = usePublicResources()

    // Filter only music resources
    const musicResources = publicResources.filter((r: any) => 
        ['sheet_music', 'chord_chart', 'tablature', 'lyrics'].includes(r.resource_type)
    )

    const getInstrumentIcon = (instrument: string) => {
        const inst = INSTRUMENTS.find(i => i.value.toLowerCase() === instrument.toLowerCase())
        return inst || INSTRUMENTS[INSTRUMENTS.length - 1]
    }

    const filteredResources = musicResources

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
                        <BookOpen className="w-8 h-8 text-primary" />
                        Library
                        <div className="bg-primary/10 px-3 py-1 rounded-full text-xs font-black text-primary uppercase tracking-widest">
                            {musicResources.length} Charts
                        </div>
                    </h1>
                    <p className="text-gray-500 font-medium max-w-lg">Browse and discover public charts shared by studios.</p>
                </div>
            </header>

            {/* Grid */}
            {filteredResources.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredResources.map((resource: PublicResource) => {
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
                            <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Library is Empty</h3>
                            <p className="text-sm font-medium text-gray-500 max-w-sm mx-auto leading-relaxed">
                                There are no public charts available yet. Check back later!
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
