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
    Plus, Trophy, Target, Star,
    BookOpen, ChevronLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogHeader, DialogContent, DialogFooter } from '@/components/ui/dialog'

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
    primary_teacher?: TeacherProfile | string | null 
    next_lesson: string | null
    next_lesson_date?: string | null
    status: string
    is_active: boolean
    first_name?: string
    last_name?: string
}

// --- Helper Functions ---
const getTeacherName = (student: StudentData, teachers: any[]): string => {
    if (student.teacher_name) return student.teacher_name
    if (student.primary_teacher && typeof student.primary_teacher === 'object') {
        const t = student.primary_teacher as TeacherProfile
        if (t.first_name || t.last_name) {
            return `${t.first_name || ''} ${t.last_name || ''}`.trim()
        }
    }
    if (typeof student.primary_teacher === 'string') {
        const teacher = teachers.find((t: any) => t.id === student.primary_teacher)
        if (teacher) {
            return `${teacher.first_name} ${teacher.last_name}`
        }
    }
    return 'Unassigned'
}

const getNextLessonDate = (student: StudentData): Date | null => {
    const d = student.next_lesson_date || student.next_lesson
    return d ? new Date(d) : null
}

const formatDate = (date: Date | null): string => {
    if (!date) return 'TBD'
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })
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

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        instrument: '',
        skill_level: '',
        primary_teacher: '',
        is_active: true
    })

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedStudent) return
        setIsSubmitting(true)
        try {
            await api.patch(`/students/${selectedStudent.id}/`, formData)
            toast.success('Member updated successfully')
            setIsEditModalOpen(false)
            if (refresh) refresh()
        } catch (error: any) {
            console.error('Update failed:', error)
            toast.error(error.response?.data?.detail || 'Failed to update member')
        } finally {
            setIsSubmitting(false)
        }
    }

    const renderStatusBadge = (isActive: boolean) => {
        return isActive ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                Active
            </span>
        ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-gray-50 text-gray-400 border border-gray-100">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                Inactive
            </span>
        )
    }

    if (loading && students.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-in fade-in duration-500">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Accessing Roster...</p>
            </div>
        )
    }

    return (
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4">
                <div className="space-y-2">
                    <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        Student Roster
                        <div className="bg-primary/10 px-3 py-1 rounded-full text-xs font-black text-primary uppercase tracking-widest">
                            {meta?.count || 0} Members
                        </div>
                    </h1>
                    <p className="text-gray-500 font-medium max-w-lg">Nurture development, oversee curriculum progression, and verify enrollment status.</p>
                </div>
                <Button
                    onClick={() => router.push('/dashboard/students/add')}
                    className="gap-2 hover:scale-105 shadow-lg shadow-primary/20 transition-all py-6 px-8"
                >
                    <Plus className="w-4 h-4" />
                    Add Student
                </Button>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                 {[
                    { label: 'Enrolled Total', value: meta?.count || 0, icon: GraduationCap, color: 'blue' },
                    { label: 'Studio Retention', value: '94%', icon: Star, color: 'emerald' },
                    { label: 'Active Progress', value: students.filter((s:any) => s.is_active).length, icon: Target, color: 'purple' },
                    { label: 'Average Skill', value: 'Intermediate', icon: Trophy, color: 'orange' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-10 h-10 bg-${stat.color}-50 rounded-xl flex items-center justify-center text-${stat.color}-600`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight uppercase tracking-tighter">{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-3xl border border-gray-100 shadow-xl">
                <div className="flex items-center gap-3 overflow-x-auto w-full md:w-auto no-scrollbar">
                    <select
                        value={filterInstrument}
                        onChange={(e) => setFilterInstrument(e.target.value)}
                        className="px-6 py-3 bg-gray-50 border-none rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-700 focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm appearance-none min-w-[180px]"
                    >
                        <option value="all">Every Instrument</option>
                        {allInstruments.map(inst => <option key={inst} value={inst}>{inst}</option>)}
                    </select>

                    {currentUser?.role === 'teacher' && (
                        <div className="flex p-1 bg-gray-50 rounded-2xl border border-gray-100">
                             <Button
                                variant={!showAllStudents ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => setShowAllStudents(false)}
                                className={`px-6 rounded-xl text-[10px] font-black uppercase tracking-widest ${!showAllStudents ? 'bg-white shadow-sm' : 'text-gray-400'}`}
                            >
                                My Scholars
                            </Button>
                            <Button
                                variant={showAllStudents ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => setShowAllStudents(true)}
                                className={`px-6 rounded-xl text-[10px] font-black uppercase tracking-widest ${showAllStudents ? 'bg-white shadow-sm' : 'text-gray-400'}`}
                            >
                                Studio Wide
                            </Button>
                        </div>
                    )}
                </div>

                <div className="relative flex-1 w-full max-w-xl">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search student identity or curriculum focus..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-transparent focus:bg-white border-2 focus:border-primary rounded-2xl font-bold text-sm text-gray-700 outline-none transition-all shadow-sm"
                    />
                </div>
            </div>

            {/* List */}
             <div className="bg-white rounded-[2rem] border border-gray-100 shadow-2xl overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full border-separate border-spacing-0">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Member Identity</th>
                                <th className="px-8 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Artistic Focus</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Lead Instructor</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Next Milestone</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {students.length > 0 ? students.map((student: any) => (
                                <tr key={student.id} className="group hover:bg-gray-50/30 transition-all">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden group-hover:scale-105 transition-all">
                                                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xs uppercase">
                                                    {(student.user?.first_name?.[0] || '') + (student.user?.last_name?.[0] || '')}
                                                </div>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-black text-gray-900 uppercase tracking-tighter leading-tight">{student.name}</span>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{student.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        {renderStatusBadge(student.is_active)}
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                                <Music className="w-4 h-4" />
                                            </div>
                                            <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">
                                                {student.instrument || 'Foundation'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                                                <User className="w-4 h-4 text-gray-400" />
                                            </div>
                                            <span className="text-sm font-bold text-gray-600">
                                                {getTeacherName(student, teachers)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex flex-col items-end">
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${getNextLessonDate(student) ? 'text-primary' : 'text-gray-300'}`}>
                                                {formatDate(getNextLessonDate(student))}
                                            </span>
                                            {getNextLessonDate(student) && (
                                                <span className="text-[9px] font-bold text-gray-400 uppercase">Confirmed</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => router.push(`/dashboard/students/${student.id}`)}
                                                className="text-gray-400 hover:text-primary rounded-xl"
                                            >
                                                <ChevronRight className="w-5 h-5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleOpenEdit(student)}
                                                className="text-gray-400 hover:text-primary rounded-xl"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="px-8 py-24 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-20 h-20 bg-gray-50 rounded-[2.5rem] flex items-center justify-center border-2 border-dashed border-gray-100">
                                                <BookOpen className="w-10 h-10 text-gray-200" />
                                            </div>
                                            <p className="text-[10px] font-black marker:text-gray-400 uppercase tracking-[0.2em]">Roster is currently empty</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-6 bg-gray-50/30 border-t border-gray-50 flex items-center justify-between">
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Page <span className="text-gray-900">{page}</span> of <span className="text-gray-900">{Math.max(1, Math.ceil((meta?.count || 0) / 20))}</span>
                    </div>
                    <div className="flex items-center gap-3">
                         <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={!meta?.previous}
                            className="rounded-xl"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                        <div className="px-6 py-2 bg-white border border-gray-100 rounded-2xl text-xs font-black text-gray-700 shadow-sm">
                            {page} / {Math.max(1, Math.ceil((meta?.count || 0) / 20))}
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setPage(p => p + 1)}
                            disabled={!meta?.next}
                            className="rounded-xl"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            <Dialog
                open={isEditModalOpen}
                onOpenChange={setIsEditModalOpen}
                size="lg"
            >
                <DialogHeader title="Academic Profile Adjustment" />
                <DialogContent>
                    <form id="edit-student-form" onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Forename</label>
                                <input
                                    required
                                    value={formData.first_name}
                                    onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-gray-50 border-transparent focus:bg-white border-2 focus:border-primary rounded-2xl font-bold text-gray-700 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Surname</label>
                                <input
                                    required
                                    value={formData.last_name}
                                    onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-gray-50 border-transparent focus:bg-white border-2 focus:border-primary rounded-2xl font-bold text-gray-700 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Digital Contact (Email)</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-gray-50 border-transparent focus:bg-white border-2 focus:border-primary rounded-2xl font-bold text-gray-700 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="p-8 bg-primary/5 rounded-3xl border border-primary/10 space-y-6">
                            <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                                <Trophy className="w-4 h-4" />
                                Curricular Configuration
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Focus Instrument</label>
                                    <select
                                        value={formData.instrument}
                                        onChange={e => setFormData({ ...formData, instrument: e.target.value })}
                                        className="w-full px-5 py-3.5 bg-white border-transparent focus:border-primary border-2 rounded-2xl font-bold text-gray-700 outline-none transition-all appearance-none"
                                    >
                                        <option value="">Select Instrument...</option>
                                        {allInstruments.map(i => <option key={i} value={i}>{i}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Proficiency Tier</label>
                                    <select
                                        value={formData.skill_level}
                                        onChange={e => setFormData({ ...formData, skill_level: e.target.value })}
                                        className="w-full px-5 py-3.5 bg-white border-transparent focus:border-primary border-2 rounded-2xl font-bold text-gray-700 outline-none transition-all appearance-none"
                                    >
                                        <option value="Beginner">Beginner / Foundation</option>
                                        <option value="Intermediate">Intermediate / Development</option>
                                        <option value="Advanced">Advanced / Mastery</option>
                                        <option value="Professional">Professional / Performer</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Assigned Mentor</label>
                                    <select
                                        value={formData.primary_teacher}
                                        onChange={e => setFormData({ ...formData, primary_teacher: e.target.value })}
                                        className="w-full px-5 py-3.5 bg-white border-transparent focus:border-primary border-2 rounded-2xl font-bold text-gray-700 outline-none transition-all appearance-none"
                                    >
                                        <option value="">Unassigned</option>
                                        {teachers.map((t: any) => (
                                            <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Enrollment Status</label>
                                    <div 
                                        onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                                        className={`flex items-center justify-between px-5 py-3.5 rounded-2xl border-2 transition-all cursor-pointer h-[54px] ${
                                            formData.is_active ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'
                                        }`}
                                    >
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${formData.is_active ? 'text-emerald-600' : 'text-gray-400'}`}>
                                            {formData.is_active ? 'Active Roster' : 'Inactive'}
                                        </span>
                                        <div className={`w-10 h-6 rounded-full p-1 transition-colors ${formData.is_active ? 'bg-emerald-500' : 'bg-gray-400'}`}>
                                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${formData.is_active ? 'translate-x-4' : 'translate-x-0'}`} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </DialogContent>
                <DialogFooter>
                    <Button
                        variant="ghost"
                        onClick={() => setIsEditModalOpen(false)}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        form="edit-student-form"
                        disabled={isSubmitting}
                        className="flex-[2] gap-2 active:scale-95 transition-transform"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Synchronizing...
                            </>
                        ) : (
                            'Execute Profile Update'
                        )}
                    </Button>
                </DialogFooter>
            </Dialog>
        </div>
    )
}
