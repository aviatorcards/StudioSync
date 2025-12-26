'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { useStudents, useTeachers } from '@/hooks/useDashboardData'
import api from '@/services/api'
import { toast } from 'react-hot-toast'
import {
    X, Loader2, UserPlus, Music,
    Link as LinkIcon, Edit, UserCog,
    Search, Filter, ChevronRight,
    GraduationCap, User, Calendar,
    MoreHorizontal, Mail, Phone,
    CheckCircle2, XCircle, AlertCircle
} from 'lucide-react'

// --- Types ---
interface TeacherProfile {
    id: string
    first_name: string
    last_name: string
    email?: string
}

interface StudentData {
    id: string
    name: string
    email: string
    instrument: string | null
    skill_level: string | null
    teacher_name: string | null
    primary_teacher?: TeacherProfile | string | null // can be expanded object or ID
    next_lesson: string | null
    next_lesson_date?: string | null
    status: string
    is_active: boolean
    // Extra fields for form
    first_name?: string
    last_name?: string
}

// --- Helper Functions ---
const getTeacherName = (student: StudentData): string => {
    // 1. Try explicit teacher name field
    if (student.teacher_name) return student.teacher_name

    // 2. Try primary_teacher object
    if (student.primary_teacher && typeof student.primary_teacher === 'object') {
        const t = student.primary_teacher as TeacherProfile
        if (t.first_name || t.last_name) {
            return `${t.first_name || ''} ${t.last_name || ''}`.trim()
        }
    }

    // 3. Fallbacks
    return 'Unassigned'
}

const getNextLessonDate = (student: StudentData): Date | null => {
    const d = student.next_lesson_date || student.next_lesson
    return d ? new Date(d) : null
}

const formatDate = (date: Date | null): string => {
    if (!date) return 'Not Scheduled'
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function StudentsPage() {
    const router = useRouter()
    const { currentUser } = useUser()
    const { teachers } = useTeachers()

    // --- State ---
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Filter state
    const [searchQuery, setSearchQuery] = useState('')
    const [filterInstrument, setFilterInstrument] = useState('all')
    const [showAllStudents, setShowAllStudents] = useState(false)
    const [page, setPage] = useState(1)

    // Data Fetching
    const { students, meta, loading, refresh } = useStudents({
        page,
        search: searchQuery,
        instrument: filterInstrument !== 'all' ? filterInstrument : undefined,
        teacher_id: (currentUser?.role === 'teacher' && !showAllStudents && (currentUser as any).teacher_profile?.id)
            ? (currentUser as any).teacher_profile.id
            : undefined
    })

    // --- Derived Data ---
    const allInstruments = useMemo(() => {
        const set = new Set<string>()
        teachers.forEach((t: any) => {
            if (Array.isArray(t.specialties)) t.specialties.forEach((s: string) => set.add(s))
            if (Array.isArray(t.instruments)) t.instruments.forEach((s: string) => set.add(s))
        })
        return Array.from(set).sort()
    }, [teachers])

    // --- Event Handlers ---
    const handleOpenEdit = (student: any) => {
        setSelectedStudent(student)
        const [firstName, ...lastNameParts] = (student.name || '').split(' ')
        setFormData({
            first_name: firstName || '',
            last_name: lastNameParts.join(' ') || '',
            email: student.email || '',
            instrument: student.instrument || '',
            skill_level: student.skill_level || 'Beginner',
            primary_teacher: typeof student.primary_teacher === 'object' ? student.primary_teacher?.id : student.primary_teacher || student.teacher_id || '',
            is_active: student.is_active ?? true
        })
        setIsEditModalOpen(true)
    }

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        instrument: '',
        skill_level: '',
        primary_teacher: '',
        is_active: true
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedStudent) return
        setIsSubmitting(true)
        try {
            await api.patch(`/students/${selectedStudent.id}/`, formData)
            toast.success('Student updated successfully')
            setIsEditModalOpen(false)
            if (refresh) refresh()
        } catch (error: any) {
            console.error('Update failed:', error)
            toast.error(error.response?.data?.detail || 'Failed to update student')
        } finally {
            setIsSubmitting(false)
        }
    }

    // --- Render Helpers ---
    const renderStatusBadge = (isActive: boolean) => {
        return isActive ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-emerald-50 text-emerald-600 border border-emerald-100">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active
            </span>
        ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-gray-50 text-gray-500 border border-gray-200">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                Inactive
            </span>
        )
    }

    // --- Loading State ---
    if (loading && students.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-in fade-in duration-500">
                <Loader2 className="w-10 h-10 text-[#1ABC9C] animate-spin" />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading Roster...</p>
            </div>
        )
    }

    return (
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* --- Header Section --- */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4">
                <div className="space-y-2">
                    <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                        Students
                    </h1>
                    <p className="text-gray-500 font-medium max-w-lg">
                        Manage enrollments, track progress, and organize your studio roster.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push('/dashboard/students/add')}
                        className="flex items-center gap-2 px-5 py-3 bg-[#1ABC9C] hover:bg-[#16A085] text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-bold text-sm active:scale-95"
                    >
                        <UserPlus className="w-4 h-4" />
                        <span className="hidden sm:inline">Add Student</span>
                        <span className="sm:hidden">Add</span>
                    </button>
                </div>
            </header>

            {/* --- Filters & Controls --- */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                    <div className="flex items-center border border-gray-200 rounded-xl px-3 py-2 bg-gray-50/50 hover:bg-white transition-colors">
                        <Filter className="w-4 h-4 text-gray-400 mr-2" />
                        <select
                            value={filterInstrument}
                            onChange={(e) => setFilterInstrument(e.target.value)}
                            className="bg-transparent border-none text-sm font-bold text-gray-700 focus:ring-0 cursor-pointer outline-none min-w-[140px]"
                        >
                            <option value="all">All Instruments</option>
                            {allInstruments.map(inst => <option key={inst} value={inst}>{inst}</option>)}
                        </select>
                    </div>

                    {currentUser?.role === 'teacher' && (
                        <button
                            onClick={() => setShowAllStudents(!showAllStudents)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border whitespace-nowrap ${showAllStudents
                                ? 'bg-gray-800 text-white border-gray-800'
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            {showAllStudents ? 'All Students' : 'My Students'}
                        </button>
                    )}
                </div>

                <div className="relative w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1ABC9C] transition-all"
                    />
                </div>
            </div>

            {/* --- Data Display --- */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden min-h-[400px]">
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">Student</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">Instrument</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">Instructors</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Next Lesson</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {students.length > 0 ? students.map((student: any) => (
                                <tr key={student.id} className="hover:bg-gray-50/50 transition-all group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 font-black text-lg shadow-inner">
                                                {(student.name || "?")[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">{student.name}</div>
                                                <div className="text-xs text-gray-500 font-medium">{student.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        {renderStatusBadge(student.is_active)}
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                                <Music className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-bold text-gray-700 capitalize">
                                                {student.instrument || 'None'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-700">
                                                    {getTeacherName(student)}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <span className={`text-sm font-bold ${getNextLessonDate(student) ? 'text-gray-900' : 'text-gray-400'}`}>
                                            {formatDate(getNextLessonDate(student))}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <button
                                            onClick={() => handleOpenEdit(student)}
                                            className="p-2 text-gray-400 hover:text-[#1ABC9C] hover:bg-teal-50 rounded-xl transition-all active:scale-95"
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
                                            <p className="text-gray-400 font-bold text-lg">No students found.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards (Redesigned) */}
                <div className="lg:hidden p-4 space-y-4">
                    {students.length > 0 ? students.map((student: any) => (
                        <div key={student.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4 relative overflow-hidden">
                            {/* Accent Bar */}
                            <div className={`absolute top-0 left-0 w-1.5 h-full ${student.is_active ? 'bg-[#1ABC9C]' : 'bg-red-400'}`} />

                            <div className="flex items-start justify-between pl-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700 font-black text-lg">
                                        {(student.name || "?")[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 leading-tight">{student.name}</h3>
                                        <p className="text-xs text-gray-500 font-medium truncate max-w-[150px]">{student.email}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleOpenEdit(student)}
                                    className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:text-[#1ABC9C]"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pl-3">
                                <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                                    <div className="flex items-center gap-1.5 text-xs font-black text-gray-400 uppercase tracking-widest">
                                        <User className="w-3 h-3" />
                                        Teacher
                                    </div>
                                    <p className="text-xs font-bold text-gray-800 truncate">
                                        {getTeacherName(student)}
                                    </p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                                    <div className="flex items-center gap-1.5 text-xs font-black text-gray-400 uppercase tracking-widest">
                                        <Calendar className="w-3 h-3" />
                                        Next
                                    </div>
                                    <p className="text-xs font-bold text-gray-800 truncate">
                                        {formatDate(getNextLessonDate(student))}
                                    </p>
                                </div>
                            </div>

                            <div className="pl-3 flex items-center gap-2 pt-1">
                                {renderStatusBadge(student.is_active)}
                                {student.instrument && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-blue-50 text-blue-600 border border-blue-100">
                                        <Music className="w-3 h-3" />
                                        {student.instrument}
                                    </span>
                                )}
                            </div>
                        </div>
                    )) : (
                        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                            <GraduationCap className="w-12 h-12 text-gray-200" />
                            <p className="text-gray-400 font-bold">No students found matching your filters.</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                <div className="p-6 border-t border-gray-50 flex items-center justify-between bg-gray-50/30">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest hidden sm:block">
                        Page {page} of {Math.max(1, Math.ceil((meta?.count || 0) / 20))}
                    </p>
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={!meta?.previous}
                            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPage(p => p + 1)}
                            disabled={!meta?.next}
                            className="px-4 py-2 bg-[#1ABC9C] text-white rounded-xl text-xs font-bold hover:bg-[#16A085] disabled:opacity-50 disabled:hover:bg-[#1ABC9C] transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* --- Edit Modal (Overhaul) --- */}
            {isEditModalOpen && selectedStudent && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        {/* Modal Header */}
                        <div className="bg-[#2C3E50] px-8 py-6 flex items-center justify-between text-white">
                            <div>
                                <h2 className="text-2xl font-black tracking-tight">{formData.first_name} {formData.last_name}</h2>
                                <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1">Edit Student Details</p>
                            </div>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">First Name</label>
                                    <input
                                        required
                                        value={formData.first_name}
                                        onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border-transparent focus:bg-white border-2 focus:border-[#1ABC9C] rounded-xl font-bold text-gray-700 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Last Name</label>
                                    <input
                                        required
                                        value={formData.last_name}
                                        onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border-transparent focus:bg-white border-2 focus:border-[#1ABC9C] rounded-xl font-bold text-gray-700 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border-transparent focus:bg-white border-2 focus:border-[#1ABC9C] rounded-xl font-bold text-gray-700 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="h-px bg-gray-100" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Instrument</label>
                                    <select
                                        value={formData.instrument}
                                        onChange={e => setFormData({ ...formData, instrument: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border-transparent focus:bg-white border-2 focus:border-[#1ABC9C] rounded-xl font-bold text-gray-700 outline-none transition-all appearance-none"
                                    >
                                        <option value="">Select Instrument...</option>
                                        {allInstruments.map(i => <option key={i} value={i}>{i}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Skill Level</label>
                                    <select
                                        value={formData.skill_level}
                                        onChange={e => setFormData({ ...formData, skill_level: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border-transparent focus:bg-white border-2 focus:border-[#1ABC9C] rounded-xl font-bold text-gray-700 outline-none transition-all appearance-none"
                                    >
                                        <option value="Beginner">Beginner</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Advanced">Advanced</option>
                                        <option value="Professional">Professional</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Primary Teacher</label>
                                    <select
                                        value={formData.primary_teacher}
                                        onChange={e => setFormData({ ...formData, primary_teacher: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border-transparent focus:bg-white border-2 focus:border-[#1ABC9C] rounded-xl font-bold text-gray-700 outline-none transition-all appearance-none"
                                    >
                                        <option value="">Unassigned</option>
                                        {teachers.map((t: any) => (
                                            <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Status</label>
                                    <div className="flex items-center gap-4 px-4 py-3 bg-gray-50 rounded-xl h-[50px]">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.is_active}
                                                onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1ABC9C]"></div>
                                        </label>
                                        <span className="text-sm font-bold text-gray-700">
                                            {formData.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </form>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="flex-1 py-3.5 border-2 border-gray-200 text-gray-500 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-gray-100 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="flex-[2] py-3.5 bg-[#1ABC9C] text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-[#16A085] transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
