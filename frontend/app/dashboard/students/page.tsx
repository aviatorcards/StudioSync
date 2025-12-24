'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { useStudents, useTeachers } from '@/hooks/useDashboardData'
import api from '@/services/api'
import { toast } from 'react-hot-toast'
import {
    X, Loader2, UserPlus, Music,
    Link as LinkIcon, Edit, UserCog,
    Search, Filter, ChevronRight,
    GraduationCap, User, Calendar
} from 'lucide-react'

// Define interface matching the serializer
interface StudentData {
    id: string
    name: string
    email: string
    instrument: string
    skill_level: string
    teacher_name: string | null
    next_lesson: string | null
    status: string
    is_active: boolean
    // Extra fields for editing
    first_name?: string
    last_name?: string
    primary_teacher?: string | null
}

export default function StudentsPage() {
    const router = useRouter()
    const { currentUser } = useUser()
    const { teachers } = useTeachers()

    // Modal state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [selectedStudent, setSelectedStudent] = useState<any>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

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
        instrument: '',
        skill_level: '',
        primary_teacher: '',
        is_active: true
    })

    const handleOpenEdit = (student: any) => {
        setSelectedStudent(student)
        const [firstName, ...lastNameParts] = (student.name || '').split(' ')
        setFormData({
            first_name: firstName || '',
            last_name: lastNameParts.join(' ') || '',
            email: student.email || '',
            instrument: student.instrument || '',
            skill_level: student.skill_level || 'Beginner',
            primary_teacher: student.primary_teacher?.id || student.teacher_id || '',
            is_active: student.is_active ?? true
        })
        setIsEditModalOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            await api.patch(`/students/${selectedStudent.id}/`, formData)
            toast.success('Student updated successfully!')
            setIsEditModalOpen(false)
            if (refresh) refresh()
        } catch (error: any) {
            console.error('Failed to update student:', error)
            toast.error(error.response?.data?.detail || 'Failed to update student')
        } finally {
            setIsSubmitting(false)
        }
    }

    // Filter state
    const [searchQuery, setSearchQuery] = useState('')
    const [filterInstrument, setFilterInstrument] = useState('all')
    const [showAllStudents, setShowAllStudents] = useState(false)
    const [page, setPage] = useState(1)

    // Reset page on filter change
    useEffect(() => {
        setPage(1)
    }, [searchQuery, filterInstrument, showAllStudents])

    const { students, meta, loading, refresh } = useStudents({
        page,
        search: searchQuery,
        instrument: filterInstrument !== 'all' ? filterInstrument : undefined,
        teacher_id: (currentUser?.role === 'teacher' && !showAllStudents && (currentUser as any).teacher_profile?.id)
            ? (currentUser as any).teacher_profile.id
            : undefined
    })

    // Formatting helpers
    const getStatusBadge = (status: string, isActive: boolean) => {
        const styles = {
            active: 'bg-green-100 text-green-700 border-green-200',
            inactive: 'bg-red-100 text-red-700 border-red-200',
            makeup: 'bg-amber-100 text-amber-700 border-amber-200',
        }
        const key = isActive ? 'active' : 'inactive'
        return (
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest border ${styles[key]}`}>
                <div className={`w-1.5 h-1.5 rounded-full mr-2 ${isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                {isActive ? 'Active' : 'Inactive'}
            </div>
        )
    }

    // Derived: all unique specialties from all teachers for dropdown
    const allInstruments = Array.from(new Set(
        teachers.flatMap((t: any) => [
            ...(Array.isArray(t.specialties) ? t.specialties : []),
            ...(Array.isArray(t.instruments) ? t.instruments : [])
        ])
    )).sort()

    // Derived: filter instruments based on assigned teacher
    const availableInstruments = (() => {
        if (!formData.primary_teacher) return []

        const teacher = teachers.find((t: any) => t.id === formData.primary_teacher)
        if (!teacher) return []

        const specs = [
            ...(Array.isArray(teacher.specialties) ? teacher.specialties : []),
            ...(Array.isArray(teacher.instruments) ? teacher.instruments : [])
        ]

        return Array.from(new Set(specs)).sort()
    })()

    // Pagination helpers
    const PAGE_SIZE = 20
    const totalPages = Math.ceil((meta?.count || 0) / PAGE_SIZE)
    const hasNext = !!meta?.next
    const hasPrevious = !!meta?.previous

    // Scroll to top on page change
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }, [page])

    // Close on Escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsEditModalOpen(false)
        }
        if (isEditModalOpen) {
            window.addEventListener('keydown', handleEscape)
            return () => window.removeEventListener('keydown', handleEscape)
        }
    }, [isEditModalOpen])

    if (loading && students.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                <p className="text-gray-500 font-medium tracking-wide">Orchestrating student data...</p>
            </div>
        )
    }

    return (
        <>
            <div className="max-w-7xl mx-auto px-4 pb-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Students</h1>
                        <p className="text-lg text-gray-500 mt-2 font-medium">Empower your students and track their musical journey.</p>
                    </div>
                    <button
                        onClick={() => router.push('/dashboard/students/add')}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-[#2C3E50] text-white rounded-xl hover:bg-[#34495E] transition-all hover:scale-105 shadow-lg active:scale-95 font-bold"
                    >
                        <UserPlus className="w-5 h-5" />
                        <span>Add New Student</span>
                    </button>
                </div>

                {/* Main Content Card */}
                <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden">
                    <div className="p-8 bg-gray-50/50 border-b flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white border rounded-2xl shadow-sm flex items-center gap-2">
                                <Filter className="w-4 h-4 text-gray-400" />
                                <select
                                    value={filterInstrument}
                                    onChange={(e) => setFilterInstrument(e.target.value)}
                                    className="bg-transparent border-none text-sm font-bold text-gray-700 focus:ring-0 cursor-pointer min-w-[120px]"
                                >
                                    <option value="all">All Instruments</option>
                                    {allInstruments.map(inst => <option key={inst} value={inst}>{inst}</option>)}
                                </select>
                            </div>

                            {/* Show All Students Toggle for Teachers */}
                            {currentUser?.role === 'teacher' && (
                                <button
                                    onClick={() => setShowAllStudents(!showAllStudents)}
                                    className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${showAllStudents
                                        ? 'bg-[#F39C12] text-white hover:bg-[#E67E22]'
                                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    {showAllStudents ? 'Showing All Students' : 'My Students Only'}
                                </button>
                            )}
                        </div>

                        <div className="relative w-full md:w-96">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Find a student by name or email..."
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
                                    <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">Student Details</th>
                                    <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Instrument</th>
                                    <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Skill Level</th>
                                    <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">Teacher & Progress</th>
                                    <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                                    <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 border-b border-gray-50">
                                {students.length > 0 ? students.map((student: any) => (
                                    <tr key={student.id} className="hover:bg-gray-50/80 transition-all group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center space-x-5">
                                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-black text-lg shadow-sm group-hover:shadow-md transition-all group-hover:-translate-y-1">
                                                    {(student.name || student.email || "?")[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="text-lg font-bold text-gray-900 leading-tight">
                                                        {student.name || student.email}
                                                    </div>
                                                    <div className="text-sm text-gray-500 font-semibold">{student.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${student.instrument ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-gray-100 text-gray-500 border border-gray-200'
                                                }`}>
                                                <Music className="w-3 h-3 mr-1.5" />
                                                {student.instrument || 'Not Set'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                                {student.skill_level || 'General'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                                                        <User className="w-3 h-3 text-gray-500" />
                                                    </div>
                                                    <span className="text-sm font-bold text-gray-700">
                                                        {student.primary_teacher ? `${student.primary_teacher.first_name} ${student.primary_teacher.last_name}` : 'Assigned Soon'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 p-1.5 bg-gray-50 rounded-xl w-fit border border-gray-100">
                                                    <Calendar className="w-3 h-3 text-primary" />
                                                    <span className="text-[10px] text-gray-600 font-bold uppercase">
                                                        Next: {student.next_lesson_date || student.next_lesson ? new Date(student.next_lesson_date || student.next_lesson).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Pending'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            {getStatusBadge(student.status, student.is_active)}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button
                                                onClick={() => handleOpenEdit(student)}
                                                className="p-3 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-2xl transition-all active:scale-90"
                                                title="Edit Student Profile"
                                            >
                                                <Edit className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-24 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center">
                                                    <GraduationCap className="w-10 h-10 text-gray-200" />
                                                </div>
                                                <p className="text-gray-400 font-bold text-xl">Empty stage. No students found.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-4 p-4">
                        {students.length > 0 ? students.map((student: any) => (
                            <div key={student.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-black text-lg shadow-sm shrink-0">
                                            {(student.name || student.email || "?")[0].toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-bold text-gray-900 leading-tight truncate">
                                                {student.name || student.email}
                                            </div>
                                            <div className="text-xs text-gray-500 font-semibold truncate">{student.email}</div>
                                        </div>
                                    </div>
                                    <div className="shrink-0">
                                        {getStatusBadge(student.status, student.is_active)}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${student.instrument ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                                        <Music className="w-3 h-3 mr-1.5" />
                                        {student.instrument || 'Not Set'}
                                    </span>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                        {student.skill_level || 'General'}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                                                <User className="w-3 h-3 text-gray-500" />
                                            </div>
                                            <span className="text-xs font-bold text-gray-700">
                                                {student.primary_teacher ? `${student.primary_teacher.first_name} ${student.primary_teacher.last_name}` : 'No Teacher'}
                                            </span>
                                        </div>
                                        {(student.next_lesson_date || student.next_lesson) && (
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                                                    <Calendar className="w-3 h-3 text-gray-500" />
                                                </div>
                                                <span className="text-xs font-bold text-gray-700">
                                                    {new Date(student.next_lesson_date || student.next_lesson).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleOpenEdit(student)}
                                        className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all active:scale-90 bg-gray-50"
                                        title="Edit Student"
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
                                <p className="text-gray-400 font-bold">No students found.</p>
                            </div>
                        )}
                    </div>

                    {/* Footer / Pagination */}
                    <div className="p-8 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                            Displaying {students.length} of {meta?.count || 0} Students
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={!hasPrevious}
                                className="px-4 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <span className="px-4 py-2 text-sm font-bold text-white bg-primary rounded-xl shadow-md cursor-default">
                                {page} / {totalPages || 1}
                            </span>
                            <button
                                onClick={() => setPage(p => p + 1)}
                                disabled={!hasNext}
                                className="px-4 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Premium Edit Student Modal */}
            {isEditModalOpen && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-300 antialiased"
                    onClick={() => setIsEditModalOpen(false)}
                >
                    <div
                        className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in slide-in-from-top-4 duration-300 ring-1 ring-black/5 border border-white/20"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-10 py-8 bg-[#2C3E50] text-white flex items-center justify-between ring-1 ring-white/10 shrink-0">
                            <div>
                                <h2 className="text-3xl font-black tracking-tight">Student Profile</h2>
                                <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
                                    Refine Academic & Personal Details
                                </p>
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
                                            placeholder="Wolfgang"
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
                                            placeholder="Mozart"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Instrument</label>
                                        <select
                                            value={formData.instrument}
                                            onChange={(e) => setFormData({ ...formData, instrument: e.target.value })}
                                            className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary outline-none font-bold text-gray-900 transition-all text-sm appearance-none bg-no-repeat bg-[right_1.25rem_center]"
                                            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236B7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundSize: '1.25rem' }}
                                        >
                                            <option value="">{!formData.primary_teacher ? "Assign Instructor First..." : "Select Instrument..."}</option>
                                            {availableInstruments.map(inst => (
                                                <option key={inst} value={inst}>{inst}</option>
                                            ))}
                                            {formData.instrument && !availableInstruments.includes(formData.instrument) && (
                                                <option value={formData.instrument}>{formData.instrument}</option>
                                            )}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Skill Level</label>
                                        <select
                                            value={formData.skill_level}
                                            onChange={(e) => setFormData({ ...formData, skill_level: e.target.value })}
                                            className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary outline-none font-bold text-gray-900 appearance-none bg-no-repeat bg-[right_1.25rem_center] text-sm"
                                            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236B7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundSize: '1.25rem' }}
                                        >
                                            <option value="Beginner">Beginner</option>
                                            <option value="Intermediate">Intermediate</option>
                                            <option value="Advanced">Advanced</option>
                                            <option value="Professional">Professional</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Assigned Instructor</label>
                                        <select
                                            value={formData.primary_teacher}
                                            onChange={(e) => setFormData({ ...formData, primary_teacher: e.target.value })}
                                            className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary outline-none font-bold text-gray-900 appearance-none bg-no-repeat bg-[right_1.25rem_center] text-sm"
                                            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23616161\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundSize: '1.25rem' }}
                                        >
                                            <option value="">Unassigned</option>
                                            {teachers.map((t: any) => (
                                                <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Activity Status</label>
                                        <div className="flex items-center gap-4 px-6 py-3.5 bg-gray-50 rounded-2xl h-[52px]">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.is_active}
                                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                            </label>
                                            <span className="text-sm font-bold text-gray-700">{formData.is_active ? 'Active Enrollment' : 'On Leave'}</span>
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
                                        className="flex-[2] px-8 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all shadow-xl hover:shadow-primary/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                                    >
                                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Modifications'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

