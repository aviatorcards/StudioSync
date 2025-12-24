'use client'

import { useState } from 'react'
import { format, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns'
import { useUser } from '@/contexts/UserContext'
import { useLessons, useUsers, useBands } from '@/hooks/useDashboardData'
import {
    Search,
    Calendar,
    Filter,
    ChevronLeft,
    ChevronRight,
    MoreHorizontal,
    Plus,
    FileText,
    Users,
    User,
    Loader2,
    X,
    Clock,
    CheckCircle2
} from 'lucide-react'

interface Lesson {
    id: string
    student_name: string
    teacher_name: string
    student_instrument: string
    scheduled_start: string
    scheduled_end: string
    lesson_type: 'private' | 'group' | 'workshop' | 'recital' | 'makeup'
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
    location: string
    is_paid: boolean
}

export default function LessonsPage() {
    const { currentUser } = useUser()
    const { lessons, loading } = useLessons()
    const typedLessons = lessons as Lesson[]
    const { users } = useUsers({ page_size: 100 })

    // Derive students from users for consistent name rendering
    const students = users
        .filter((u: any) => u.role === 'student' && u.student_profile)
        .map((u: any) => ({
            id: u.student_profile.id,
            user: u,
            first_name: u.first_name,
            last_name: u.last_name,
            email: u.email
        }))
    const { bands } = useBands({ page_size: 100 })

    const [selectedLessons, setSelectedLessons] = useState<string[]>([])
    const [filterStatus, setFilterStatus] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' })
    const [viewMode, setViewMode] = useState<'all' | 'my_lessons'>('all')
    const currentTeacherName = currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : ''

    // Pagination
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    // Modal State
    const [showPlanModal, setShowPlanModal] = useState(false)
    const [planType, setPlanType] = useState<'individual' | 'group'>('individual')

    // Escape listener
    useState(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setShowPlanModal(false)
        }
        window.addEventListener('keydown', handleEsc)
        return () => window.removeEventListener('keydown', handleEsc)
    })

    const getStatusBadge = (status: string) => {
        const styles = {
            scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
            in_progress: 'bg-purple-50 text-purple-700 border-purple-200',
            completed: 'bg-green-50 text-green-700 border-green-200',
            cancelled: 'bg-red-50 text-red-700 border-red-200',
            no_show: 'bg-gray-50 text-gray-700 border-gray-200',
        }

        const key = status?.toLowerCase() || 'scheduled'
        const style = styles[key as keyof typeof styles] || styles.scheduled

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${style}`}>
                {status ? status.replace('_', ' ') : 'Unknown'}
            </span>
        )
    }

    const getTypeBadge = (type: string) => {
        const styles = {
            private: 'bg-indigo-50 text-indigo-700 border-indigo-200',
            group: 'bg-teal-50 text-teal-700 border-teal-200',
            workshop: 'bg-orange-50 text-orange-700 border-orange-200',
            recital: 'bg-pink-50 text-pink-700 border-pink-200',
            makeup: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        }
        const key = type?.toLowerCase() || 'private'
        const style = styles[key as keyof typeof styles] || styles.private

        return (
            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${style}`}>
                {type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Unknown'}
            </span>
        )
    }

    const toggleLesson = (id: string) => {
        setSelectedLessons(prev =>
            prev.includes(id) ? prev.filter(lid => lid !== id) : [...prev, id]
        )
    }

    // Filter Logic
    const filteredLessons = typedLessons.filter(lesson => {
        if (viewMode === 'my_lessons' && lesson.teacher_name !== currentTeacherName) return false
        if (filterStatus !== 'all' && lesson.status !== filterStatus) return false

        const searchLower = searchQuery.toLowerCase()
        if (searchQuery && !lesson.student_name?.toLowerCase().includes(searchLower) &&
            !lesson.teacher_name?.toLowerCase().includes(searchLower)) {
            return false
        }

        if (dateRange.start && dateRange.end) {
            const lessonDate = parseISO(lesson.scheduled_start)
            const start = startOfDay(parseISO(dateRange.start))
            const end = endOfDay(parseISO(dateRange.end))
            if (!isWithinInterval(lessonDate, { start, end })) return false
        }

        return true
    })

    // Pagination Logic
    const totalPages = Math.ceil(filteredLessons.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const currentItems = filteredLessons.slice(startIndex, startIndex + itemsPerPage)

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                <Loader2 className="w-10 h-10 text-[#F39C12] animate-spin mb-4" />
                <p className="text-gray-500 font-bold tracking-[0.2em] uppercase text-xs">Loading Lessons...</p>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto px-4 pb-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Lessons & Plans</h1>
                    <p className="text-lg text-gray-500 mt-2 font-medium">Manage schedules, attendance, and lesson plans.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    {currentUser && ['admin', 'teacher'].includes(currentUser.role) && (
                        <button
                            onClick={() => setShowPlanModal(true)}
                            className="px-5 py-3 bg-[#F39C12] text-white rounded-xl hover:bg-[#E67E22] transition-all shadow-lg text-sm font-bold flex items-center gap-2 hover:scale-105 active:scale-95"
                        >
                            <Plus className="w-4 h-4" />
                            Create Lesson Plan
                        </button>
                    )}
                </div>
            </div>

            {/* Filters & Controls */}
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* View & Status Toggles */}
                    <div className="flex flex-wrap gap-4 items-center">
                        {/* View Toggle */}
                        <div className="flex bg-gray-50 rounded-xl p-1.5 border border-gray-100">
                            <button
                                onClick={() => setViewMode('all')}
                                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                All Lessons
                            </button>
                            <button
                                onClick={() => setViewMode('my_lessons')}
                                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'my_lessons' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                My Students
                            </button>
                        </div>

                        <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

                        {/* Status Filter */}
                        <div className="flex p-1.5 bg-gray-50 rounded-xl border border-gray-100 overflow-x-auto">
                            {['all', 'scheduled', 'completed', 'cancelled'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${filterStatus === status
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Search & Dates */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search students or teachers..."
                                className="pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#F39C12] focus:border-transparent outline-none w-full sm:w-72 font-medium shadow-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                className="px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#F39C12] outline-none font-medium shadow-sm"
                                value={dateRange.start}
                                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-5 text-left w-4">
                                    <input
                                        type="checkbox"
                                        checked={selectedLessons.length === currentItems.length && currentItems.length > 0}
                                        onChange={() => {
                                            if (selectedLessons.length === currentItems.length) {
                                                setSelectedLessons([])
                                            } else {
                                                setSelectedLessons(currentItems.map(l => l.id))
                                            }
                                        }}
                                        className="rounded border-gray-300 text-[#F39C12] focus:ring-[#F39C12] w-4 h-4"
                                    />
                                </th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap">Date & Time</th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap">Student / Group</th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap">Instructor</th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap">Type</th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap">Status</th>
                                <th className="px-6 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {currentItems.length > 0 ? (
                                currentItems.map((lesson) => {
                                    const start = parseISO(lesson.scheduled_start)
                                    const end = parseISO(lesson.scheduled_end)
                                    const duration = (end.getTime() - start.getTime()) / (1000 * 60)

                                    return (
                                        <tr key={lesson.id} className="hover:bg-gray-50/50 transition-all group">
                                            <td className="px-6 py-5">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedLessons.includes(lesson.id)}
                                                    onChange={() => toggleLesson(lesson.id)}
                                                    className="rounded border-gray-300 text-[#F39C12] focus:ring-[#F39C12] w-4 h-4"
                                                />
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-sm font-bold text-gray-900">{format(start, 'MMM d, yyyy')}</span>
                                                    <span className="text-xs text-gray-500 flex items-center gap-1.5 font-semibold">
                                                        <Clock className="w-3 h-3" />
                                                        {format(start, 'h:mm a')} - {format(end, 'h:mm a')} ({duration}m)
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-blue-700 text-xs font-black border border-blue-200">
                                                        {lesson.student_name?.split(' ').map(n => n[0]).join('')}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-gray-900">{lesson.student_name}</div>
                                                        <div className="text-xs text-gray-500 font-semibold">{lesson.student_instrument}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <div className="text-sm text-gray-700 flex items-center gap-2 font-semibold">
                                                    <div className="h-7 w-7 shrink-0 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                                                        <User className="w-3.5 h-3.5 text-gray-500" />
                                                    </div>
                                                    {lesson.teacher_name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                {getTypeBadge(lesson.lesson_type)}
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                {getStatusBadge(lesson.status)}
                                            </td>
                                            <td className="px-6 py-5 text-right whitespace-nowrap">
                                                <button className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-all active:scale-90">
                                                    <MoreHorizontal className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center gap-4">
                                            <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center border-2 border-dashed border-gray-200">
                                                <FileText className="w-10 h-10 text-gray-200" />
                                            </div>
                                            <div>
                                                <p className="text-xl font-black text-gray-900 mb-1">School&apos;s out!</p>
                                                <p className="text-sm text-gray-400 font-medium">Try adjusting your filters or search terms</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4 p-4">
                    {currentItems.length > 0 ? currentItems.map((lesson) => {
                        const start = parseISO(lesson.scheduled_start)
                        const end = parseISO(lesson.scheduled_end)
                        const duration = (end.getTime() - start.getTime()) / (1000 * 60)

                        return (
                            <div key={lesson.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black text-gray-900">{format(start, 'MMM d, yyyy')}</span>
                                        <span className="text-xs text-gray-500 flex items-center gap-1.5 font-semibold">
                                            <Clock className="w-3 h-3" />
                                            {format(start, 'h:mm a')} - {format(end, 'h:mm a')} ({duration}m)
                                        </span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={selectedLessons.includes(lesson.id)}
                                        onChange={() => toggleLesson(lesson.id)}
                                        className="rounded border-gray-300 text-[#F39C12] focus:ring-[#F39C12] w-5 h-5"
                                    />
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-blue-700 text-xs font-black border border-blue-200">
                                        {lesson.student_name?.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-900">{lesson.student_name}</div>
                                        <div className="text-xs text-gray-500 font-semibold">{lesson.student_instrument}</div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between flex-wrap gap-2">
                                    <div className="flex items-center gap-2">
                                        {getTypeBadge(lesson.lesson_type)}
                                        {getStatusBadge(lesson.status)}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                                        <div className="h-6 w-6 shrink-0 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                                            <User className="w-3 h-3 text-gray-500" />
                                        </div>
                                        {lesson.teacher_name}
                                    </div>
                                    <button className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-all active:scale-90">
                                        <MoreHorizontal className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )
                    }) : (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                <FileText className="w-8 h-8 text-gray-200" />
                            </div>
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No Lessons Found</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                <div className="p-6 border-t border-gray-100 bg-gray-50/30 flex items-center justify-between">
                    <div className="text-sm text-gray-600 font-semibold">
                        Showing <span className="font-black text-gray-900">{filteredLessons.length > 0 ? startIndex + 1 : 0}</span> to <span className="font-black text-gray-900">{Math.min(startIndex + itemsPerPage, filteredLessons.length)}</span> of <span className="font-black text-gray-900">{filteredLessons.length}</span> results
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-2.5 border border-gray-200 rounded-xl bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-90 shadow-sm"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-black text-gray-700 shadow-sm">
                            Page {currentPage} of {totalPages || 1}
                        </span>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="p-2.5 border border-gray-200 rounded-xl bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-90 shadow-sm"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Create Lesson Plan Modal */}
            {showPlanModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300" onClick={() => setShowPlanModal(false)}>
                    <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in slide-in-from-top-4 duration-300" onClick={e => e.stopPropagation()}>
                        <div className="px-10 py-8 bg-[#2C3E50] text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-3xl font-black tracking-tight">Create Lesson Plan</h3>
                                <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Design Your Curriculum</p>
                            </div>
                            <button onClick={() => setShowPlanModal(false)} className="w-12 h-12 rounded-2xl hover:bg-white/10 flex items-center justify-center transition-colors">
                                <X className="w-7 h-7" />
                            </button>
                        </div>

                        <div className="p-10 space-y-6">
                            {/* Plan Type Selection */}
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setPlanType('individual')}
                                    className={`flex-1 py-4 px-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${planType === 'individual' ? 'border-[#F39C12] bg-orange-50 text-[#F39C12]' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}
                                >
                                    <User className="w-7 h-7" />
                                    <span className="font-black text-sm">Individual</span>
                                </button>
                                <button
                                    onClick={() => setPlanType('group')}
                                    className={`flex-1 py-4 px-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${planType === 'group' ? 'border-[#F39C12] bg-orange-50 text-[#F39C12]' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}
                                >
                                    <Users className="w-7 h-7" />
                                    <span className="font-black text-sm">Class / Group</span>
                                </button>
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                        {planType === 'individual' ? 'Select Student' : 'Select Group'}
                                    </label>
                                    <select className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#F39C12] outline-none font-bold text-gray-900 text-sm">
                                        <option value="">Select...</option>
                                        {planType === 'individual' ? (
                                            students.map((student: any) => {
                                                const user = student.user || {}
                                                const firstName = student.first_name || user.first_name
                                                const lastName = student.last_name || user.last_name
                                                const fullName = user.full_name || (firstName ? `${firstName} ${lastName}` : '') || student.email || 'Unnamed Student'
                                                return <option key={student.id} value={student.id}>{fullName}</option>
                                            })
                                        ) : (
                                            bands.map((band: any) => (
                                                <option key={band.id} value={band.id}>{band.name || 'Unnamed Group'}</option>
                                            ))
                                        )}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Lesson Topic / Goal</label>
                                    <input type="text" className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#F39C12] outline-none font-bold text-gray-900 text-sm" placeholder="e.g. Major Scales, Rhythm Basics" />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Activities & Notes</label>
                                    <textarea rows={4} className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#F39C12] outline-none font-bold text-gray-900 text-sm" placeholder="Outline the lesson plan..."></textarea>
                                </div>
                            </div>
                        </div>

                        <div className="px-10 pb-10 flex gap-4">
                            <button
                                onClick={() => setShowPlanModal(false)}
                                className="flex-1 px-8 py-4 border-2 border-gray-100 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all active:scale-95"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    alert('Lesson plan created!')
                                    setShowPlanModal(false)
                                }}
                                className="flex-[2] px-8 py-4 bg-[#F39C12] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#E67E22] transition-all shadow-xl active:scale-95"
                            >
                                Save Plan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
