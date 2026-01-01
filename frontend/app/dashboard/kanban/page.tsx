'use client'

import { useState } from 'react'

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
            },
            {
                id: '4',
                title: 'Update Studio Website',
                description: 'Add new photos and testimonials',
                priority: 'low'
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
            },
            {
                id: '7',
                title: 'Studio Deep Clean',
                description: 'Monthly maintenance completed',
                priority: 'low'
            }
        ]
    }
]

export default function KanbanPage() {
    const [columns, setColumns] = useState<Column[]>(mockColumns)
    const [selectedTask, setSelectedTask] = useState<Task | null>(null)
    const [showAddModal, setShowAddModal] = useState(false)
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
        assignee: ''
    })
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)
    const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null)

    const handleAddCard = (e: React.FormEvent) => {
        e.preventDefault()
        console.log('Adding task:', newTask)
        // Add to first column for now (To Do)
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

        alert(`Task "${newTask.title}" added to board!`)
        setShowAddModal(false)
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
            high: 'bg-red-100 text-red-800 border-red-300',
            medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            low: 'bg-green-100 text-green-800 border-green-300',
        }

        return (
            <span className={`px-2 py-0.5 rounded text-xs font-medium border ${styles[priority as keyof typeof styles]}`}>
                {priority.toUpperCase()}
            </span>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Project Board</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage studio projects and tasks</p>
                </div>
                <div className="flex space-x-3">
                    <button className="px-4 py-2 bg-[#2C3E50] text-white rounded-lg hover:bg-[#34495E] transition-colors">
                        Filter
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors"
                    >
                        + Add Task
                    </button>
                </div>
            </div>

            {/* Kanban Board */}
            <div className="grid grid-cols-4 gap-6">
                {columns.map((column) => (
                    <div
                        key={column.id}
                        className="flex flex-col h-full"
                        onDragOver={(e) => onDragOver(e, column.id)}
                        onDragLeave={onDragLeave}
                        onDrop={(e) => onDrop(e, column.id)}
                    >
                        {/* Column Header */}
                        <div className={`p-4 rounded-t-lg border-2 ${column.color} ${dragOverColumnId === column.id ? 'bg-gray-100' : ''}`}>
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-gray-900">{column.title}</h3>
                                <span className="bg-white px-2 py-1 rounded-full text-xs font-medium">
                                    {column.tasks.length}
                                </span>
                            </div>
                        </div>

                        {/* Task Cards */}
                        <div className={`flex-1 p-4 border-2 border-t-0 ${column.color} rounded-b-lg space-y-3 min-h-[500px] transition-colors ${dragOverColumnId === column.id ? 'bg-gray-50' : ''}`}>
                            {column.tasks.map((task) => (
                                <div
                                    key={task.id}
                                    draggable
                                    onDragStart={(e) => onDragStart(e, task.id, column.id)}
                                    onClick={() => setSelectedTask(task)}
                                    className={`bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing ${getPriorityColor(task.priority)} ${draggedTaskId === task.id ? 'opacity-50' : ''}`}
                                >
                                    {/* Task Header */}
                                    <div className="flex items-start justify-between mb-2">
                                        <h4 className="font-medium text-sm text-gray-900 flex-1">
                                            {task.title}
                                        </h4>
                                        {getPriorityBadge(task.priority)}
                                    </div>

                                    {/* Task Description */}
                                    <p className="text-xs text-gray-600 mb-3">
                                        {task.description}
                                    </p>

                                    {/* Task Meta */}
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        {task.dueDate && (
                                            <div className="flex items-center space-x-1">
                                                <span>📅</span>
                                                <span>{task.dueDate}</span>
                                            </div>
                                        )}
                                        {task.assignee && (
                                            <div className="flex items-center space-x-1">
                                                <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white text-[10px] font-medium">
                                                    {task.assignee.split(' ').map(n => n[0]).join('')}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Add Card Button */}
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-colors text-sm"
                            >
                                + Add Card
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Task Detail Modal (Simple version) */}
            {selectedTask && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedTask(null)}>
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-start justify-between mb-4">
                            <h2 className="text-2xl font-bold">{selectedTask.title}</h2>
                            <button onClick={() => setSelectedTask(null)} className="text-gray-400 hover:text-gray-600">
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-600">Description</label>
                                <p className="text-gray-900 mt-1">{selectedTask.description}</p>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Priority</label>
                                    <div className="mt-1">{getPriorityBadge(selectedTask.priority)}</div>
                                </div>

                                {selectedTask.dueDate && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Due Date</label>
                                        <p className="text-gray-900 mt-1">📅 {selectedTask.dueDate}</p>
                                    </div>
                                )}

                                {selectedTask.assignee && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Assignee</label>
                                        <p className="text-gray-900 mt-1">{selectedTask.assignee}</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex space-x-3 pt-4">
                                <button className="px-4 py-2 bg-[#2C3E50] text-white rounded-lg hover:bg-[#34495E]">
                                    Edit Task
                                </button>
                                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
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
