'use client'

import { useGoals, useUsers } from '@/hooks/useDashboardData'
import { Target, CheckCircle, Clock, AlertCircle, Plus, X, Loader2, Award, TrendingUp, Calendar } from 'lucide-react'
import { useState } from 'react'
import api from '@/services/api'
import { toast } from 'react-hot-toast'
import { useUser } from '@/contexts/UserContext'

export default function GoalsPage() {
    const { goals, loading, refetch } = useGoals()
    const { users } = useUsers()
    const { currentUser } = useUser()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [creating, setCreating] = useState(false)
    const [filterStatus, setFilterStatus] = useState<string>('all')

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        student: '',
        target_date: '',
        status: 'active'
    })

    const isStudent = currentUser?.role === 'student'

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'achieved': return 'text-green-700 bg-green-50 border-green-200'
            case 'abandoned': return 'text-red-700 bg-red-50 border-red-200'
            default: return 'text-blue-700 bg-blue-50 border-blue-200'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'achieved': return <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            case 'abandoned': return <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
            default: return <Target className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setCreating(true)

        const submitData: any = { ...formData }
        if (isStudent) {
            delete submitData.student
        }

        try {
            await api.post('/lessons/goals/', submitData)
            toast.success('Goal created successfully')
            setIsModalOpen(false)
            setFormData({ title: '', description: '', student: '', target_date: '', status: 'active' })
            refetch()
        } catch (error) {
            console.error(error)
            toast.error('Failed to create goal')
        } finally {
            setCreating(false)
        }
    }

    const filteredGoals = filterStatus === 'all'
        ? goals
        : goals.filter((goal: any) => goal.status === filterStatus)

    const statusFilters = [
        { value: 'all', label: 'All', icon: Target },
        { value: 'active', label: 'Active', icon: TrendingUp },
        { value: 'achieved', label: 'Achieved', icon: Award },
        { value: 'abandoned', label: 'Abandoned', icon: AlertCircle }
    ]

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-[var(--color-primary)] animate-spin mb-4" />
                <p className="text-gray-500 font-bold tracking-wider uppercase text-xs">Loading Goals...</p>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl md:text-4xl font-bold text-gray-900">Student Goals</h1>
                <p className="text-sm text-gray-600 mt-1">Track student progress and achievements</p>
            </div>

            {/* Create Button */}
            <button
                onClick={() => setIsModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors font-medium shadow-sm"
            >
                <Plus className="w-5 h-5" />
                Create Goal
            </button>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <p className="text-xs font-medium text-gray-600 uppercase">Total Goals</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{goals.length}</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <p className="text-xs font-medium text-gray-600 uppercase">Active</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">
                        {goals.filter((g: any) => g.status === 'active').length}
                    </p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <p className="text-xs font-medium text-gray-600 uppercase">Achieved</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                        {goals.filter((g: any) => g.status === 'achieved').length}
                    </p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <p className="text-xs font-medium text-gray-600 uppercase">Avg Progress</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                        {goals.length > 0
                            ? Math.round(goals.reduce((acc: number, g: any) => acc + g.progress_percentage, 0) / goals.length)
                            : 0}%
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {statusFilters.map(filter => {
                    const Icon = filter.icon
                    return (
                        <button
                            key={filter.value}
                            onClick={() => setFilterStatus(filter.value)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                                filterStatus === filter.value
                                    ? 'bg-[var(--color-primary)] text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            {filter.label}
                        </button>
                    )
                })}
            </div>

            {/* Goals Grid */}
            {filteredGoals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredGoals.map((goal: any) => (
                        <div key={goal.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                                <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200">
                                    {getStatusIcon(goal.status)}
                                </div>
                                <div className="text-right">
                                    <div className="text-xl font-bold text-gray-900">{goal.progress_percentage}%</div>
                                    <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1">
                                        <div
                                            className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] rounded-full transition-all"
                                            style={{ width: `${goal.progress_percentage}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{goal.title}</h3>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{goal.description}</p>

                            <div className="space-y-2 mb-3 pb-3 border-b border-gray-100">
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                    <span className="font-medium">{goal.student_name}</span>
                                </div>
                                {goal.target_date && (
                                    <div className="flex items-center gap-2 text-xs text-gray-600">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span className="font-medium">
                                            Target: {new Date(goal.target_date).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div>
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold uppercase border ${getStatusColor(goal.status)}`}>
                                    {goal.status === 'achieved' && <Award className="w-3 h-3" />}
                                    {goal.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <Target className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {filterStatus === 'all' ? 'No goals yet' : `No ${filterStatus} goals`}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                        {filterStatus === 'all'
                            ? 'Create your first goal to start tracking student progress'
                            : 'Try selecting a different filter or create a new goal'}
                    </p>
                    {filterStatus === 'all' && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors font-medium"
                        >
                            Create Goal
                        </button>
                    )}
                </div>
            )}

            {/* Create Goal Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">Create New Goal</h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Goal Title *</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g., Master C Major Scale"
                                />
                            </div>

                            {!isStudent && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Student *</label>
                                    <select
                                        required
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
                                        value={formData.student}
                                        onChange={e => setFormData({ ...formData, student: e.target.value })}
                                    >
                                        <option value="">Select a student...</option>
                                        {users.filter((u: any) => u.role === 'student').map((student: any) => (
                                            <option key={student.id} value={student.student_profile?.id || student.id}>
                                                {student.first_name} {student.last_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {isStudent && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                                    <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">
                                        {currentUser?.full_name} (You)
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Goal will be assigned to you.</p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Target Date</label>
                                <input
                                    type="date"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
                                    value={formData.target_date}
                                    onChange={e => setFormData({ ...formData, target_date: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Details about the goal..."
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="flex-1 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {creating ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        'Create Goal'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
