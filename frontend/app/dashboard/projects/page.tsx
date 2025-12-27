'use client'

import { useUsers } from '@/hooks/useDashboardData'
import { LayoutGrid, Plus, X, Clock } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

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
    bgColor: string
    tasks: Task[]
}

const initialColumns: Column[] = [
    {
        id: 'todo',
        title: 'To Do',
        color: 'border-gray-300',
        bgColor: 'bg-gray-50',
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
        color: 'border-blue-300',
        bgColor: 'bg-blue-50',
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
        color: 'border-yellow-300',
        bgColor: 'bg-yellow-50',
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
        color: 'border-green-300',
        bgColor: 'bg-green-50',
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

export default function ProjectsPage() {
    const { users } = useUsers()
    const [columns, setColumns] = useState<Column[]>(initialColumns)
    const [selectedTask, setSelectedTask] = useState<Task | null>(null)
    const [showAddTaskModal, setShowAddTaskModal] = useState(false)
    const [selectedColumnMobile, setSelectedColumnMobile] = useState<string>('todo')
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
        assignee: ''
    })
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)
    const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null)

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault()
        const newTaskObj: Task = {
            id: Math.random().toString(36).substring(2, 11),
            title: newTask.title,
            description: newTask.description,
            priority: newTask.priority as 'low' | 'medium' | 'high',
            dueDate: newTask.dueDate,
            assignee: newTask.assignee
        }

        setColumns(prev => prev.map(col =>
            col.id === 'todo' ? { ...col, tasks: [...col.tasks, newTaskObj] } : col
        ))

        toast.success(`Task "${newTask.title}" added!`)
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
            toast.success(`Moved to ${targetCol.title}`)
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'border-l-4 border-red-500 bg-red-50/30'
            case 'medium': return 'border-l-4 border-yellow-500 bg-yellow-50/30'
            case 'low': return 'border-l-4 border-green-500 bg-green-50/30'
            default: return 'border-l-4 border-gray-500'
        }
    }

    const getPriorityBadge = (priority: string) => {
        const styles = {
            high: 'bg-red-100 text-red-700 border-red-200',
            medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            low: 'bg-green-100 text-green-700 border-green-200',
        }

        return (
            <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase border ${styles[priority as keyof typeof styles]}`}>
                {priority}
            </span>
        )
    }

    const TaskCard = ({ task, columnId }: { task: Task; columnId: string }) => (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, task.id, columnId)}
            onClick={() => setSelectedTask(task)}
            className={`bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing ${getPriorityColor(task.priority)} ${draggedTaskId === task.id ? 'opacity-50' : ''}`}
        >
            <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-sm text-gray-900 flex-1 pr-2">
                    {task.title}
                </h4>
                {getPriorityBadge(task.priority)}
            </div>

            <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                {task.description}
            </p>

            <div className="flex items-center justify-between text-xs text-gray-500">
                {task.dueDate && (
                    <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span className="font-medium">{task.dueDate}</span>
                    </div>
                )}
                {task.assignee && (
                    <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                        {task.assignee.split(' ').map(n => n[0]).join('')}
                    </div>
                )}
            </div>
        </div>
    )

    const totalTasks = columns.reduce((acc, col) => acc + col.tasks.length, 0)

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Project Board</h1>
                <p className="text-sm text-gray-600 mt-1">Manage studio tasks and projects</p>
            </div>

            {/* Add Task Button */}
            <button
                onClick={() => setShowAddTaskModal(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#F39C12] text-white rounded-lg hover:bg-[#E67E22] transition-colors font-medium shadow-sm"
            >
                <Plus className="w-5 h-5" />
                Add Task
            </button>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <p className="text-xs font-medium text-gray-600 uppercase">Total Tasks</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{totalTasks}</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <p className="text-xs font-medium text-gray-600 uppercase">To Do</p>
                    <p className="text-2xl font-bold text-gray-600 mt-1">
                        {columns.find(c => c.id === 'todo')?.tasks.length || 0}
                    </p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <p className="text-xs font-medium text-gray-600 uppercase">In Progress</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">
                        {columns.find(c => c.id === 'in-progress')?.tasks.length || 0}
                    </p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <p className="text-xs font-medium text-gray-600 uppercase">Completed</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                        {columns.find(c => c.id === 'done')?.tasks.length || 0}
                    </p>
                </div>
            </div>

            {/* Mobile Column Selector */}
            <div className="md:hidden bg-white rounded-lg border border-gray-200 p-2">
                <div className="grid grid-cols-2 gap-2">
                    {columns.map(column => (
                        <button
                            key={column.id}
                            onClick={() => setSelectedColumnMobile(column.id)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                selectedColumnMobile === column.id
                                    ? 'bg-[#F39C12] text-white'
                                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            {column.title} ({column.tasks.length})
                        </button>
                    ))}
                </div>
            </div>

            {/* Desktop Kanban Board */}
            <div className="hidden md:grid md:grid-cols-4 gap-4">
                {columns.map((column) => (
                    <div
                        key={column.id}
                        className="flex flex-col"
                        onDragOver={(e) => onDragOver(e, column.id)}
                        onDragLeave={onDragLeave}
                        onDrop={(e) => onDrop(e, column.id)}
                    >
                        <div className={`p-3 rounded-t-lg border-2 ${column.color} ${column.bgColor} ${dragOverColumnId === column.id ? 'ring-2 ring-[#F39C12]' : ''}`}>
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">{column.title}</h3>
                                <span className="bg-white px-2 py-0.5 rounded-full text-xs font-bold text-gray-700">
                                    {column.tasks.length}
                                </span>
                            </div>
                        </div>

                        <div className={`flex-1 p-3 border-2 border-t-0 ${column.color} ${column.bgColor} rounded-b-lg space-y-3 min-h-[400px] transition-all ${dragOverColumnId === column.id ? 'ring-2 ring-[#F39C12] bg-opacity-70' : ''}`}>
                            {column.tasks.map((task) => (
                                <TaskCard key={task.id} task={task} columnId={column.id} />
                            ))}

                            <button
                                onClick={() => setShowAddTaskModal(true)}
                                className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-colors text-sm font-medium"
                            >
                                + Add Task
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Mobile List View */}
            <div className="md:hidden">
                {columns.filter(c => c.id === selectedColumnMobile).map(column => (
                    <div key={column.id} className="space-y-3">
                        <div className={`p-4 rounded-lg border-2 ${column.color} ${column.bgColor}`}>
                            <h3 className="font-bold text-gray-900 uppercase tracking-wide">{column.title}</h3>
                            <p className="text-xs text-gray-600 mt-1">{column.tasks.length} task{column.tasks.length !== 1 ? 's' : ''}</p>
                        </div>

                        {column.tasks.length > 0 ? (
                            <div className="space-y-3">
                                {column.tasks.map(task => (
                                    <TaskCard key={task.id} task={task} columnId={column.id} />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                                <LayoutGrid className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">No tasks in this column</p>
                            </div>
                        )}

                        <button
                            onClick={() => setShowAddTaskModal(true)}
                            className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors text-sm font-medium"
                        >
                            + Add Task
                        </button>
                    </div>
                ))}
            </div>

            {/* Add Task Modal */}
            {showAddTaskModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">Add New Task</h2>
                            <button
                                onClick={() => setShowAddTaskModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAddTask} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Task Title *</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F39C12]/20 focus:border-[#F39C12]"
                                    value={newTask.title}
                                    onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                                    placeholder="Task title"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F39C12]/20 focus:border-[#F39C12]"
                                    value={newTask.description}
                                    onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                                    placeholder="Task description"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F39C12]/20 focus:border-[#F39C12]"
                                        value={newTask.priority}
                                        onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                                    <input
                                        type="date"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F39C12]/20 focus:border-[#F39C12]"
                                        value={newTask.dueDate}
                                        onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F39C12]/20 focus:border-[#F39C12]"
                                    value={newTask.assignee}
                                    onChange={e => setNewTask({ ...newTask, assignee: e.target.value })}
                                >
                                    <option value="">Unassigned</option>
                                    {users.map((user: any) => (
                                        <option key={user.id} value={user.full_name || `${user.first_name} ${user.last_name}`}>
                                            {user.full_name || `${user.first_name} ${user.last_name}`} ({user.role})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddTaskModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-[#F39C12] text-white rounded-lg hover:bg-[#E67E22] transition-colors font-medium"
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
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setSelectedTask(null)}>
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">{selectedTask.title}</h2>
                            <button
                                onClick={() => setSelectedTask(null)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Description</label>
                                <p className="text-gray-900">{selectedTask.description}</p>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Priority</label>
                                    <div className="mt-1">{getPriorityBadge(selectedTask.priority)}</div>
                                </div>

                                {selectedTask.dueDate && (
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Due Date</label>
                                        <p className="text-gray-900 font-semibold flex items-center gap-2">
                                            <Clock className="w-4 h-4" /> {selectedTask.dueDate}
                                        </p>
                                    </div>
                                )}

                                {selectedTask.assignee && (
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Assignee</label>
                                        <p className="text-gray-900 font-semibold">{selectedTask.assignee}</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-gray-200">
                                <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium transition-colors">
                                    Edit Task
                                </button>
                                <button className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors">
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
