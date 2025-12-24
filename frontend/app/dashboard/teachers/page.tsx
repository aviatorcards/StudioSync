'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    UserPlus, Search, Filter, Edit,
    MoreHorizontal, Mail, Phone,
    GraduationCap, Music, Users,
    Loader2, X, CheckCircle, Globe
} from 'lucide-react'
import { useUser } from '@/contexts/UserContext'
import { useTeachers } from '@/hooks/useDashboardData'
import api from '@/services/api'
import { toast } from 'react-hot-toast'

export default function InstructorsPage() {
    const router = useRouter()
    const { currentUser } = useUser()
    const { teachers, loading, refresh } = useTeachers()

    const [searchQuery, setSearchQuery] = useState('')
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [selectedTeacher, setSelectedTeacher] = useState<any>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [newInstrument, setNewInstrument] = useState('')

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsEditModalOpen(false)
            }
        }
        window.addEventListener('keydown', handleEsc)
        return () => window.removeEventListener('keydown', handleEsc)
    }, [])

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        specialties: [] as string[],
        hourly_rate: '',
        is_active: true
    })

    const handleOpenEdit = (teacher: any) => {
        setSelectedTeacher(teacher)
        setFormData({
            first_name: teacher.first_name || '',
            last_name: teacher.last_name || '',
            email: teacher.email || '',
            phone: teacher.phone || '',
            specialties: Array.isArray(teacher.specialties) ? teacher.specialties :
                (Array.isArray(teacher.instruments) ? teacher.instruments : []),
            hourly_rate: teacher.hourly_rate?.toString() || '',
            is_active: teacher.is_active ?? true
        })
        setIsEditModalOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            await api.patch(`/core/teachers/${selectedTeacher.id}/`, formData)
            toast.success('Instructor updated successfully')
            setIsEditModalOpen(false)
            if (refresh) refresh()
        } catch (error: any) {
            console.error('Failed to update teacher:', error)
            toast.error(error.response?.data?.detail || 'Failed to update instructor')
        } finally {
            setIsSubmitting(false)
        }
    }

    const filteredTeachers = teachers.filter((t: any) => {
        const fullName = `${t.first_name} ${t.last_name}`.toLowerCase()
        return fullName.includes(searchQuery.toLowerCase()) ||
            t.email.toLowerCase().includes(searchQuery.toLowerCase())
    })

    const handleExport = () => {
        const headers = ['First Name', 'Last Name', 'Specialties', 'Email', 'Phone', 'Students', 'Rate']
        const csvContent = [
            headers.join(','),
            ...teachers.map((t: any) => [
                t.first_name,
                t.last_name,
                `"${Array.isArray(t.specialties) ? t.specialties.join(', ') : (Array.isArray(t.instruments) ? t.instruments.join(', ') : '')}"`,
                t.email,
                t.phone,
                t.students_count || 0,
                t.hourly_rate
            ].join(','))
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'instructors_export.csv'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                <p className="text-gray-500 font-bold tracking-[0.2em] uppercase text-xs">Assembling Faculty...</p>
            </div>
        )
    }

    return (
        <>
            <div className="max-w-7xl mx-auto px-4 pb-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Instructors</h1>
                        <p className="text-lg text-gray-500 mt-2 font-medium">Coordinate your teaching faculty and manage resources.</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleExport}
                            className="px-6 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-all active:scale-95"
                        >
                            Export List
                        </button>
                        {currentUser?.role === 'admin' && (
                            <button
                                onClick={() => router.push('/dashboard/users')}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#2C3E50] text-white rounded-xl hover:bg-[#34495E] transition-all hover:scale-105 shadow-lg active:scale-95 font-bold"
                            >
                                <UserPlus className="w-5 h-5" />
                                <span>Add Instructor</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Main Content Card */}
                <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden">
                    <div className="p-8 bg-gray-50/50 border-b flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 px-4 py-2 bg-white border rounded-2xl shadow-sm">
                                <Users className="w-4 h-4 text-primary" />
                                <span className="text-sm font-black text-gray-700 uppercase tracking-widest">{filteredTeachers.length} STAFF</span>
                            </div>
                        </div>

                        <div className="relative w-full md:w-96">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Find an instructor by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all shadow-sm placeholder:text-gray-400"
                            />
                        </div>
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-white border-b border-gray-100">
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Faculty Name</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Disciplines</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Engagement</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Status</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 border-b border-gray-50">
                                {filteredTeachers.length > 0 ? filteredTeachers.map((teacher) => (
                                    <tr key={teacher.id} className="hover:bg-gray-50/80 transition-all group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center space-x-5">
                                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-lg shadow-sm group-hover:shadow-md transition-all group-hover:-translate-y-1">
                                                    {teacher.avatar ? (
                                                        <img src={teacher.avatar} alt="" className="w-full h-full object-cover rounded-2xl" />
                                                    ) : (
                                                        teacher.first_name[0].toUpperCase()
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="text-lg font-bold text-gray-900 leading-tight">
                                                        {teacher.first_name} {teacher.last_name}
                                                    </div>
                                                    <div className="text-sm text-gray-400 font-semibold">{teacher.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-wrap gap-1.5">
                                                {Array.from(new Set([
                                                    ...(Array.isArray(teacher.specialties) ? teacher.specialties : []),
                                                    ...(Array.isArray(teacher.instruments) ? teacher.instruments : [])
                                                ])).map((spec: string) => (
                                                    <span key={spec} className="inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-black bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-widest leading-none">
                                                        {spec}
                                                    </span>
                                                ))}
                                                {((!teacher.specialties || teacher.specialties.length === 0) && (!teacher.instruments || teacher.instruments.length === 0)) && (
                                                    <span className="text-[10px] font-bold text-gray-300 italic">No specialties set</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                                    <Users className="w-4 h-4 text-gray-400" />
                                                    {teacher.students_count || 0} Students
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                    <Globe className="w-3.5 h-3.5" />
                                                    Rate: {teacher.hourly_rate ? `$${teacher.hourly_rate}/HR` : 'NOT SET'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${teacher.is_active ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full mr-2 ${teacher.is_active ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                                                {teacher.is_active ? 'Active' : 'Inactive'}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button
                                                onClick={() => handleOpenEdit(teacher)}
                                                className="p-3 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-2xl transition-all active:scale-90"
                                            >
                                                <Edit className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-24 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center">
                                                    <GraduationCap className="w-10 h-10 text-gray-200" />
                                                </div>
                                                <p className="text-gray-400 font-bold text-xl uppercase tracking-widest">Teach Your Children Well</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-4 p-4">
                        {filteredTeachers.length > 0 ? filteredTeachers.map((teacher) => (
                            <div key={teacher.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-lg shadow-sm shrink-0">
                                            {teacher.avatar ? (
                                                <img src={teacher.avatar} alt="" className="w-full h-full object-cover rounded-2xl" />
                                            ) : (
                                                teacher.first_name[0].toUpperCase()
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-lg font-bold text-gray-900 leading-tight truncate">
                                                {teacher.first_name} {teacher.last_name}
                                            </div>
                                            <div className="text-xs text-gray-400 font-semibold truncate">{teacher.email}</div>
                                        </div>
                                    </div>
                                    <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border shrink-0 ${teacher.is_active ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                                        {teacher.is_active ? 'Active' : 'Inactive'}
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-1.5">
                                    {Array.from(new Set([
                                        ...(Array.isArray(teacher.specialties) ? teacher.specialties : []),
                                        ...(Array.isArray(teacher.instruments) ? teacher.instruments : [])
                                    ])).map((spec: string) => (
                                        <span key={spec} className="inline-flex items-center px-2 py-1 rounded-lg text-[9px] font-black bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-widest leading-none">
                                            {spec}
                                        </span>
                                    ))}
                                    {((!teacher.specialties || teacher.specialties.length === 0) && (!teacher.instruments || teacher.instruments.length === 0)) && (
                                        <span className="text-[10px] font-bold text-gray-300 italic">No specialties set</span>
                                    )}
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                                            <Users className="w-3.5 h-3.5 text-gray-400" />
                                            {teacher.students_count || 0} Students
                                        </div>
                                        {teacher.hourly_rate && (
                                            <div className="flex items-center gap-2 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                                <Globe className="w-3 h-3" />
                                                Rate: ${teacher.hourly_rate}/HR
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleOpenEdit(teacher)}
                                        className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all active:scale-90 bg-gray-50"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                    <GraduationCap className="w-8 h-8 text-gray-200" />
                                </div>
                                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No Results Found</p>
                            </div>
                        )}
                    </div>

                    {/* Footer/Pagination */}
                    <div className="p-8 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">
                            Certified Studio Sync Faculty Panel
                        </p>
                    </div>
                </div>

                {/* Edit Instructor Modal */}
                {isEditModalOpen && (
                    <div
                        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-300"
                        onClick={() => setIsEditModalOpen(false)}
                    >
                        <div
                            className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in slide-in-from-top-4 duration-300"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="px-10 py-8 bg-[#2C3E50] text-white flex items-center justify-between shrink-0">
                                <div>
                                    <h2 className="text-3xl font-black tracking-tight">Faculty Credentials</h2>
                                    <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Update Instructor Bio & Professional Rates</p>
                                </div>
                                <button onClick={() => setIsEditModalOpen(false)} className="w-12 h-12 rounded-2xl hover:bg-white/10 flex items-center justify-center transition-colors">
                                    <X className="w-7 h-7" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">First Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.first_name}
                                                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                                className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary outline-none font-bold text-gray-900 transition-all text-sm"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Last Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.last_name}
                                                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                                className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary outline-none font-bold text-gray-900 transition-all text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Address</label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary outline-none font-bold text-gray-900 transition-all text-sm"
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Instructor Specialties</label>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {formData.specialties.map((spec) => (
                                                <span key={spec} className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/5 text-primary rounded-xl text-xs font-bold border border-primary/10 uppercase tracking-widest">
                                                    {spec}
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({
                                                            ...formData,
                                                            specialties: formData.specialties.filter(i => i !== spec)
                                                        })}
                                                        className="hover:text-red-500 transition-colors"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            ))}
                                            {formData.specialties.length === 0 && (
                                                <p className="text-[10px] text-gray-400 italic font-bold">No specialties added yet.</p>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={newInstrument}
                                                onChange={(e) => setNewInstrument(e.target.value)}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        const trimmed = newInstrument.trim();
                                                        if (!trimmed) return;

                                                        // Normalize to Title Case
                                                        const formatted = trimmed.replace(
                                                            /\w\S*/g,
                                                            (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                                                        );

                                                        if (formData.specialties.some(s => s.toLowerCase() === formatted.toLowerCase())) {
                                                            toast.error('This specialty is already listed');
                                                            return;
                                                        }

                                                        setFormData({
                                                            ...formData,
                                                            specialties: [...formData.specialties, formatted]
                                                        });
                                                        setNewInstrument('');
                                                    }
                                                }}
                                                placeholder="Add new specialty (e.g. Piano)..."
                                                className="flex-1 px-5 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary outline-none font-bold text-gray-900 text-sm"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const trimmed = newInstrument.trim();
                                                    if (!trimmed) return;

                                                    // Normalize to Title Case
                                                    const formatted = trimmed.replace(
                                                        /\w\S*/g,
                                                        (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                                                    );

                                                    if (formData.specialties.some(s => s.toLowerCase() === formatted.toLowerCase())) {
                                                        toast.error('This specialty is already listed');
                                                        return;
                                                    }

                                                    setFormData({
                                                        ...formData,
                                                        specialties: [...formData.specialties, formatted]
                                                    });
                                                    setNewInstrument('');
                                                }}
                                                className="px-4 py-3 bg-gray-100 text-gray-600 rounded-2xl hover:bg-gray-200 transition-all font-black text-xs uppercase tracking-widest"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hourly Rate ($)</label>
                                            <input
                                                type="number"
                                                value={formData.hourly_rate}
                                                onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                                                className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary outline-none font-bold text-gray-900 transition-all text-sm"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div className="space-y-2 text-right flex flex-col justify-end">
                                            <div className="flex items-center justify-end gap-3 px-6 py-3.5 bg-gray-50 rounded-2xl h-[52px]">
                                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{formData.is_active ? 'Active' : 'Inactive'}</span>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.is_active}
                                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 flex gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setIsEditModalOpen(false)}
                                            className="flex-1 px-8 py-4 border-2 border-gray-100 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all active:scale-95"
                                        >
                                            Dismiss
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="flex-[2] px-8 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                                        >
                                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Commit Changes'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}
