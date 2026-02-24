'use client'

import { useState } from 'react'
import { format, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns'
import { useUser } from '@/contexts/UserContext'
import { useLessons, useUsers, useBands, useLessonPlans, useResources } from '@/hooks/useDashboardData'
import ResourceSelector from '@/components/ResourceSelector'
import type { LessonPlan, LessonPlanFormData } from '@/types/lessonPlan'
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
    CheckCircle2,
    BookOpen,
    Target,
    Activity,
    Sparkles,
    Trash2,
    Edit,
    Package,
    Tag
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogHeader, DialogContent, DialogFooter } from '@/components/ui/dialog'

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

    // Lesson Plan State
    const { plans, loading: plansLoading, createPlan, updatePlan, deletePlan } = useLessonPlans()
    const [showPlanModal, setShowPlanModal] = useState(false)
    const [editingPlan, setEditingPlan] = useState<LessonPlan | null>(null)
    const [showResourceSelector, setShowResourceSelector] = useState(false)
    const [formData, setFormData] = useState<LessonPlanFormData>({
        title: '',
        content: '',
        estimated_duration_minutes: 60,
        tags: [],
        is_public: false,
        resource_ids: []
    })
    const [tagInput, setTagInput] = useState('')
    const [submitting, setSubmitting] = useState(false)

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
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${style}`}>
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
            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-tighter ${style}`}>
                {type ? type : 'Unknown'}
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
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-in fade-in duration-500">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Synchronizing Lessons...</p>
            </div>
        )
    }

    return (
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4">
                <div className="space-y-2">
                    <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight">Lessons & Plans</h1>
                    <p className="text-gray-500 font-medium max-w-lg">Orchestrate your pedagogical workflow and track student evolution.</p>
                </div>
                {currentUser && ['admin', 'teacher'].includes(currentUser.role) && (
                    <Button
                        onClick={() => setShowPlanModal(true)}
                        className="gap-2 hover:scale-105 shadow-lg shadow-primary/20 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        New Lesson Plan
                    </Button>
                )}
            </header>

            {/* Controls */}
            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-xl space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-3 items-center">
                        <div className="flex bg-gray-50 rounded-2xl p-1 border border-gray-100">
                            <Button
                                variant={viewMode === 'all' ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('all')}
                                className={`px-4 rounded-xl text-[10px] font-black uppercase tracking-widest ${viewMode === 'all' ? 'bg-white shadow-sm' : 'text-gray-400'}`}
                            >
                                All Lessons
                            </Button>
                            <Button
                                variant={viewMode === 'my_lessons' ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('my_lessons')}
                                className={`px-4 rounded-xl text-[10px] font-black uppercase tracking-widest ${viewMode === 'my_lessons' ? 'bg-white shadow-sm' : 'text-gray-400'}`}
                            >
                                My Students
                            </Button>
                        </div>
                        <div className="flex p-1 bg-gray-50 rounded-2xl border border-gray-100 overflow-x-auto no-scrollbar">
                            {['all', 'scheduled', 'completed', 'cancelled'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                        filterStatus === status
                                            ? 'bg-white text-primary shadow-sm'
                                            : 'text-gray-400 hover:text-gray-600'
                                    }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search students, teachers..."
                                className="pl-12 pr-4 py-3 bg-gray-50 border-transparent focus:bg-white border-2 focus:border-primary rounded-2xl font-bold text-sm text-gray-700 outline-none transition-all w-full"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <input
                            type="date"
                            className="px-4 py-3 bg-gray-50 border-transparent focus:bg-white border-2 focus:border-primary rounded-2xl font-bold text-sm text-gray-700 outline-none transition-all min-w-[150px]"
                            value={dateRange.start}
                            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-2xl overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full border-separate border-spacing-0">
                        <thead className="bg-gray-50/50">
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
                                        className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4"
                                    />
                                </th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Date & Schedule</th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Student / Group</th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Instructor</th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</th>

                                <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {currentItems.length > 0 ? (
                                currentItems.map((lesson) => {
                                    const start = parseISO(lesson.scheduled_start)
                                    const end = parseISO(lesson.scheduled_end)
                                    const duration = (end.getTime() - start.getTime()) / (1000 * 60)

                                    return (
                                        <tr key={lesson.id} className="hover:bg-gray-50/30 transition-all group">
                                            <td className="px-6 py-6">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedLessons.includes(lesson.id)}
                                                    onChange={() => toggleLesson(lesson.id)}
                                                    className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4"
                                                />
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-sm font-black text-gray-900 tracking-tight">{format(start, 'EEE, MMM d')}</span>
                                                    <span className="text-[10px] text-gray-400 flex items-center gap-1.5 font-black uppercase tracking-widest">
                                                        <Clock className="w-3 h-3 text-primary" />
                                                        {format(start, 'h:mm a')} • {duration}m
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 shrink-0 rounded-2xl bg-primary/5 flex items-center justify-center text-primary text-xs font-black border border-primary/10">
                                                        {lesson.student_name?.split(' ').map(n => n[0]).join('')}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-black text-gray-900 tracking-tight uppercase tracking-tighter">{lesson.student_name}</div>
                                                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{lesson.student_instrument}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 font-bold text-gray-600 text-sm">
                                                {lesson.teacher_name}
                                            </td>
                                            <td className="px-6 py-6">
                                                {getTypeBadge(lesson.lesson_type)}
                                            </td>
                                            <td className="px-6 py-6">
                                                {getStatusBadge(lesson.status)}
                                            </td>
                                            <td className="px-6 py-6 text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-gray-300 hover:text-gray-600 hover:bg-gray-100/50"
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
                                            <div className="w-20 h-20 bg-gray-50 rounded-[2.5rem] flex items-center justify-center border-2 border-dashed border-gray-100">
                                                <BookOpen className="w-10 h-10 text-gray-200" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">No matching lessons found</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-6 bg-gray-50/30 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Showing <span className="text-gray-900">{startIndex + 1}</span> to <span className="text-gray-900">{Math.min(startIndex + itemsPerPage, filteredLessons.length)}</span> of <span className="text-gray-900">{filteredLessons.length}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="rounded-xl"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                        <div className="px-6 py-2 bg-white border border-gray-100 rounded-2xl text-xs font-black text-gray-700 shadow-sm">
                            {currentPage} / {totalPages || 1}
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="rounded-xl"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Lesson Plans Section */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-gray-900">Lesson Plan Templates</h2>
                        <p className="text-sm text-gray-600 mt-1">Reusable curriculum frameworks with attached resources</p>
                    </div>
                    <div className="text-sm text-gray-500">
                        {plans.length} plan{plans.length !== 1 ? 's' : ''}
                    </div>
                </div>

                {plansLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                ) : plans.length === 0 ? (
                    <div className="text-center py-12 space-y-3">
                        <BookOpen className="w-12 h-12 text-gray-300 mx-auto" />
                        <p className="text-gray-500">No lesson plans yet</p>
                        <p className="text-sm text-gray-400">Create your first template to get started</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {plans.map((plan: LessonPlan) => (
                            <div key={plan.id} className="border border-gray-200 rounded-2xl p-4 hover:shadow-lg transition-shadow">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900 line-clamp-1">{plan.title}</h3>
                                        <p className="text-xs text-gray-500 mt-1">{plan.created_by_name}</p>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => {
                                                setEditingPlan(plan)
                                                setFormData({
                                                    title: plan.title,
                                                    content: plan.content,
                                                    estimated_duration_minutes: plan.estimated_duration_minutes,
                                                    tags: plan.tags,
                                                    is_public: plan.is_public,
                                                    resource_ids: plan.resources?.map(r => r.id) || []
                                                })
                                                setShowPlanModal(true)
                                            }}
                                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            <Edit className="w-4 h-4 text-gray-600" />
                                        </button>
                                        <button
                                            onClick={async () => {
                                                if (confirm('Delete this lesson plan?')) {
                                                    await deletePlan(plan.id)
                                                }
                                            }}
                                            className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-600" />
                                        </button>
                                    </div>
                                </div>
                                {(plan.description || plan.content) && (
                                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                                        {plan.description || plan.content}
                                    </p>
                                )}
                                <div className="flex items-center gap-2 flex-wrap mb-3">

                                    <span className="text-xs text-gray-500">{plan.estimated_duration_minutes} min</span>
                                    {plan.resources && plan.resources.length > 0 && (
                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                            <Package className="w-3 h-3" />
                                            {plan.resources.length}
                                        </span>
                                    )}
                                </div>
                                {plan.tags && plan.tags.length > 0 && (
                                    <div className="flex gap-1 flex-wrap">
                                        {plan.tags.slice(0, 3).map((tag, idx) => (
                                            <span key={idx} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                                                {tag}
                                            </span>
                                        ))}
                                        {plan.tags.length > 3 && (
                                            <span className="text-xs text-gray-400">+{plan.tags.length - 3}</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create/Edit Lesson Plan Modal */}
            <Dialog
                open={showPlanModal}
                onOpenChange={(open) => {
                    setShowPlanModal(open)
                    if (!open) {
                        setEditingPlan(null)
                        setFormData({
                            title: '',
                            content: '',
                            estimated_duration_minutes: 60,
                            tags: [],
                            is_public: false,
                            resource_ids: []
                        })
                    }
                }}
                size="lg"
            >
                <DialogHeader title={editingPlan ? 'Edit Lesson Plan' : 'Create Lesson Plan'} />
                <DialogContent>
                    <div className="space-y-6 max-h-[60vh] overflow-y-auto">
                        {/* Title */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                                <Sparkles className="w-3 h-3" />
                                Plan Title
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-primary rounded-xl font-semibold text-gray-900 outline-none transition-all"
                                placeholder="e.g., Theory Fundamentals - Week 1"
                                required
                            />
                        </div>

                        {/* Content */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                                <Activity className="w-3 h-3" />
                                Lesson Content
                            </label>
                            <textarea
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                rows={6}
                                className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-primary rounded-xl font-medium text-gray-900 outline-none transition-all resize-none"
                                placeholder="Detailed lesson structure, exercises, goals..."
                                required
                            />
                        </div>

                        {/* Duration */}
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                                    <Clock className="w-3 h-3 text-primary" />
                                    Duration (min)
                                </label>
                                <input
                                    type="number"
                                    value={formData.estimated_duration_minutes}
                                    onChange={(e) => setFormData({ ...formData, estimated_duration_minutes: parseInt(e.target.value) || 0 })}
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-primary rounded-xl font-semibold text-gray-900 outline-none transition-all"
                                    min="1"
                                    required
                                />
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                                <Tag className="w-3 h-3" />
                                Tags
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' && tagInput.trim()) {
                                            e.preventDefault()
                                            if (!formData.tags.includes(tagInput.trim())) {
                                                setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] })
                                            }
                                            setTagInput('')
                                        }
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-primary rounded-xl font-medium text-gray-900 outline-none transition-all"
                                    placeholder="Type and press Enter"
                                />
                            </div>
                            {formData.tags.length > 0 && (
                                <div className="flex gap-2 flex-wrap">
                                    {formData.tags.map((tag, idx) => (
                                        <span key={idx} className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm font-semibold flex items-center gap-2">
                                            {tag}
                                            <button
                                                onClick={() => setFormData({ ...formData, tags: formData.tags.filter((_, i) => i !== idx) })}
                                                className="hover:text-red-600"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Resources */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                                <Package className="w-3 h-3" />
                                Attached Resources
                            </label>
                            <button
                                type="button"
                                onClick={() => setShowResourceSelector(true)}
                                className="w-full px-4 py-3 bg-gray-50 border-2 border-dashed border-gray-300 hover:border-primary rounded-xl font-semibold text-gray-600 hover:text-primary transition-all flex items-center justify-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                {formData.resource_ids.length > 0 ? `${formData.resource_ids.length} resource(s) selected` : 'Select Resources'}
                            </button>
                        </div>

                        {/* Public Toggle */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <div>
                                <div className="font-bold text-gray-900">Make Public</div>
                                <div className="text-sm text-gray-600">Share with other teachers in your studio</div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, is_public: !formData.is_public })}
                                className={`relative w-12 h-6 rounded-full transition-colors ${
                                    formData.is_public ? 'bg-primary' : 'bg-gray-300'
                                }`}
                            >
                                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                                    formData.is_public ? 'translate-x-6' : 'translate-x-0'
                                }`} />
                            </button>
                        </div>
                    </div>
                </DialogContent>
                <DialogFooter>
                    <Button
                        variant="ghost"
                        onClick={() => setShowPlanModal(false)}
                        disabled={submitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={async () => {
                            if (!formData.title.trim() || !formData.content.trim()) {
                                alert('Please fill in title and content')
                                return
                            }
                            setSubmitting(true)
                            try {
                                if (editingPlan) {
                                    await updatePlan(editingPlan.id, formData)
                                } else {
                                    await createPlan(formData)
                                }
                                setShowPlanModal(false)
                                setEditingPlan(null)
                                setFormData({
                                    title: '',
                                    content: '',
                                    estimated_duration_minutes: 60,
                                    tags: [],
                                    is_public: false,
                                    resource_ids: []
                                })
                            } catch (err) {
                                console.error(err)
                            } finally {
                                setSubmitting(false)
                            }
                        }}
                        disabled={submitting}
                        className="gap-2"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="w-4 h-4" />
                                {editingPlan ? 'Update Plan' : 'Create Plan'}
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </Dialog>

            {/* Resource Selector Modal */}
            <ResourceSelector
                selectedIds={formData.resource_ids}
                onSelectionChange={(ids) => setFormData({ ...formData, resource_ids: ids })}
                isOpen={showResourceSelector}
                onClose={() => setShowResourceSelector(false)}
            />
        </div>
    )
}
