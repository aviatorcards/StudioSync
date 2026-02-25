'use client'

import { useState, useEffect } from 'react'
import { Plus, Filter, Calendar as CalendarIcon, User, X, Edit2, Trash2, Loader2, HardDrive } from 'lucide-react'
import { Dialog, DialogHeader, DialogContent, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

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

const STORAGE_KEY = 'studiosync_kanban_v1'

export default function KanbanPage() {
    const [columns, setColumns] = useState<Column[]>(() => {
        if (typeof window === 'undefined') return mockColumns
        try {
            const saved = localStorage.getItem(STORAGE_KEY)
            if (saved) return JSON.parse(saved) as Column[]
        } catch {
            // ignore
        }
        return mockColumns
    })
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

    // Persist to localStorage whenever columns change
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(columns))
        } catch {
            // storage quota exceeded or unavailable
        }
    }, [columns])

    const handleAddCard = (e: React.FormEvent) => {
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
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Project Board</h1>
                    <p className="text-sm text-gray-500 font-medium mt-1 uppercase tracking-wider">Manage studio projects and tasks</p>
                </div>
                <div className="flex space-x-3">
                    <Button
                        variant="outline"
                        className="gap-2"
                    >
                        <Filter className="w-4 h-4" />
                        Filter
                    </Button>
                    <Button
                        onClick={() => setShowAddModal(true)}
                        className="gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add Task
                    </Button>
                </div>
            </div>

            {/* Kanban Board */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {columns.map((column) => (
                    <div
                        key={column.id}
                        className="flex flex-col h-full min-h-[500px]"
                        onDragOver={(e) => onDragOver(e, column.id)}
                        onDragLeave={onDragLeave}
                        onDrop={(e) => onDrop(e, column.id)}
                    >
                        {/* Column Header */}
                        <div className={`p-4 rounded-t-2xl border-2 border-b-0 ${column.color} ${dragOverColumnId === column.id ? 'bg-gray-100' : ''}`}>
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-gray-900 uppercase tracking-widest text-xs">{column.title}</h3>
                                <span className="bg-white px-2 py-0.5 rounded-full text-[10px] font-black shadow-sm">
                                    {column.tasks.length}
                                </span>
                            </div>
                        </div>

                        {/* Task Cards */}
                        <div className={`flex-1 p-3 border-2 ${column.color} rounded-b-2xl space-y-3 transition-colors ${dragOverColumnId === column.id ? 'bg-gray-50' : ''}`}>
                            {column.tasks.map((task) => (
                                <div
                                    key={task.id}
                                    draggable
                                    onDragStart={(e) => onDragStart(e, task.id, column.id)}
                                    onClick={() => setSelectedTask(task)}
                                    className={`bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing hover:scale-[1.02] ${getPriorityColor(task.priority)} ${draggedTaskId === task.id ? 'opacity-50' : ''}`}
                                >
                                    {/* Task Header */}
                                    <div className="flex items-start justify-between mb-2 gap-2">
                                        <h4 className="font-bold text-xs text-gray-900 flex-1 leading-tight">
                                            {task.title}
                                        </h4>
                                        {getPriorityBadge(task.priority)}
                                    </div>

                                    {/* Task Description */}
                                    <p className="text-[10px] text-gray-500 mb-3 font-medium line-clamp-2">
                                        {task.description}
                                    </p>

                                    {/* Task Meta */}
                                    <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                                        {task.dueDate && (
                                            <div className="flex items-center gap-1">
                                                <CalendarIcon className="w-3 h-3" />
                                                <span>{task.dueDate}</span>
                                            </div>
                                        )}
                                        {task.assignee && (
                                            <div className="flex items-center gap-1.5 ml-auto">
                                                <span className="truncate max-w-[60px]">{task.assignee}</span>
                                                <div className="w-5 h-5 bg-[var(--color-primary-light)] rounded-full flex items-center justify-center text-[var(--color-primary-dark)] text-[8px] font-black border border-[var(--color-primary)]">
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
                                className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-400 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] hover:bg-white transition-all text-[10px] font-black uppercase tracking-widest active:scale-95"
                            >
                                + Add Card
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Task Detail Modal */}
            <Dialog
                open={!!selectedTask}
                onOpenChange={(open) => !open && setSelectedTask(null)}
                size="md"
            >
                {selectedTask && (
                    <>
                        <DialogHeader title={selectedTask.title} />
                        <DialogContent>
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Description</label>
                                    <p className="text-sm text-gray-700 font-medium bg-gray-50 p-4 rounded-xl border border-gray-100 italic leading-relaxed">
                                        "{selectedTask.description}"
                                    </p>
                                </div>

                                <div className="grid grid-cols-3 gap-6">
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Priority</label>
                                        <div>{getPriorityBadge(selectedTask.priority)}</div>
                                    </div>

                                    {selectedTask.dueDate && (
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Due Date</label>
                                            <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                                <CalendarIcon className="w-4 h-4 text-primary" />
                                                {selectedTask.dueDate}
                                            </p>
                                        </div>
                                    )}

                                    {selectedTask.assignee && (
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Assignee</label>
                                            <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                                <User className="w-4 h-4 text-primary" />
                                                {selectedTask.assignee}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </DialogContent>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setSelectedTask(null)} className="flex-1">
                                Close
                            </Button>
                            <Button className="flex-1 gap-2">
                                <Edit2 className="w-4 h-4" />
                                Edit Task
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </Dialog>

            {/* Add Task Modal */}
            <Dialog
                open={showAddModal}
                onOpenChange={setShowAddModal}
                size="md"
            >
                <DialogHeader title="Add New Task" />
                <DialogContent>
                    <form id="add-task-form" onSubmit={handleAddCard} className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Task Title</label>
                            <input
                                required
                                type="text"
                                value={newTask.title}
                                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border-transparent focus:bg-white border-2 focus:border-primary rounded-xl font-bold text-gray-700 outline-none transition-all"
                                placeholder="e.g. Schedule Studio Cleaning"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Description</label>
                            <textarea
                                value={newTask.description}
                                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border-transparent focus:bg-white border-2 focus:border-primary rounded-xl font-bold text-gray-700 outline-none transition-all min-h-[100px] resize-none"
                                placeholder="Detailed task description..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Priority</label>
                                <select
                                    value={newTask.priority}
                                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                                    className="w-full px-4 py-3 bg-gray-50 border-transparent focus:bg-white border-2 focus:border-primary rounded-xl font-bold text-gray-700 outline-none transition-all appearance-none"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Due Date</label>
                                <input
                                    type="text"
                                    value={newTask.dueDate}
                                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border-transparent focus:bg-white border-2 focus:border-primary rounded-xl font-bold text-gray-700 outline-none transition-all"
                                    placeholder="e.g. March 1"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Assignee</label>
                            <input
                                type="text"
                                value={newTask.assignee}
                                onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border-transparent focus:bg-white border-2 focus:border-primary rounded-xl font-bold text-gray-700 outline-none transition-all"
                                placeholder="Enter name..."
                            />
                        </div>
                    </form>
                </DialogContent>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">
                        Cancel
                    </Button>
                    <Button type="submit" form="add-task-form" className="flex-[2] gap-2">
                        <Plus className="w-4 h-4" />
                        Create Task
                    </Button>
                </DialogFooter>
            </Dialog>
        </div>
    )
}
