'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    UserPlus, Search, Edit, Mail, Phone,
    GraduationCap, Music, Users, Loader2, X,
    CheckCircle, Download, ChevronRight
} from 'lucide-react'
import { useUser } from '@/contexts/UserContext'
import { useTeachers } from '@/hooks/useDashboardData'
import api from '@/services/api'
import { toast } from 'react-hot-toast'
import Modal from '@/components/Modal'
import { Button } from '@/components/ui/button'

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
            if (e.key === 'Escape') setIsEditModalOpen(false)
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
        toast.success('Instructors list exported successfully')
    }

    // Calculate stats
    const activeInstructors = teachers.filter((t: any) => t.is_active).length
    const totalStudents = teachers.reduce((sum: number, t: any) => sum + (t.students_count || 0), 0)
    const avgRate = teachers.length > 0
        ? (teachers.reduce((sum: number, t: any) => sum + (parseFloat(t.hourly_rate) || 0), 0) / teachers.length).toFixed(2)
        : '0.00'

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-in fade-in duration-500">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading Instructors...</p>
            </div>
        )
    }

    return (
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4">
                <div className="space-y-2">
                    <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">Instructors</h1>
                    <p className="text-gray-500 font-medium max-w-lg">Manage your teaching staff and track performance.</p>
                </div>
                {currentUser?.role === 'admin' && (
                    <button
                        onClick={() => router.push('/dashboard/users')}
                        className="flex items-center gap-2 px-5 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-bold text-sm active:scale-95"
                    >
                        <UserPlus className="w-4 h-4" />
                        Add Instructor
                    </button>
                )}
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Total Instructors</p>
                            <p className="text-3xl font-black text-gray-900">{teachers.length}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-md">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Active</p>
                            <p className="text-3xl font-black text-gray-900">{activeInstructors}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md">
                            <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Total Students</p>
                            <p className="text-3xl font-black text-gray-900">{totalStudents}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-md">
                            <GraduationCap className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Avg Rate</p>
                            <p className="text-3xl font-black text-gray-900">${avgRate}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-md">
                            <Music className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Search & Export */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative flex-1 w-full sm:max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    />
                </div>
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all font-bold text-sm active:scale-95 w-full sm:w-auto"
                >
                    <Download className="w-4 h-4" />
                    Export
                </button>
            </div>

            {/* Instructors List */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Instructor</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Specialties</th>
                                <th className="px-8 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Students</th>
                                <th className="px-8 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Rate</th>
                                <th className="px-8 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredTeachers.length > 0 ? filteredTeachers.map((teacher) => (
                                <tr key={teacher.id} className="hover:bg-gray-50/50 transition-all group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-black text-lg shadow-md">
                                                {teacher.avatar ? (
                                                    <img src={teacher.avatar} alt="" className="w-full h-full object-cover rounded-xl" />
                                                ) : (
                                                    teacher.first_name[0].toUpperCase()
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">{teacher.first_name} {teacher.last_name}</div>
                                                <div className="text-xs text-gray-500 font-medium">{teacher.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-wrap gap-1.5">
                                            {Array.from(new Set([
                                                ...(Array.isArray(teacher.specialties) ? teacher.specialties : []),
                                                ...(Array.isArray(teacher.instruments) ? teacher.instruments : [])
                                            ])).slice(0, 3).map((spec: string) => (
                                                <span key={spec} className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
                                                    {spec}
                                                </span>
                                            ))}
                                            {Array.from(new Set([
                                                ...(Array.isArray(teacher.specialties) ? teacher.specialties : []),
                                                ...(Array.isArray(teacher.instruments) ? teacher.instruments : [])
                                            ])).length > 3 && (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold bg-gray-100 text-gray-600">
                                                        +{Array.from(new Set([
                                                            ...(Array.isArray(teacher.specialties) ? teacher.specialties : []),
                                                            ...(Array.isArray(teacher.instruments) ? teacher.instruments : [])
                                                        ])).length - 3}
                                                    </span>
                                                )}
                                            {((!teacher.specialties || teacher.specialties.length === 0) && (!teacher.instruments || teacher.instruments.length === 0)) && (
                                                <span className="text-xs text-gray-400">None</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <span className="text-sm font-bold text-gray-900">{teacher.students_count || 0}</span>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <span className="text-sm font-bold text-gray-900">
                                            {teacher.hourly_rate ? `$${teacher.hourly_rate}` : '-'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${teacher.is_active
                                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                            : 'bg-gray-50 text-gray-500 border border-gray-200'
                                            }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${teacher.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                                            {teacher.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <button
                                            onClick={() => handleOpenEdit(teacher)}
                                            className="p-2 text-gray-400 hover:text-primary hover:bg-teal-50 rounded-xl transition-all active:scale-95"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="px-8 py-24 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center">
                                                <GraduationCap className="w-10 h-10 text-gray-300" />
                                            </div>
                                            <p className="text-gray-400 font-bold text-lg">No instructors found.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden p-4 space-y-4">
                    {filteredTeachers.length > 0 ? filteredTeachers.map((teacher: any) => (
                        <div key={teacher.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4 relative overflow-hidden">
                            <div className={`absolute top-0 left-0 w-1.5 h-full ${teacher.is_active ? 'bg-primary' : 'bg-gray-400'}`} />

                            <div className="flex items-start justify-between pl-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-black text-lg shadow-md">
                                        {teacher.avatar ? (
                                            <img src={teacher.avatar} alt="" className="w-full h-full object-cover rounded-xl" />
                                        ) : (
                                            teacher.first_name[0].toUpperCase()
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 leading-tight">{teacher.first_name} {teacher.last_name}</h3>
                                        <p className="text-xs text-gray-500 font-medium truncate max-w-[150px]">{teacher.email}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleOpenEdit(teacher)}
                                    className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:text-primary"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pl-3">
                                <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                                    <div className="flex items-center gap-1.5 text-xs font-black text-gray-400 uppercase tracking-widest">
                                        <Users className="w-3 h-3" />
                                        Students
                                    </div>
                                    <p className="text-xs font-bold text-gray-800">{teacher.students_count || 0}</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                                    <div className="flex items-center gap-1.5 text-xs font-black text-gray-400 uppercase tracking-widest">
                                        <Music className="w-3 h-3" />
                                        Rate
                                    </div>
                                    <p className="text-xs font-bold text-gray-800">{teacher.hourly_rate ? `$${teacher.hourly_rate}` : '-'}</p>
                                </div>
                            </div>

                            <div className="pl-3 flex items-center gap-2 pt-1">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${teacher.is_active
                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                    : 'bg-gray-50 text-gray-500 border border-gray-200'
                                    }`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${teacher.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                                    {teacher.is_active ? 'Active' : 'Inactive'}
                                </span>
                                {Array.from(new Set([
                                    ...(Array.isArray(teacher.specialties) ? teacher.specialties : []),
                                    ...(Array.isArray(teacher.instruments) ? teacher.instruments : [])
                                ])).slice(0, 2).map((spec: string) => (
                                    <span key={spec} className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-blue-50 text-blue-600 border border-blue-100">
                                        {spec}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )) : (
                        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                            <GraduationCap className="w-12 h-12 text-gray-200" />
                            <p className="text-gray-400 font-bold">No instructors found.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && (
                <Modal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    title="Edit Instructor"
                    footer={
                        <>
                            <Button
                                variant="outline"
                                onClick={() => setIsEditModalOpen(false)}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="flex-[2] gap-2"
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                            </Button>
                        </>
                    }
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">First Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.first_name}
                                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border-transparent focus:bg-white border-2 focus:border-primary rounded-xl font-bold text-gray-700 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Last Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.last_name}
                                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border-transparent focus:bg-white border-2 focus:border-primary rounded-xl font-bold text-gray-700 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Email</label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border-transparent focus:bg-white border-2 focus:border-primary rounded-xl font-bold text-gray-700 outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Specialties</label>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {formData.specialties.map((spec) => (
                                    <span key={spec} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-bold border border-blue-100">
                                        {spec}
                                        <button
                                            type="button"
                                            onClick={() => setFormData({
                                                ...formData,
                                                specialties: formData.specialties.filter(i => i !== spec)
                                            })}
                                            className="hover:text-red-600 transition-colors"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </span>
                                ))}
                                {formData.specialties.length === 0 && (
                                    <p className="text-sm text-gray-400">No specialties added yet</p>
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

                                            const formatted = trimmed.replace(
                                                /\w\S*/g,
                                                (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
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
                                    placeholder="Add specialty (e.g., Piano)"
                                    className="flex-1 px-4 py-3 bg-gray-50 border-transparent focus:bg-white border-2 focus:border-primary rounded-xl font-bold text-gray-700 outline-none transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const trimmed = newInstrument.trim();
                                        if (!trimmed) return;

                                        const formatted = trimmed.replace(
                                            /\w\S*/g,
                                            (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
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
                                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-bold"
                                >
                                    Add
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Hourly Rate ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.hourly_rate}
                                    onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border-transparent focus:bg-white border-2 focus:border-primary rounded-xl font-bold text-gray-700 outline-none transition-all"
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Status</label>
                                <div className="flex items-center gap-4 px-4 py-3 bg-gray-50 rounded-xl h-[50px]">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_active}
                                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                    </label>
                                    <span className="text-sm font-bold text-gray-700">
                                        {formData.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    )
}
