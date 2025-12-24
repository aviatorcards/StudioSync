'use client'

import { useGoals, useUsers } from '@/hooks/useDashboardData'
import { Target, CheckCircle, Clock, AlertCircle, Plus, X, Loader2, TrendingUp, Award, LayoutGrid, ListTodo } from 'lucide-react'
import { useState } from 'react'
import api from '@/services/api'
import { toast } from 'react-hot-toast'
import { useUser } from '@/contexts/UserContext'

// Kanban Types
interface Task {
    id: string
    title: string
    description: string
    priority: 'low' | 'medium' | 'high'
    dueDate?: string
    assignee?: string
}

interface Column {
    id: string
    title: string
    color: string
    tasks: Task[]
}

const mockColumns: Column[] = [
    {
        id: 'todo',
        title: 'To Do',
        color: 'bg-gray-100 border-gray-300',
        tasks: [
            {
                id: '1',
                title: 'Prepare Spring Recital Program',
                description: 'Select pieces and finalize schedule',
                priority: 'high',
                dueDate: 'March 1',
                assignee: 'John Smith'
            },
            {
                id: '2',
                title: 'Order New Music Books',
                description: 'Method books for new piano students',
                priority: 'medium',
                dueDate: 'Feb 15'
            }
        ]
    },
    {
        id: 'in-progress',
        title: 'In Progress',
        color: 'bg-blue-50 border-blue-300',
        tasks: [
            {
                id: '3',
                title: 'Student Progress Assessments',
                description: 'Q1 evaluations for all students',
                priority: 'high',
                assignee: 'Jane Doe'
            }
        ]
    },
    {
        id: 'review',
        title: 'Review',
        color: 'bg-yellow-50 border-yellow-300',
        tasks: [
            {
                id: '5',
                title: 'New Curriculum Draft',
                description: 'Beginner guitar program outline',
                priority: 'medium',
                assignee: 'Bob Wilson'
            }
        ]
    },
    {
        id: 'done',
        title: 'Done',
        color: 'bg-green-50 border-green-300',
        tasks: [
            {
                id: '6',
                title: 'January Invoices',
                description: 'All invoices sent and processed',
                priority: 'high'
            }
        ]
    }
]

export default function GoalsPage() {
    const { goals, loading, refetch } = useGoals()
    const { users } = useUsers()
    const { currentUser } = useUser()
    const [activeTab, setActiveTab] = useState<'goals' | 'kanban'>('goals')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [creating, setCreating] = useState(false)

    // Goals Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        student: '',
        target_date: '',
        status: 'active'
    })

    // Kanban state
    const [columns, setColumns] = useState<Column[]>(mockColumns)
    const [selectedTask, setSelectedTask] = useState<Task | null>(null)
    const [showAddTaskModal, setShowAddTaskModal] = useState(false)
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
        assignee: ''
    })
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)
    const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null)

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
            case 'achieved': return <CheckCircle className="w-7 h-7 text-green-600" />
            case 'abandoned': return <AlertCircle className="w-7 h-7 text-red-600" />
            default: return <Target className="w-7 h-7 text-blue-600" />
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

    // Kanban functions
    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault()
        const newTaskObj: Task = {
            id: Math.random().toString(36).substr(2, 9),
            title: newTask.title,
            description: newTask.description,
            priority: newTask.priority as 'low' | 'medium' | 'high',
            dueDate: newTask.dueDate,
            assignee: newTask.assignee
        }

        setColumns(prev => prev.map(col =>
            col.id === 'todo' ? { ...col, tasks: [...col.tasks, newTaskObj] } : col
        ))

        toast.success(`Task "${newTask.title}" added to board!`)
        setShowAddTaskModal(false)
        setNewTask({ title: '', description: '', priority: 'medium', dueDate: '', assignee: '' })
    }

    const onDragStart = (e: React.DragEvent, taskId: string, sourceColId: string) => {
        e.dataTransfer.setData('taskId', taskId)
        e.dataTransfer.setData('sourceColId', sourceColId)
        setDraggedTaskId(taskId)
    }

    const onDragOver = (e: React.DragEvent, colId: string) => {
        e.preventDefault()
        setDragOverColumnId(colId)
    }

    const onDragLeave = () => {
        setDragOverColumnId(null)
    }

    const onDrop = (e: React.DragEvent, targetColId: string) => {
        e.preventDefault()
        const taskId = e.dataTransfer.getData('taskId')
        const sourceColId = e.dataTransfer.getData('sourceColId')

        setDragOverColumnId(null)
        setDraggedTaskId(null)

        if (sourceColId === targetColId) return

        const sourceCol = columns.find(c => c.id === sourceColId)
        const targetCol = columns.find(c => c.id === targetColId)
        const task = sourceCol?.tasks.find(t => t.id === taskId)

        if (sourceCol && targetCol && task) {
            setColumns(prev => prev.map(col => {
                if (col.id === sourceColId) {
                    return { ...col, tasks: col.tasks.filter(t => t.id !== taskId) }
                }
                if (col.id === targetColId) {
                    return { ...col, tasks: [...col.tasks, task] }
                }
                return col
            }))
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'border-l-4 border-red-500 bg-red-50/50'
            case 'medium': return 'border-l-4 border-yellow-500 bg-yellow-50/50'
            case 'low': return 'border-l-4 border-green-500 bg-green-50/50'
            default: return 'border-l-4 border-gray-500'
        }
    }

    const getPriorityBadge = (priority: string) => {
        const styles = {
            high: 'bg-red-50 text-red-700 border-red-200',
            medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
            low: 'bg-green-50 text-green-700 border-green-200',
        }

        return (
            <span className={`px-2 py-0.5 rounded text-xs font-black uppercase tracking-wider border ${styles[priority as keyof typeof styles]}`}>
                {priority}
            </span>
        )
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                <Loader2 className="w-10 h-10 text-[#F39C12] animate-spin mb-4" />
                <p className="text-gray-500 font-bold tracking-[0.2em] uppercase text-xs">Loading...</p>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto px-4 pb-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Goals & Projects</h1>
                    <p className="text-lg text-gray-500 mt-2 font-medium">Track student progress and manage studio projects.</p>
                </div>
                <button
                    onClick={() => activeTab === 'goals' ? setIsModalOpen(true) : setShowAddTaskModal(true)}
                    className="px-5 py-3 bg-[#F39C12] text-white rounded-xl hover:bg-[#E67E22] transition-all flex items-center gap-2 font-bold shadow-lg hover:scale-105 active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    {activeTab === 'goals' ? 'Create Goal' : 'Add Task'}
                </button>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden">
                <nav className="flex border-b border-gray-100 bg-gray-50/30">
                    <button
                        onClick={() => setActiveTab('goals')}
                        className={`flex-1 py-5 px-6 font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'goals'
                            ? 'bg-white text-[#F39C12] border-b-4 border-[#F39C12]'
                            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50/50'
                            }`}
                    >
                        <Target className="w-5 h-5" />
                        Student Goals
                    </button>
                    <button
                        onClick={() => setActiveTab('kanban')}
                        className={`flex-1 py-5 px-6 font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'kanban'
                            ? 'bg-white text-[#F39C12] border-b-4 border-[#F39C12]'
                            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50/50'
                            }`}
                    >
                        <LayoutGrid className="w-5 h-5" />
                        Project Board
                    </button>
                </nav>

                {/* Content */}
                <div className="min-h-[500px]">
                    {activeTab === 'goals' ? (
                        <div className="p-8">
                            {goals.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {goals.map((goal: any) => (
                                        <div key={goal.id} className="group relative bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/30 to-transparent rounded-bl-[4rem] group-hover:scale-150 transition-transform duration-500" />

                                            <div className="relative z-10">
                                                <div className="flex items-start justify-between mb-6">
                                                    <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center border border-blue-200 shadow-inner group-hover:rotate-12 transition-transform">
                                                        {getStatusIcon(goal.status)}
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-2xl font-black text-gray-900 mb-1">{goal.progress_percentage}%</div>
                                                        <div className="w-24 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-gradient-to-r from-[#F39C12] to-[#E67E22] rounded-full transition-all duration-500"
                                                                style={{ width: `${goal.progress_percentage}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <h3 className="font-black text-gray-900 text-xl mb-3 group-hover:text-[#F39C12] transition-colors leading-tight">{goal.title}</h3>
                                                <p className="text-sm text-gray-600 mb-6 font-medium line-clamp-2">{goal.description}</p>

                                                <div className="space-y-3 mb-6">
                                                    <div className="flex items-center gap-2 text-sm text-gray-500 font-semibold">
                                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                                        <span>Student: {goal.student_name}</span>
                                                    </div>
                                                    {goal.target_date && (
                                                        <div className="flex items-center gap-2 text-sm text-gray-500 font-semibold">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            <span>Target: {new Date(goal.target_date).toLocaleDateString()}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="pt-4 border-t border-gray-100">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border ${getStatusColor(goal.status)}`}>
                                                        {goal.status === 'achieved' && <Award className="w-3 h-3" />}
                                                        {goal.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center border-2 border-dashed border-gray-200 mb-6">
                                        <Target className="w-12 h-12 text-gray-200" />
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900 mb-2">No active goals</h3>
                                    <p className="text-gray-400 font-medium mb-6">Set goals for students to track their progress</p>
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className="px-6 py-3 text-[#F39C12] font-black uppercase tracking-widest text-xs border-2 border-[#F39C12]/20 rounded-xl hover:bg-[#F39C12]/5 transition-all"
                                    >
                                        + Create First Goal
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {columns.map((column) => (
                                    <div
                                        key={column.id}
                                        className="flex flex-col h-full"
                                        onDragOver={(e) => onDragOver(e, column.id)}
                                        onDragLeave={onDragLeave}
                                        onDrop={(e) => onDrop(e, column.id)}
                                    >
                                        <div className={`p-4 rounded-t-2xl border-2 ${column.color} ${dragOverColumnId === column.id ? 'bg-gray-100' : ''}`}>
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-black text-gray-900 uppercase tracking-wider text-xs">{column.title}</h3>
                                                <span className="bg-white px-2.5 py-1 rounded-full text-xs font-black">
                                                    {column.tasks.length}
                                                </span>
                                            </div>
                                        </div>

                                        <div className={`flex-1 p-4 border-2 border-t-0 ${column.color} rounded-b-2xl space-y-3 min-h-[500px] transition-colors ${dragOverColumnId === column.id ? 'bg-gray-50' : ''}`}>
                                            {column.tasks.map((task) => (
                                                <div
                                                    key={task.id}
                                                    draggable
                                                    onDragStart={(e) => onDragStart(e, task.id, column.id)}
                                                    onClick={() => setSelectedTask(task)}
                                                    className={`bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing ${getPriorityColor(task.priority)} ${draggedTaskId === task.id ? 'opacity-50' : ''}`}
                                                >
                                                    <div className="flex items-start justify-between mb-2">
                                                        <h4 className="font-bold text-sm text-gray-900 flex-1">
                                                            {task.title}
                                                        </h4>
                                                        {getPriorityBadge(task.priority)}
                                                    </div>

                                                    <p className="text-xs text-gray-600 mb-3 font-medium">
                                                        {task.description}
                                                    </p>

                                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                                        {task.dueDate && (
                                                            <div className="flex items-center space-x-1">
                                                                <Clock className="w-3 h-3" />
                                                                <span className="font-semibold">{task.dueDate}</span>
                                                            </div>
                                                        )}
                                                        {task.assignee && (
                                                            <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                                                                {task.assignee.split(' ').map(n => n[0]).join('')}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}

                                            <button
                                                onClick={() => setShowAddTaskModal(true)}
                                                className="w-full p-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-colors text-sm font-bold"
                                            >
                                                + Add Card
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Goal Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in slide-in-from-top-4 duration-300">
                        <div className="px-10 py-8 bg-[#2C3E50] text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-3xl font-black tracking-tight">Create New Goal</h3>
                                <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Set Achievement Target</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 rounded-2xl hover:bg-white/10 flex items-center justify-center transition-colors">
                                <X className="w-7 h-7" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-10 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Title</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#F39C12] outline-none font-bold text-gray-900 text-sm"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. Master C Major Scale"
                                />
                            </div>

                            {!isStudent && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Student</label>
                                    <select
                                        required
                                        className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#F39C12] outline-none font-bold text-gray-900 text-sm"
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
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Student</label>
                                    <div className="w-full px-5 py-3.5 bg-gray-100 border-none rounded-2xl font-bold text-gray-600 text-sm cursor-not-allowed">
                                        {currentUser?.full_name} (You)
                                    </div>
                                    <p className="text-xs text-gray-400 font-semibold">Goal will be assigned to you.</p>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Target Date</label>
                                <input
                                    type="date"
                                    className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#F39C12] outline-none font-bold text-gray-900 text-sm"
                                    value={formData.target_date}
                                    onChange={e => setFormData({ ...formData, target_date: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</label>
                                <textarea
                                    className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#F39C12] outline-none font-bold text-gray-900 text-sm min-h-[100px]"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Details about the goal..."
                                />
                            </div>

                            <div className="flex gap-4 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-8 py-4 border-2 border-gray-100 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="flex-[2] px-8 py-4 bg-[#F39C12] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#E67E22] disabled:opacity-50 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
                                >
                                    {creating ? <><Loader2 className="w-5 h-5 animate-spin" /> Creating...</> : 'Create Goal'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Task Modal */}
            {showAddTaskModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in slide-in-from-top-4 duration-300">
                        <div className="px-10 py-8 bg-[#2C3E50] text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-3xl font-black tracking-tight">Add New Task</h3>
                                <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Project Board</p>
                            </div>
                            <button onClick={() => setShowAddTaskModal(false)} className="w-12 h-12 rounded-2xl hover:bg-white/10 flex items-center justify-center transition-colors">
                                <X className="w-7 h-7" />
                            </button>
                        </div>

                        <form onSubmit={handleAddTask} className="p-10 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Title</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#F39C12] outline-none font-bold text-gray-900 text-sm"
                                    value={newTask.title}
                                    onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                                    placeholder="Task title"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</label>
                                <textarea
                                    className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#F39C12] outline-none font-bold text-gray-900 text-sm min-h-[80px]"
                                    value={newTask.description}
                                    onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                                    placeholder="Task description"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Priority</label>
                                    <select
                                        className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#F39C12] outline-none font-bold text-gray-900 text-sm"
                                        value={newTask.priority}
                                        onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Due Date</label>
                                    <input
                                        type="date"
                                        className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#F39C12] outline-none font-bold text-gray-900 text-sm"
                                        value={newTask.dueDate}
                                        onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Assignee</label>
                                <select
                                    className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#F39C12] outline-none font-bold text-gray-900 text-sm"
                                    value={newTask.assignee}
                                    onChange={e => setNewTask({ ...newTask, assignee: e.target.value })}
                                >
                                    <option value="">Select Assignee...</option>
                                    {users.map((user: any) => (
                                        <option key={user.id} value={user.full_name || `${user.first_name} ${user.last_name}`}>
                                            {user.full_name || `${user.first_name} ${user.last_name}`} ({user.role})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-4 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowAddTaskModal(false)}
                                    className="flex-1 px-8 py-4 border-2 border-gray-100 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-[2] px-8 py-4 bg-[#F39C12] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#E67E22] transition-all shadow-xl active:scale-95"
                                >
                                    Add Task
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Task Detail Modal */}
            {selectedTask && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4" onClick={() => setSelectedTask(null)}>
                    <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="px-10 py-8 bg-[#2C3E50] text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-3xl font-black tracking-tight">{selectedTask.title}</h3>
                                <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Task Details</p>
                            </div>
                            <button onClick={() => setSelectedTask(null)} className="w-12 h-12 rounded-2xl hover:bg-white/10 flex items-center justify-center transition-colors">
                                <X className="w-7 h-7" />
                            </button>
                        </div>

                        <div className="p-10 space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</label>
                                <p className="text-gray-900 mt-2 font-medium">{selectedTask.description}</p>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Priority</label>
                                    <div className="mt-2">{getPriorityBadge(selectedTask.priority)}</div>
                                </div>

                                {selectedTask.dueDate && (
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Due Date</label>
                                        <p className="text-gray-900 mt-2 font-bold flex items-center gap-2">
                                            <Clock className="w-4 h-4" /> {selectedTask.dueDate}
                                        </p>
                                    </div>
                                )}

                                {selectedTask.assignee && (
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Assignee</label>
                                        <p className="text-gray-900 mt-2 font-bold">{selectedTask.assignee}</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button className="px-6 py-3 bg-[#2C3E50] text-white rounded-xl hover:bg-[#34495E] font-bold transition-all">
                                    Edit Task
                                </button>
                                <button className="px-6 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 font-bold transition-all">
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
