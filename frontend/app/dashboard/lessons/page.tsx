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
import { Button } from '@/components/ui/button'

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
                <Loader2 className="w-10 h-10 text-[#1ABC9C] animate-spin mb-4" />
                <p className="text-gray-500 font-bold tracking-[0.2em] uppercase text-xs">Loading Lessons...</p>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight">Lessons & Plans</h1>
                    <p className="text-base sm:text-lg text-gray-500 mt-2 font-medium">Manage schedules, attendance, and lesson plans.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    {currentUser && ['admin', 'teacher'].includes(currentUser.role) && (
                        <Button
                            onClick={() => setShowPlanModal(true)}
                            className="gap-2 w-full sm:w-auto"
                        >
                            <Plus className="w-4 h-4" />
                            Create Lesson Plan
                        </Button>
                    )}
                </div>
            </div>

            {/* Filters & Controls */}
            <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-[2rem] border border-gray-100 shadow-xl space-y-4 sm:space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
                    {/* View & Status Toggles */}
                    <div className="flex flex-wrap gap-3 sm:gap-4 items-center w-full lg:w-auto">
                        {/* View Toggle */}
                        <div className="flex bg-gray-50 rounded-xl p-1 sm:p-1.5 border border-gray-100 flex-1 sm:flex-initial">
                            <Button
                                variant={viewMode === 'all' ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('all')}
                                className={`flex-1 sm:flex-initial ${viewMode === 'all' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
                            >
                                All Lessons
                            </Button>
                            <Button
                                variant={viewMode === 'my_lessons' ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('my_lessons')}
                                className={`flex-1 sm:flex-initial ${viewMode === 'my_lessons' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
                            >
                                My Students
                            </Button>
                        </div>

                        <div className="h-8 w-px bg-gray-200 hidden lg:block"></div>

                        {/* Status Filter */}
                        <div className="flex p-1 sm:p-1.5 bg-gray-50 rounded-xl border border-gray-100 overflow-x-auto w-full lg:w-auto">
                            {['all', 'scheduled', 'completed', 'cancelled'].map(status => (
                                <Button
                                    key={status}
                                    variant={filterStatus === status ? 'secondary' : 'ghost'}
                                    size="sm"
                                    onClick={() => setFilterStatus(status)}
                                    className={`whitespace-nowrap flex-1 sm:flex-initial ${filterStatus === status ? 'bg-white shadow-sm' : 'text-gray-500'}`}
                                >
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Search & Dates */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                        <div className="relative flex-1 sm:flex-initial">
                            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="pl-9 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#1ABC9C] focus:border-transparent outline-none w-full sm:w-64 font-medium shadow-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                className="px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#1ABC9C] outline-none font-medium shadow-sm w-full"
                                value={dateRange.start}
                                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-xl sm:rounded-[2.5rem] border border-gray-100 shadow-2xl overflow-hidden">
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
                                        className="rounded border-gray-300 text-[#1ABC9C] focus:ring-[#1ABC9C] w-4 h-4"
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
                                                    className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4"
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
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-gray-400 hover:text-gray-600"
                                                >
                                                    <MoreHorizontal className="w-5 h-5" />
                                                </Button>
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
                                        className="rounded border-gray-300 text-primary focus:ring-primary w-5 h-5"
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
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <MoreHorizontal className="w-5 h-5" />
                                    </Button>
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
                <div className="p-4 sm:p-6 border-t border-gray-100 bg-gray-50/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs sm:text-sm text-gray-600 font-semibold text-center sm:text-left">
                        <span className="font-black text-gray-900">{filteredLessons.length > 0 ? startIndex + 1 : 0}</span> to <span className="font-black text-gray-900">{Math.min(startIndex + itemsPerPage, filteredLessons.length)}</span> of <span className="font-black text-gray-900">{filteredLessons.length}</span>
                    </div>
                    <div className="flex space-x-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-black text-gray-700 shadow-sm whitespace-nowrap flex items-center">
                            {currentPage} / {totalPages || 1}
                        </span>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages || totalPages === 0}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
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
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowPlanModal(false)}
                                className="bg-white/10 hover:bg-white/20 text-white shadow-none"
                            >
                                <X className="w-7 h-7" />
                            </Button>
                        </div>

                        <div className="p-10 space-y-6">
                            {/* Plan Type Selection */}
                            <div className="flex gap-4">
                                <Button
                                    onClick={() => setPlanType('individual')}
                                    variant={planType === 'individual' ? 'default' : 'outline'}
                                    className={`flex-1 h-24 flex-col gap-3 ${planType === 'individual' ? 'bg-primary/10 border-primary text-primary hover:bg-primary/20' : ''}`}
                                >
                                    <User className="w-7 h-7" />
                                    <span className="font-black text-sm">Individual</span>
                                </Button>
                                <Button
                                    onClick={() => setPlanType('group')}
                                    variant={planType === 'group' ? 'default' : 'outline'}
                                    className={`flex-1 h-24 flex-col gap-3 ${planType === 'group' ? 'bg-primary/10 border-primary text-primary hover:bg-primary/20' : ''}`}
                                >
                                    <Users className="w-7 h-7" />
                                    <span className="font-black text-sm">Class / Group</span>
                                </Button>
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                        {planType === 'individual' ? 'Select Student' : 'Select Group'}
                                    </label>
                                    <select className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary outline-none font-bold text-gray-900 text-sm">
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
                                    <input type="text" className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary outline-none font-bold text-gray-900 text-sm" placeholder="e.g. Major Scales, Rhythm Basics" />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Activities & Notes</label>
                                    <textarea rows={4} className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary outline-none font-bold text-gray-900 text-sm" placeholder="Outline the lesson plan..."></textarea>
                                </div>
                            </div>
                        </div>

                        <div className="px-10 pb-10 flex gap-4">
                            <Button
                                variant="outline"
                                onClick={() => setShowPlanModal(false)}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => {
                                    alert('Lesson plan created!')
                                    setShowPlanModal(false)
                                }}
                                className="flex-[2]"
                            >
                                Save Plan
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
