'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    Plus, Music, Users as UsersIcon, Loader2,
    Search, Edit, Mail, Trash2, Camera,
    Check, UserPlus, Sparkles, BookOpen, Target,
    Trophy, Zap, Filter, ChevronRight
} from 'lucide-react'
import { useUsers } from '@/hooks/useDashboardData'
import api from '@/services/api'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Dialog, DialogHeader, DialogContent, DialogFooter } from '@/components/ui/dialog'

export default function BandsPage() {
    const router = useRouter()
    const { users } = useUsers()
    const students = users.filter((u: any) => u.role === 'student')
    const [bands, setBands] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [selectedBand, setSelectedBand] = useState<any>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [studentSearchTerm, setStudentSearchTerm] = useState('')
    const [viewMode, setViewMode] = useState<'consolidated' | 'performance'>('performance')

    const [formData, setFormData] = useState<any>({
        name: '',
        genre: '',
        photo: null,
        photoPreview: '',
        billing_email: '',
        notes: '',
        member_ids: [] as string[]
    })

    const fetchBands = async () => {
        try {
            const response = await api.get('/core/bands/')
            const data = response.data.results || response.data
            setBands(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error('Failed to fetch bands:', error)
            toast.error('Failed to load bands')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchBands()
    }, [])

    const handleOpenEdit = (band: any) => {
        setSelectedBand(band)
        setFormData({
            name: band.name || '',
            genre: band.genre || '',
            photo: null,
            photoPreview: band.photo || '',
            billing_email: band.billing_email || '',
            notes: band.notes || '',
            member_ids: band.member_ids || []
        })
        setStudentSearchTerm('')
        setIsDialogOpen(true)
    }

    const handleOpenCreate = () => {
        setSelectedBand(null)
        setFormData({
            name: '',
            genre: '',
            photo: null,
            photoPreview: '',
            billing_email: '',
            notes: '',
            member_ids: []
        })
        setStudentSearchTerm('')
        setIsDialogOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        const submitData = new FormData()
        submitData.append('name', formData.name)
        submitData.append('genre', formData.genre)
        submitData.append('billing_email', formData.billing_email)
        submitData.append('notes', formData.notes)

        if (formData.photo) {
            submitData.append('photo', formData.photo)
        }

        if (formData.member_ids && formData.member_ids.length > 0) {
            formData.member_ids.forEach((id: string) => {
                submitData.append('member_ids', id)
            })
        } else {
            submitData.append('member_ids', '')
        }

        try {
            if (selectedBand) {
                await api.patch(`/core/bands/${selectedBand.id}/`, submitData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })
                toast.success('Band updated successfully')
            } else {
                await api.post('/core/bands/', submitData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })
                toast.success('Band created successfully')
            }
            setIsDialogOpen(false)
            fetchBands()
        } catch (error: any) {
            console.error('Failed to save band:', error.response?.data || error)
            toast.error(error.response?.data?.detail || 'Operation failed')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteBand = async (band: any) => {
        if (!confirm(`Are you sure you want to delete ${band.name}?`)) return

        try {
            await api.delete(`/core/bands/${band.id}/`)
            toast.success('Band deleted')
            fetchBands()
        } catch (error) {
            toast.error('Failed to delete band')
        }
    }

    const filteredBands = bands.filter(b =>
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.billing_email.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-in fade-in duration-500">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Loading Bands...</p>
            </div>
        )
    }

    return (
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4">
                <div className="space-y-2">
                    <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        Bands & Groups
                        <div className="bg-primary/10 px-3 py-1 rounded-full text-xs font-black text-primary uppercase tracking-widest">
                            {bands.length} Active
                        </div>
                    </h1>
                    <p className="text-gray-500 font-medium max-w-lg">Manage your bands, rehearsal schedules, and student groups.</p>
                </div>
                <Button
                    onClick={handleOpenCreate}
                    className="gap-2 hover:scale-105 shadow-xl shadow-primary/20 transition-all py-6 px-10 font-black uppercase tracking-widest text-[10px]"
                >
                    <Plus className="w-4 h-4" />
                    Create New Band
                </Button>
            </header>

             {/* Stats */}
             <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                 {[
                    { label: 'Total Bands', value: bands.length, icon: Music, color: 'blue' },
                    { label: 'Active Musicians', value: bands.reduce((acc, b) => acc + (b.members_count || 0), 0), icon: UsersIcon, color: 'emerald' },
                    { label: 'Rehearsal Intensity', value: 'High', icon: Zap, color: 'purple' },
                    { label: 'Performance Ready', value: '82%', icon: Trophy, color: 'orange' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                         <div className="flex items-center justify-between mb-4">
                            <div className={`w-10 h-10 bg-${stat.color}-50 rounded-xl flex items-center justify-center text-${stat.color}-600 group-hover:scale-110 transition-transform`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight uppercase tracking-tighter">{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-3xl border border-gray-100 shadow-xl">
                 <div className="relative flex-1 w-full max-w-xl">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search collective identity or administration..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-transparent focus:bg-white border-2 focus:border-primary rounded-2xl font-bold text-sm text-gray-700 outline-none transition-all"
                    />
                </div>
                <div className="flex items-center gap-3 overflow-x-auto w-full md:w-auto no-scrollbar">
                     <div className="flex p-1 bg-gray-50 rounded-2xl border border-gray-100">
                         <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewMode('consolidated')}
                            className={`px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                viewMode === 'consolidated' ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            Consolidated
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewMode('performance')}
                            className={`px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                viewMode === 'performance' ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            Performance Mode
                        </Button>
                    </div>
                </div>
            </div>

            {/* Bands Grid */}
            {viewMode === 'performance' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {filteredBands.length > 0 ? (
                        filteredBands.map((band) => (
                            <div key={band.id} className="group relative bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden flex flex-col">
                                {/* Decorative Elements */}
                                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/[0.03] rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-1000" />
                                
                                <div className="relative z-10 flex-1 space-y-6">
                                    <div className="flex items-start justify-between">
                                        <div className="relative">
                                            {band.photo ? (
                                                <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-white shadow-xl group-hover:scale-110 transition-transform duration-500 bg-gray-50">
                                                    <img src={band.photo} alt={band.name} className="w-full h-full object-cover" />
                                                </div>
                                            ) : (
                                                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:rotate-6 transition-transform border-4 border-white">
                                                    <Music className="w-10 h-10 text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100 group-hover:bg-primary/5 group-hover:border-primary/20 transition-colors">
                                                <UsersIcon className="w-3.5 h-3.5 text-gray-400 group-hover:text-primary transition-colors" />
                                                <span className="text-[10px] font-black text-gray-600 group-hover:text-primary transition-colors">{band.members_count || 0} MEMBERS</span>
                                            </div>
                                            {band.genre && (
                                                <span className="px-3 py-1 bg-white shadow-sm text-primary text-[10px] font-black uppercase tracking-widest rounded-lg border border-primary/20">
                                                    {band.genre}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-black text-gray-900 tracking-tight uppercase group-hover:text-primary transition-colors leading-tight">
                                            {band.name}
                                        </h3>
                                        <p className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            <Mail className="w-3.5 h-3.5" />
                                            {band.billing_email}
                                        </p>
                                    </div>

                                    <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100 min-h-[90px] flex flex-col justify-center">
                                        {band.notes ? (
                                            <p className="text-xs font-bold text-gray-500 italic leading-relaxed line-clamp-3">
                                                "{band.notes}"
                                            </p>
                                        ) : (
                                            <div className="text-center opacity-30">
                                                 <BookOpen className="w-5 h-5 mx-auto mb-1" />
                                                 <span className="text-[9px] uppercase font-black tracking-widest">No Manifest</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 pt-8 mt-4 border-t border-gray-50 relative z-10">
                                    <Button
                                        onClick={() => router.push(`/dashboard/bands/${band.id}`)}
                                        className="flex-1 rounded-2xl font-black uppercase tracking-widest text-[10px] py-6 shadow-lg shadow-primary/10"
                                    >
                                        <ChevronRight className="w-4 h-4 mr-2" />
                                        View Details
                                    </Button>
                                    <Button
                                        onClick={() => handleOpenEdit(band)}
                                        className="p-4 rounded-2xl text-gray-600 hover:text-primary hover:bg-primary/5 transition-all py-6 h-auto"
                                    >
                                        <Edit className="w-5 h-5" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={() => handleDeleteBand(band)}
                                        className="p-4 rounded-2xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all py-6 h-auto"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-24 text-center">
                            <div className="flex flex-col items-center gap-8">
                                <div className="w-32 h-32 bg-gray-50 rounded-[3rem] flex items-center justify-center border-2 border-dashed border-gray-200 shadow-inner">
                                    <Music className="w-16 h-16 text-gray-200" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">No Bands Found</h3>
                                    <p className="text-gray-400 font-medium max-w-sm mx-auto leading-relaxed">No bands match your search or exist in the studio yet.</p>
                                </div>
                                <Button
                                    onClick={handleOpenCreate}
                                    className="px-10 py-7 rounded-2xl shadow-xl shadow-primary/20 transition-all font-black uppercase tracking-widest text-[10px]"
                                >
                                    <Plus className="w-5 h-5 mr-1" />
                                    Create First Band
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl overflow-hidden">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full border-separate border-spacing-0">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Collective Identity</th>
                                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Ensemble Size</th>
                                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Administrative Contact</th>
                                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Readiness</th>
                                    <th className="px-8 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Management</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredBands.length > 0 ? (
                                    filteredBands.map((band) => (
                                        <tr key={band.id} className="hover:bg-gray-50/50 transition-all group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-5">
                                                    <div className="relative">
                                                        {band.photo ? (
                                                            <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-white shadow-md bg-gray-50">
                                                                <img src={band.photo} alt={band.name} className="w-full h-full object-cover" />
                                                            </div>
                                                        ) : (
                                                            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md border-2 border-white">
                                                                <Music className="w-6 h-6 text-white" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-black text-gray-900 tracking-tight uppercase tracking-tighter group-hover:text-primary transition-colors">{band.name}</div>
                                                        <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{band.genre || 'Various Genres'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-primary/20 flex items-center justify-center">
                                                        <div className="w-1 h-1 rounded-full bg-primary" />
                                                    </div>
                                                    <span className="text-xs font-black text-gray-600 uppercase tracking-widest">{band.members_count || 0} ACTIVE MEMBERS</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-sm font-bold text-gray-600">{band.billing_email}</span>
                                                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Electronic Billing Enabled</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col gap-2 max-w-[120px]">
                                                    <div className="flex justify-between items-end">
                                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Ready</span>
                                                        <span className="text-[10px] font-black text-primary">85%</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                        <div className="h-full bg-primary rounded-full w-[85%]" />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => router.push(`/dashboard/bands/${band.id}`)}
                                                        className="px-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-primary hover:bg-primary/5 transition-all"
                                                    >
                                                        Details
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleOpenEdit(band)}
                                                        className="p-2 rounded-lg text-gray-300 hover:text-gray-600 hover:bg-gray-100"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center">
                                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">No matching ensembles found</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Band Dialog */}
            <Dialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                size="xl"
            >
                <DialogHeader title={selectedBand ? "Edit Band" : "Create New Band"} />
                <DialogContent>
                    <form id="band-configuration-form" onSubmit={handleSubmit} className="space-y-10">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Band Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-6 py-4 bg-gray-50 border-transparent border-2 focus:border-primary focus:bg-white rounded-2xl outline-none font-bold text-gray-900 transition-all"
                                    placeholder="e.g. Skyline Jazz Collective"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Genre</label>
                                <input
                                    type="text"
                                    value={formData.genre}
                                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                                    className="w-full px-6 py-4 bg-gray-50 border-transparent border-2 focus:border-primary focus:bg-white rounded-2xl outline-none font-bold text-gray-900 transition-all"
                                    placeholder="e.g. Contemporary Fusion"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Camera className="w-3.5 h-3.5" />
                                Visual Identity (Photo)
                            </label>
                            <div className="group relative w-full h-48 bg-gray-50 border-2 border-dashed border-gray-200 rounded-[2rem] overflow-hidden hover:border-primary hover:bg-gray-100 transition-all cursor-pointer">
                                {formData.photoPreview ? (
                                    <>
                                        <img src={formData.photoPreview} className="w-full h-full object-cover" alt="Band Preview" />
                                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                                            <Camera className="w-10 h-10 text-white mb-2" />
                                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Change Photo</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-3">
                                        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center group-hover:scale-110 group-hover:text-primary transition-all">
                                            <Plus className="w-8 h-8" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest">Upload Photo</span>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0]
                                        if (file) {
                                            setFormData({
                                                ...formData,
                                                photo: file,
                                                photoPreview: URL.createObjectURL(file)
                                            })
                                        }
                                    }}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                            </div>
                        </div>

                        <div className="p-8 bg-primary/[0.03] rounded-[2.5rem] border border-primary/10 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Target className="w-4 h-4" />
                                    Band Members
                                </h3>
                                <span className="px-3 py-1 bg-white shadow-sm text-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/20">
                                    {formData.member_ids.length} MEMBERS
                                </span>
                            </div>

                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search students..."
                                    value={studentSearchTerm}
                                    onChange={(e) => setStudentSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-6 py-4 bg-white border-transparent focus:border-primary border-2 rounded-2xl font-bold text-gray-700 outline-none transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[320px] overflow-y-auto px-1 custom-scrollbar">
                                {students
                                    .filter((s: any) => {
                                        const term = studentSearchTerm.toLowerCase();
                                        return `${s.first_name} ${s.last_name}`.toLowerCase().includes(term) ||
                                            (s.student_profile?.instrument || '').toLowerCase().includes(term)
                                    })
                                    .map((student: any) => {
                                        const studentId = student.student_profile?.id || student.id;
                                        const isSelected = formData.member_ids.includes(studentId);
                                        return (
                                            <button
                                                key={student.id}
                                                type="button"
                                                onClick={() => {
                                                    const newMembers = isSelected
                                                        ? formData.member_ids.filter((id: string) => id !== studentId)
                                                        : [...formData.member_ids, studentId]
                                                    setFormData({ ...formData, member_ids: newMembers })
                                                }}
                                                className={`flex items-center justify-between p-4 rounded-2xl transition-all group ${isSelected
                                                    ? 'bg-primary text-white shadow-xl scale-[1.02]'
                                                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100 shadow-sm'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xs ${isSelected ? 'bg-white/20' : 'bg-gray-50'}`}>
                                                        {student.first_name?.[0]}{student.last_name?.[0]}
                                                    </div>
                                                    <div className="text-left">
                                                        <div className="text-xs font-black uppercase tracking-tighter leading-none mb-1">{student.first_name} {student.last_name}</div>
                                                        <div className={`text-[10px] font-bold uppercase tracking-widest ${isSelected ? 'text-white/70' : 'text-gray-400'}`}>{student.student_profile?.instrument || 'Unassigned'}</div>
                                                    </div>
                                                </div>
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isSelected ? 'bg-white/20' : 'bg-gray-50 group-hover:bg-primary/10'}`}>
                                                    {isSelected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4 text-gray-400 group-hover:text-primary" />}
                                                </div>
                                            </button>
                                        )
                                    })}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-8">
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Billing Email</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.billing_email}
                                    onChange={(e) => setFormData({ ...formData, billing_email: e.target.value })}
                                    className="w-full px-6 py-4 bg-gray-50 border-transparent border-2 focus:border-primary focus:bg-white rounded-2xl outline-none font-bold text-gray-900 transition-all"
                                    placeholder="billing@band.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Notes</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full px-6 py-4 bg-gray-50 border-transparent border-2 focus:border-primary focus:bg-white rounded-2xl outline-none font-bold text-gray-900 transition-all min-h-[120px] resize-none"
                                    placeholder="Add rehearsal notes, goals, or mission..."
                                />
                            </div>
                        </div>
                    </form>
                </DialogContent>
                <DialogFooter>
                    <Button
                        variant="ghost"
                        onClick={() => setIsDialogOpen(false)}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex-[2] gap-2 active:scale-95 transition-transform"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4" />
                                {selectedBand ? 'Update Band' : 'Create Band'}
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </Dialog>
        </div>
    )
}
