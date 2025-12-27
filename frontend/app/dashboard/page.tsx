'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useUser } from '@/contexts/UserContext'
import { useDashboardStats } from '@/hooks/useDashboardData'
import { useSettings } from '@/hooks/useSettings'
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    rectSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
    GripVertical, Eye, EyeOff, TrendingUp, Users, DollarSign as DollarSignIcon,
    Calendar, GraduationCap, Music, Loader2, Settings, X, Check
} from 'lucide-react'
import { RevenueChart } from '@/components/charts/RevenueChart'
import { StudentGrowthChart } from '@/components/charts/StudentGrowthChart'
import { AttendanceChart } from '@/components/charts/AttendanceChart'
import { DashboardSkeleton } from '@/components/SkeletonLoader'

// --- Types ---
type WidgetId =
    | 'total_students' | 'weekly_lessons' | 'monthly_revenue' | 'active_teachers' | 'unpaid_invoices' | 'avg_attendance' | 'new_enquiries'
    | 'next_lesson' | 'practice_goal' | 'balance_due'
    | 'my_students' | 'lessons_today' | 'hours_taught'

interface WidgetConfig {
    id: WidgetId
    visible: boolean
}

// Default layouts by role
const DEFAULT_WIDGETS: Record<string, WidgetConfig[]> = {
    admin: [
        { id: 'total_students', visible: true },
        { id: 'weekly_lessons', visible: true },
        { id: 'monthly_revenue', visible: true },
        { id: 'active_teachers', visible: true },
        { id: 'unpaid_invoices', visible: false },
        { id: 'avg_attendance', visible: false },
        { id: 'new_enquiries', visible: false },
    ],
    teacher: [
        { id: 'my_students', visible: true },
        { id: 'lessons_today', visible: true },
        { id: 'hours_taught', visible: true },
    ],
    student: [
        { id: 'next_lesson', visible: true },
        { id: 'practice_goal', visible: true },
        { id: 'balance_due', visible: true },
    ]
}

// --- Metric Card Component ---
interface MetricCardProps {
    title: string
    value: string | number
    subtitle?: string
    trend?: { value: string; positive: boolean }
    icon: React.ReactNode
    color?: 'blue' | 'green' | 'purple' | 'orange' | 'red'
    onClick?: () => void
    className?: string
}

function MetricCard({ title, value, subtitle, trend, icon, color = 'blue', onClick, className }: MetricCardProps) {
    const colorClasses = {
        blue: 'from-blue-500 to-cyan-500',
        green: 'from-emerald-500 to-teal-500',
        purple: 'from-purple-500 to-indigo-500',
        orange: 'from-orange-500 to-amber-500',
        red: 'from-red-500 to-pink-500'
    }

    return (
        <div
            onClick={onClick}
            className={`bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all ${onClick ? 'cursor-pointer hover:scale-[1.02]' : ''} ${className || ''}`}
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{title}</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-black text-gray-900">{value}</h3>
                        {subtitle && <span className="text-sm font-bold text-gray-400">{subtitle}</span>}
                    </div>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-white shadow-md`}>
                    {icon}
                </div>
            </div>
            {trend && (
                <div className={`flex items-center gap-1.5 text-xs font-bold ${trend.positive ? 'text-emerald-600' : 'text-red-600'}`}>
                    <span>{trend.positive ? '↑' : '↓'}</span>
                    <span>{trend.value}</span>
                </div>
            )}
        </div>
    )
}

// --- Sortable Widget Component ---
interface SortableWidgetProps {
    widget: WidgetConfig
    children: React.ReactNode
    isEditing: boolean
    onToggleVisibility: (id: WidgetId) => void
}

function SortableWidget({ widget, children, isEditing, onToggleVisibility }: SortableWidgetProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: widget.id, disabled: !isEditing })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 10 : 1,
    }

    if (!widget.visible && !isEditing) return null

    return (
        <div ref={setNodeRef} style={style} className={`relative group ${!widget.visible ? 'opacity-50 grayscale' : ''}`}>
            {children}

            {isEditing && (
                <div className="absolute top-2 right-2 flex items-center gap-2 z-20">
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onToggleVisibility(widget.id)
                        }}
                        className={`p-2 rounded-lg shadow-md border transition-all ${widget.visible ? 'bg-white hover:bg-gray-50' : 'bg-gray-100 hover:bg-gray-200'}`}
                        title={widget.visible ? "Hide Widget" : "Show Widget"}
                    >
                        {widget.visible ? <Eye className="w-4 h-4 text-gray-600" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                    </button>
                    <div
                        {...attributes}
                        {...listeners}
                        className="p-2 bg-white rounded-lg shadow-md border hover:bg-gray-50 text-gray-600 cursor-grab active:cursor-grabbing"
                    >
                        <GripVertical className="w-4 h-4" />
                    </div>
                </div>
            )}
        </div>
    )
}

// --- Main Page Component ---
export default function DashboardPage() {
    const router = useRouter()
    const { currentUser } = useUser()
    const { updateProfile } = useSettings()
    const { stats, loading, error } = useDashboardStats()

    // State
    const [isEditing, setIsEditing] = useState(false)
    const [widgets, setWidgets] = useState<WidgetConfig[]>([])

    // Sensors for DnD
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    // Load initial state
    useEffect(() => {
        const role = currentUser?.role || 'admin'
        const roleDefaults = DEFAULT_WIDGETS[role] || DEFAULT_WIDGETS.admin

        if (currentUser && currentUser.preferences && currentUser.preferences.dashboard_layout) {
            const savedLayout = currentUser.preferences.dashboard_layout as WidgetConfig[]
            if (Array.isArray(savedLayout)) {
                const mergedWidgets = roleDefaults.map(def => {
                    const existing = savedLayout.find(s => s.id === def.id)
                    return existing || def
                })
                setWidgets(mergedWidgets)
            } else {
                setWidgets(roleDefaults)
            }
        } else {
            setWidgets(roleDefaults)
        }
    }, [currentUser])

    const handleSaveLayout = async () => {
        setIsEditing(false)
        try {
            await updateProfile({
                preferences: {
                    ...currentUser?.preferences,
                    dashboard_layout: widgets
                }
            } as any)
        } catch (error) {
            console.error("Failed to save layout", error)
        }
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        if (active.id !== over?.id) {
            setWidgets((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id)
                const newIndex = items.findIndex((i) => i.id === over?.id)
                return arrayMove(items, oldIndex, newIndex)
            })
        }
    }

    const toggleWidgetVisibility = (id: WidgetId) => {
        setWidgets(prev => prev.map(w => w.id === id ? { ...w, visible: !w.visible } : w))
    }

    // --- Loading / Error States ---
    if (loading) {
        return <DashboardSkeleton />
    }

    if (error || !stats) {
        return (
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-12">
                <div className="p-6 bg-red-50 text-red-600 rounded-2xl border border-red-200">
                    <h3 className="font-bold text-lg mb-2">Error Loading Dashboard</h3>
                    <p>Unable to load dashboard data. Please try refreshing the page.</p>
                </div>
            </div>
        )
    }

    // Mock data for charts
    const revenueData = [
        { month: 'Jan', revenue: 12000 },
        { month: 'Feb', revenue: 14500 },
        { month: 'Mar', revenue: 13800 },
        { month: 'Apr', revenue: 16200 },
        { month: 'May', revenue: 18500 },
        { month: 'Jun', revenue: 19800 },
    ]

    const studentGrowthData = [
        { month: 'Jan', students: 45 },
        { month: 'Feb', students: 52 },
        { month: 'Mar', students: 48 },
        { month: 'Apr', students: 61 },
        { month: 'May', students: 67 },
        { month: 'Jun', students: 73 },
    ]

    const attendanceData = [
        { name: 'Attended', value: 156 },
        { name: 'Excused', value: 24 },
        { name: 'No-show', value: 8 },
        { name: 'Canceled', value: 12 },
    ]

    const overview = stats.overview

    // Widgets mapped by ID
    const widgetComponents: Record<string, React.ReactNode> = {
        // Admin Widgets
        total_students: (
            <MetricCard
                title="Total Students"
                value={overview.total_students?.value || 0}
                subtitle="students"
                trend={{ value: String(overview.total_students?.trend || ''), positive: !!overview.total_students?.positive }}
                color="blue"
                icon={<Users className="w-6 h-6" />}
                onClick={() => !isEditing && router.push('/dashboard/students')}
                className={isEditing ? 'pointer-events-none' : ''}
            />
        ),
        weekly_lessons: (
            <MetricCard
                title="This Week's Lessons"
                value={overview.weekly_lessons?.value || 0}
                subtitle="scheduled"
                trend={{ value: String(overview.weekly_lessons?.trend || ''), positive: !!overview.weekly_lessons?.positive }}
                color="green"
                icon={<Calendar className="w-6 h-6" />}
                onClick={() => !isEditing && router.push('/dashboard/schedule')}
                className={isEditing ? 'pointer-events-none' : ''}
            />
        ),
        monthly_revenue: (
            <MetricCard
                title="Revenue (Month)"
                value={`$${overview.monthly_revenue?.value || 0}`}
                subtitle="USD"
                trend={{ value: String(overview.monthly_revenue?.trend || ''), positive: !!overview.monthly_revenue?.positive }}
                color="green"
                icon={<DollarSignIcon className="w-6 h-6" />}
                onClick={() => !isEditing && router.push('/dashboard/billing')}
                className={isEditing ? 'pointer-events-none' : ''}
            />
        ),
        active_teachers: (
            <MetricCard
                title="Active Instructors"
                value={overview.active_teachers?.value || 0}
                subtitle="instructors"
                trend={{ value: String(overview.active_teachers?.trend || ''), positive: !!overview.active_teachers?.positive }}
                color="purple"
                icon={<GraduationCap className="w-6 h-6" />}
                onClick={() => !isEditing && router.push('/dashboard/teachers')}
                className={isEditing ? 'pointer-events-none' : ''}
            />
        ),
        unpaid_invoices: (
            <MetricCard
                title="Unpaid Invoices"
                value={overview.unpaid_invoices?.value || 0}
                subtitle="overdue"
                trend={{ value: String(overview.unpaid_invoices?.trend || ''), positive: !!overview.unpaid_invoices?.positive }}
                color="red"
                icon={<DollarSignIcon className="w-6 h-6" />}
                onClick={() => !isEditing && router.push('/dashboard/billing')}
                className={isEditing ? 'pointer-events-none' : ''}
            />
        ),
        avg_attendance: (
            <MetricCard
                title="Avg Attendance"
                value={overview.avg_attendance?.value || '0%'}
                subtitle="engagement"
                trend={{ value: String(overview.avg_attendance?.trend || ''), positive: !!overview.avg_attendance?.positive }}
                color="blue"
                icon={<TrendingUp className="w-6 h-6" />}
                className={isEditing ? 'pointer-events-none' : ''}
            />
        ),
        new_enquiries: (
            <MetricCard
                title="New Enquiries"
                value={overview.new_enquiries?.value || 0}
                subtitle="new leads"
                trend={{ value: String(overview.new_enquiries?.trend || ''), positive: !!overview.new_enquiries?.positive }}
                color="orange"
                icon={<Music className="w-6 h-6" />}
                className={isEditing ? 'pointer-events-none' : ''}
            />
        ),

        // Teacher Widgets
        my_students: (
            <MetricCard
                title="My Students"
                value={overview.my_students?.value || 0}
                subtitle="active"
                color="blue"
                icon={<Users className="w-6 h-6" />}
                onClick={() => !isEditing && router.push('/dashboard/students')}
                className={isEditing ? 'pointer-events-none' : ''}
            />
        ),
        lessons_today: (
            <MetricCard
                title="Today's Schedule"
                value={overview.lessons_today?.value || 0}
                subtitle="lessons"
                color="green"
                icon={<Calendar className="w-6 h-6" />}
                onClick={() => !isEditing && router.push('/dashboard/schedule')}
                className={isEditing ? 'pointer-events-none' : ''}
            />
        ),
        hours_taught: (
            <MetricCard
                title="Hours This Month"
                value={overview.hours_taught?.value || 0}
                subtitle="hours"
                color="purple"
                icon={<TrendingUp className="w-6 h-6" />}
                className={isEditing ? 'pointer-events-none' : ''}
            />
        ),

        // Student Widgets
        next_lesson: (
            <MetricCard
                title="Next Lesson"
                value={overview.next_lesson?.value || 'None'}
                subtitle={overview.next_lesson?.label || ''}
                color="blue"
                icon={<Music className="w-6 h-6" />}
                className={isEditing ? 'pointer-events-none' : ''}
            />
        ),
        practice_goal: (
            <MetricCard
                title="Practice Goal"
                value={overview.practice_goal?.value || '3/5'}
                subtitle={overview.practice_goal?.label || 'days this week'}
                trend={String(overview.practice_goal?.value || '').includes('100') ? { value: 'Goal Achieved!', positive: true } : { value: 'Keep it up!', positive: true }}
                color="green"
                icon={<Check className="w-6 h-6" />}
                className={isEditing ? 'pointer-events-none' : ''}
            />
        ),
        balance_due: (
            <MetricCard
                title="Balance Due"
                value={overview.balance_due?.value || '$0.00'}
                subtitle={overview.balance_due?.label || 'All paid up!'}
                color={String(overview.balance_due?.value || '').includes('$0') ? "blue" : "red"}
                icon={<DollarSignIcon className="w-6 h-6" />}
                onClick={() => !isEditing && router.push('/dashboard/billing')}
                className={isEditing ? 'pointer-events-none' : ''}
            />
        ),
    }

    return (
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4">
                <div className="space-y-2">
                    <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">Dashboard</h1>
                    <p className="text-gray-500 font-medium max-w-lg">
                        Welcome back, {currentUser?.first_name || 'User'}! Here's your studio overview.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {isEditing ? (
                        <>
                            <button
                                onClick={() => {
                                    setIsEditing(false)
                                    const role = currentUser?.role || 'admin'
                                    setWidgets(DEFAULT_WIDGETS[role] || DEFAULT_WIDGETS.admin)
                                }}
                                className="px-5 py-3 bg-white border-2 border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all font-bold text-sm active:scale-95"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveLayout}
                                className="px-5 py-3 bg-primary text-white rounded-xl hover:bg-primary-hover transition-all font-bold text-sm shadow-lg active:scale-95"
                            >
                                Save Layout
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all font-bold text-sm shadow-sm active:scale-95"
                        >
                            <Settings className="w-4 h-4" />
                            Customize
                        </button>
                    )}
                </div>
            </header>

            {/* Editing Instructions */}
            {isEditing && (
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-center gap-3 animate-in fade-in duration-300">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                        <Settings className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-sm font-medium text-blue-800">
                        <strong>Customization Mode:</strong> Drag cards to reorder, toggle visibility with the eye icon.
                    </p>
                </div>
            )}

            {/* Draggable Grid */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={widgets.map(w => w.id)}
                    strategy={rectSortingStrategy}
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {widgets.map((widget) => (
                            <SortableWidget
                                key={widget.id}
                                widget={widget}
                                isEditing={isEditing}
                                onToggleVisibility={toggleWidgetVisibility}
                            >
                                {widgetComponents[widget.id]}
                            </SortableWidget>
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            {/* Analytics Section - Admin & Teacher Only */}
            {(currentUser?.role === 'admin' || currentUser?.role === 'teacher') && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Analytics Overview</h2>
                    </div>

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Revenue Chart */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Revenue Trend</h3>
                                    <p className="text-sm text-gray-500 font-medium">Last 6 months</p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-md">
                                    <DollarSignIcon className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div className="h-64">
                                <RevenueChart data={revenueData} variant="area" />
                            </div>
                        </motion.div>

                        {/* Student Growth Chart */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Student Growth</h3>
                                    <p className="text-sm text-gray-500 font-medium">Monthly enrollment</p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-md">
                                    <Users className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div className="h-64">
                                <StudentGrowthChart data={studentGrowthData} />
                            </div>
                        </motion.div>

                        {/* Attendance Chart */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow lg:col-span-2"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Lesson Attendance</h3>
                                    <p className="text-sm text-gray-500 font-medium">This month breakdown</p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md">
                                    <TrendingUp className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div className="h-80">
                                <AttendanceChart data={attendanceData} />
                            </div>
                        </motion.div>
                    </div>
                </div>
            )}

            {/* Recent Activity */}
            {(currentUser?.role === 'admin' || currentUser?.role === 'teacher') && (
                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-2xl font-black text-gray-900 mb-6">Recent Activity</h3>
                    <ActivityList activities={stats.recent_activity} />
                </div>
            )}

            {/* Student Specific Content */}
            {currentUser?.role === 'student' && (
                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-2xl font-black text-gray-900 mb-6">Current Assignments</h3>
                    <div className="space-y-4">
                        <div className="p-6 bg-gray-50 rounded-xl border border-gray-100">
                            <h4 className="font-bold text-gray-900 mb-2">Recent Lessons</h4>
                            <p className="text-sm text-gray-600 mb-4 font-medium">Visit your lessons page to see full notes and assignments.</p>
                            <button
                                onClick={() => router.push('/dashboard/lessons')}
                                className="text-sm text-primary font-bold hover:text-primary-hover transition-colors flex items-center gap-1"
                            >
                                View All Lessons →
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// Helper for Activity List
function ActivityList({ activities }: { activities: any[] }) {
    if (!activities || activities.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-200 mb-4">
                    <Calendar className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-sm text-gray-400 font-semibold">No recent activity found.</p>
            </div>
        )
    }
    return (
        <div className="space-y-3">
            {activities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between py-4 px-5 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activity.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
                            activity.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                                'bg-blue-100 text-blue-600'
                            }`}>
                            <span className="text-lg font-bold">
                                {activity.type === 'success' ? '✓' : activity.type === 'warning' ? '⚠' : 'ℹ'}
                            </span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{activity.text}</span>
                    </div>
                    <span className="text-xs text-gray-500 font-bold">
                        {new Date(activity.time).toLocaleDateString()}
                    </span>
                </div>
            ))}
        </div>
    )
}
