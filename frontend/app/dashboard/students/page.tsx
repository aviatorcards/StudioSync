'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { useStudents, useTeachers } from '@/hooks/useDashboardData'
import api from '@/services/api'
import { toast } from 'react-hot-toast'
import {
    Loader2, UserPlus, Music,
    Link as LinkIcon, Edit, UserCog,
    Search, Filter, ChevronRight,
    GraduationCap, User, Calendar,
    MoreHorizontal, Mail, Phone,
    CheckCircle2, XCircle, AlertCircle,
    Plus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Modal from '@/components/Modal'

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
const getTeacherName = (student: StudentData, teachers: any[]): string => {
    // 1. Try explicit teacher name field
    if (student.teacher_name) return student.teacher_name

    // 2. Try primary_teacher object
    if (student.primary_teacher && typeof student.primary_teacher === 'object') {
        const t = student.primary_teacher as TeacherProfile
        if (t.first_name || t.last_name) {
            return `${t.first_name || ''} ${t.last_name || ''}`.trim()
        }
    }

    // 3. Try primary_teacher ID from the teachers list
    if (typeof student.primary_teacher === 'string') {
        const teacher = teachers.find((t: any) => t.id === student.primary_teacher)
        if (teacher) {
            return `${teacher.first_name} ${teacher.last_name}`
        }
    }

    // 4. Fallbacks
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

const getStudentColor = (student: any) => {
    if (!student.is_active) return '#EF4444' // red for inactive
    // Use CSS variable for primary color (respects user's color scheme preference)
    return 'var(--color-primary, #1ABC9C)'
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
                <Loader2 className="w-10 h-10 animate-spin" style={{ color: 'var(--color-primary, #1ABC9C)' }} />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading Roster...</p>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto px-4 pb-8 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
                <div>
                    <h1 className="text-xl md:text-4xl font-black text-gray-900 tracking-tight">Students</h1>
                    <p className="text-xs md:text-lg text-gray-500 mt-0.5 md:mt-2 font-medium">Manage enrollments, track progress, and organize your studio roster.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button
                        onClick={() => router.push('/dashboard/students/add')}
                        size="sm"
                        className="gap-2 w-full sm:w-auto"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Add Student
                    </Button>
                </div>
            </div>

            {/* --- Filters & Controls --- */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                    <div className="flex gap-2">
                        <select
                            value={filterInstrument}
                            onChange={(e) => setFilterInstrument(e.target.value)}
                            className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary transition-all shadow-sm appearance-none pr-8 bg-no-repeat bg-right"
                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`, backgroundPosition: 'right 0.5rem center', backgroundSize: '1.25em 1.25em' }}
                        >
                            <option value="all">All Instruments</option>
                            {allInstruments.map(inst => <option key={inst} value={inst}>{inst}</option>)}
                        </select>
                    </div>

                    {currentUser?.role === 'teacher' && (
                        <Button
                            variant={showAllStudents ? 'secondary' : 'outline'}
                            size="sm"
                            onClick={() => setShowAllStudents(!showAllStudents)}
                            className="whitespace-nowrap text-xs"
                        >
                            {showAllStudents ? 'All Students' : 'My Students'}
                        </Button>
                    )}
                </div>

                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
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
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-md flex-shrink-0">
                                                {(student.user?.first_name?.[0] || '') + (student.user?.last_name?.[0] || '')}
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
                                                    {getTeacherName(student, teachers)}
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
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleOpenEdit(student)}
                                            className="text-gray-400 hover:text-primary hover:bg-primary/5"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>
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

                {/* Mobile List View (Compact) */}
                <div className="md:hidden space-y-0 bg-white rounded-xl border border-gray-100 shadow-md overflow-hidden">
                    {students.length > 0 ? students.map((student: any, index: number) => (
                        <div
                            key={student.id}
                            className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
                            style={{ borderLeftWidth: '3px', borderLeftColor: getStudentColor(student) }}
                        >
                            {/* Avatar */}
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xs shadow-sm flex-shrink-0">
                                {student.first_name?.[0] && student.last_name?.[0] ? (
                                    <>{student.first_name[0]}{student.last_name[0]}</>
                                ) : (
                                    <User className="w-4 h-4" />
                                )}
                            </div>

                            {/* Main Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <h3 className="text-sm font-bold text-gray-900 truncate">
                                        {student.first_name && student.last_name
                                            ? `${student.first_name} ${student.last_name}`
                                            : student.name || student.email || 'Unknown Student'
                                        }
                                    </h3>
                                    {renderStatusBadge(student.is_active)}
                                </div>
                                <div className="flex items-center gap-3 text-[10px] text-gray-500 font-medium">
                                    {student.instrument && (
                                        <span className="inline-flex items-center gap-1">
                                            <Music className="w-2.5 h-2.5" />
                                            {student.instrument}
                                        </span>
                                    )}
                                    <span className="inline-flex items-center gap-1">
                                        <User className="w-2.5 h-2.5" />
                                        {getTeacherName(student, teachers)}
                                    </span>
                                </div>
                            </div>

                            {/* Action Button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenEdit(student)}
                                className="text-gray-400 hover:text-primary h-8 w-8 flex-shrink-0"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    )) : (
                        <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                            <GraduationCap className="w-10 h-10 text-gray-200" />
                            <p className="text-gray-400 text-sm font-bold">No students found matching your filters.</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                <div className="p-3 border-t border-gray-50 flex items-center justify-between bg-gray-50/30">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest hidden sm:block">
                        Page {page} of {Math.max(1, Math.ceil((meta?.count || 0) / 20))}
                    </p>
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={!meta?.previous}
                        >
                            Previous
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => setPage(p => p + 1)}
                            disabled={!meta?.next}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>

            {/* --- Edit Modal (Overhaul) --- */}
            {isEditModalOpen && selectedStudent && (
                <Modal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    title={`${formData.first_name} ${formData.last_name}`}
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
                                    required
                                    value={formData.first_name}
                                    onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border-transparent focus:bg-white border-2 focus:border-primary rounded-xl font-bold text-gray-700 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Last Name</label>
                                <input
                                    required
                                    value={formData.last_name}
                                    onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border-transparent focus:bg-white border-2 focus:border-primary rounded-xl font-bold text-gray-700 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border-transparent focus:bg-white border-2 focus:border-primary rounded-xl font-bold text-gray-700 outline-none transition-all"
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
                                    className="w-full px-4 py-3 bg-gray-50 border-transparent focus:bg-white border-2 focus:border-primary rounded-xl font-bold text-gray-700 outline-none transition-all appearance-none"
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
                                    className="w-full px-4 py-3 bg-gray-50 border-transparent focus:bg-white border-2 focus:border-primary rounded-xl font-bold text-gray-700 outline-none transition-all appearance-none"
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
                                    className="w-full px-4 py-3 bg-gray-50 border-transparent focus:bg-white border-2 focus:border-primary rounded-xl font-bold text-gray-700 outline-none transition-all appearance-none"
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
