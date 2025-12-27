'use client'

import { useState, useEffect } from 'react'
import {
    Plus, Music, Users, Loader2, X,
    Search, Edit, Mail, Trash2, Camera,
    Check, UserPlus
} from 'lucide-react'
import { useUsers } from '@/hooks/useDashboardData'
import api from '@/services/api'
import { toast } from 'react-hot-toast'

export default function BandsPage() {
    const { users } = useUsers()
    const students = users.filter((u: any) => u.role === 'student')
    const [bands, setBands] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [selectedBand, setSelectedBand] = useState<any>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [studentSearchTerm, setStudentSearchTerm] = useState('')

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
            toast.error('Failed to load ensembles')
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
        setIsEditModalOpen(true)
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
                toast.success('Ensemble created successfully')
            }
            setIsAddModalOpen(false)
            setIsEditModalOpen(false)
            setFormData({
                name: '',
                genre: '',
                photo: null,
                photoPreview: '',
                billing_email: '',
                notes: '',
                member_ids: []
            })
            setSelectedBand(null)
            fetchBands()
        } catch (error: any) {
            console.error('Failed to save band:', error.response?.data || error)
            toast.error(error.response?.data?.detail || 'Operation failed')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteBand = async (band: any) => {
        if (!confirm(`Are you sure you want to disband ${band.name}?`)) return

        try {
            await api.delete(`/core/bands/${band.id}/`)
            toast.success('Band deleted successfully')
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
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tuning Ensembles...</p>
            </div>
        )
    }

    return (
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4">
                <div className="space-y-2">
                    <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">Bands & Groups</h1>
                    <p className="text-gray-500 font-medium max-w-lg">Orchestrate your musical ensembles and performance groups.</p>
                </div>
                <button
                    onClick={() => {
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
                        setIsAddModalOpen(true)
                    }}
                    className="flex items-center gap-2 px-5 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-bold text-sm active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    Form New Band
                </button>
            </header>

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-100">
                    <Music className="w-4 h-4 text-primary" />
                    <span className="text-xs font-black text-gray-700 uppercase tracking-widest">{bands.length} Ensembles</span>
                </div>

                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by band name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    />
                </div>
            </div>

            {/* Bands Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBands.length > 0 ? (
                    filteredBands.map((band) => (
                        <div key={band.id} className="group relative bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                            {/* Decorative Gradient */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#1ABC9C]/5 to-transparent rounded-bl-[4rem] group-hover:scale-150 transition-transform duration-500" />

                            <div className="relative z-10 space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className="relative">
                                        {band.photo ? (
                                            <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-white shadow-lg group-hover:scale-110 transition-transform duration-500">
                                                <img src={band.photo} alt={band.name} className="w-full h-full object-cover" />
                                            </div>
                                        ) : (
                                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-md group-hover:rotate-6 transition-transform">
                                                <Music className="w-8 h-8 text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 rounded-full border border-gray-100">
                                            <Users className="w-3.5 h-3.5 text-gray-400" />
                                            <span className="text-xs font-black text-gray-600">{band.members_count || 0}</span>
                                        </div>
                                        {band.genre && (
                                            <span className="px-2.5 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest rounded-lg border border-primary/20">
                                                {band.genre}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xl font-black text-gray-900 mb-2 group-hover:text-primary transition-colors">{band.name}</h3>
                                    <div className="flex items-center gap-2 text-sm font-medium text-gray-400">
                                        <Mail className="w-3.5 h-3.5" />
                                        <span className="truncate">{band.billing_email}</span>
                                    </div>
                                </div>

                                {band.notes ? (
                                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 min-h-[60px]">
                                        <p className="text-xs text-gray-600 italic leading-relaxed line-clamp-3">
                                            "{band.notes}"
                                        </p>
                                    </div>
                                ) : (
                                    <div className="h-[60px] flex items-center justify-center border-2 border-dashed border-gray-100 rounded-xl">
                                        <span className="text-[10px] uppercase font-black text-gray-300 tracking-widest">No Notes</span>
                                    </div>
                                )}

                                <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                                    <button
                                        onClick={() => handleOpenEdit(band)}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-primary hover:text-white text-gray-600 rounded-xl transition-all font-bold text-sm active:scale-95"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Manage
                                    </button>
                                    <button
                                        onClick={() => handleDeleteBand(band)}
                                        className="p-2.5 bg-gray-50 hover:bg-red-50 hover:text-red-500 text-gray-400 rounded-xl transition-all active:scale-95"
                                        title="Disband Ensemble"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-24 text-center">
                        <div className="flex flex-col items-center gap-6">
                            <div className="w-24 h-24 bg-gray-50 rounded-3xl flex items-center justify-center border-2 border-dashed border-gray-200">
                                <Music className="w-12 h-12 text-gray-200" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 mb-2">The stage is quiet...</h3>
                                <p className="text-gray-400 font-medium">No ensembles match your search or exist yet.</p>
                            </div>
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="px-5 py-2.5 bg-white border-2 border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all font-bold text-sm active:scale-95"
                            >
                                + Form First Ensemble
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Band Modal */}
            {(isAddModalOpen || isEditModalOpen) && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                        {/* Modal Header */}
                        <div className="bg-[#2C3E50] px-8 py-6 flex items-center justify-between text-white">
                            <div>
                                <h2 className="text-2xl font-black tracking-tight">{isEditModalOpen ? 'Band Configuration' : 'New Ensemble'}</h2>
                                <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1">Group Identity & Logistics</p>
                            </div>
                            <button
                                onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); setStudentSearchTerm(''); }}
                                className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Ensemble Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border-transparent focus:bg-white border-2 focus:border-primary rounded-xl font-bold text-gray-700 outline-none transition-all"
                                        placeholder="e.g. Midnight Jazz Collective"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Genre / Style</label>
                                    <input
                                        type="text"
                                        value={formData.genre}
                                        onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border-transparent focus:bg-white border-2 focus:border-primary rounded-xl font-bold text-gray-700 outline-none transition-all"
                                        placeholder="e.g. Fusion Jazz"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Band Photo</label>
                                <div className="group relative w-full h-40 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl overflow-hidden hover:border-primary hover:bg-gray-100 transition-all cursor-pointer">
                                    {formData.photoPreview ? (
                                        <>
                                            <img src={formData.photoPreview} className="w-full h-full object-cover" alt="Band Preview" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="flex flex-col items-center text-white">
                                                    <Camera className="w-8 h-8 mb-2" />
                                                    <span className="text-xs font-bold uppercase tracking-widest">Change Photo</span>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                                            <Camera className="w-8 h-8 mb-2 group-hover:scale-110 group-hover:text-primary transition-all" />
                                            <span className="text-xs font-bold uppercase tracking-widest">Click to Upload</span>
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

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Ensemble Members</label>
                                    <span className="px-2.5 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest rounded-full border border-primary/20">
                                        {formData.member_ids.length} Selected
                                    </span>
                                </div>

                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search students to recruit..."
                                        value={studentSearchTerm}
                                        onChange={(e) => setStudentSearchTerm(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border-transparent focus:bg-white border-2 focus:border-primary rounded-xl text-sm font-bold text-gray-700 outline-none transition-all"
                                    />
                                </div>

                                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-4 max-h-[300px] overflow-y-auto space-y-2 custom-scrollbar">
                                    {students
                                        .filter((s: any) => {
                                            const term = studentSearchTerm.toLowerCase();
                                            return `${s.first_name} ${s.last_name}`.toLowerCase().includes(term) ||
                                                (s.student_profile?.instrument || '').toLowerCase().includes(term)
                                        })
                                        .length > 0 ? (
                                        students
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
                                                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${isSelected
                                                            ? 'bg-primary text-white shadow-md'
                                                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-xs ${isSelected ? 'bg-white/20' : 'bg-gray-50'}`}>
                                                                {student.first_name[0]}{student.last_name[0]}
                                                            </div>
                                                            <div className="text-left">
                                                                <div className="text-sm font-bold leading-none mb-1">{student.first_name} {student.last_name}</div>
                                                                <div className={`text-[10px] font-medium ${isSelected ? 'text-white/70' : 'text-gray-400'}`}>{student.student_profile?.instrument || 'No Instrument'}</div>
                                                            </div>
                                                        </div>
                                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isSelected ? 'bg-white/20' : 'bg-gray-100'}`}>
                                                            {isSelected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4 text-gray-400" />}
                                                        </div>
                                                    </button>
                                                )
                                            })
                                    ) : (
                                        <div className="py-12 text-center">
                                            <UserPlus className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                            <p className="text-xs uppercase font-bold text-gray-400 tracking-widest">No Students Found</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Billing Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.billing_email}
                                        onChange={(e) => setFormData({ ...formData, billing_email: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border-transparent focus:bg-white border-2 focus:border-primary rounded-xl font-bold text-gray-700 outline-none transition-all"
                                        placeholder="billing@collective.com"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Notes</label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border-transparent focus:bg-white border-2 focus:border-primary rounded-xl font-bold text-gray-700 outline-none transition-all min-h-[100px] resize-none"
                                        placeholder="Define performance goals or group dynamics..."
                                    />
                                </div>
                            </div>
                        </form>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
                            <button
                                onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); setStudentSearchTerm(''); }}
                                className="flex-1 py-3.5 border-2 border-gray-200 text-gray-500 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-gray-100 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="flex-[2] py-3.5 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-primary-hover transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : isEditModalOpen ? 'Update Ensemble' : 'Create Ensemble'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
