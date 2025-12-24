'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import MetricCard from '@/components/MetricCard'
import AlertBanner from '@/components/AlertBanner'
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
import { GripVertical, Eye, EyeOff, TrendingUp, Users, DollarSign as DollarSignIcon } from 'lucide-react'
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
        <div ref={setNodeRef} style={style} className={`relative group ${!widget.visible ? 'opacity-50 grayscale border-dashed border-2' : ''}`}>
            {children}

            {isEditing && (
                <div className="absolute top-2 right-2 flex items-center space-x-1 z-20">
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onToggleVisibility(widget.id)
                        }}
                        className={`p-1.5 rounded-md shadow-sm border text-gray-600 transition-colors ${widget.visible ? 'bg-white hover:bg-gray-50' : 'bg-gray-100 hover:bg-gray-200'}`}
                        title={widget.visible ? "Hide Widget" : "Show Widget"}
                    >
                        {widget.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <div
                        {...attributes}
                        {...listeners}
                        className="p-1.5 bg-white rounded-md shadow-sm border hover:bg-gray-50 text-gray-600 cursor-grab active:cursor-grabbing"
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
    const [showAlert, setShowAlert] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [widgets, setWidgets] = useState<WidgetConfig[]>([])

    // Sensors for DnD
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    // Load initial state
    useEffect(() => {
        // Banner check
        const isDismissed = localStorage.getItem('dashboard_welcome_dismissed')
        if (!isDismissed) setShowAlert(true)

        // Preferences check
        const role = currentUser?.role || 'admin'
        const roleDefaults = DEFAULT_WIDGETS[role] || DEFAULT_WIDGETS.admin

        if (currentUser && currentUser.preferences && currentUser.preferences.dashboard_layout) {
            const savedLayout = currentUser.preferences.dashboard_layout as WidgetConfig[]
            if (Array.isArray(savedLayout)) {
                // Merge new defaults
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

    const handleDismissBanner = () => {
        setShowAlert(false)
        localStorage.setItem('dashboard_welcome_dismissed', 'true')
    }

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
            <div className="max-w-7xl mx-auto px-4 pt-12">
                <div className="p-6 bg-red-50 text-red-600 rounded-xl border border-red-200">
                    <h3 className="font-bold text-lg mb-2">Error Loading Dashboard</h3>
                    <p>Unable to load dashboard data. Please try refreshing the page.</p>
                </div>
            </div>
        )
    }

    // Mock data for charts - In production, this would come from the API
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

    // --- UI Structure ---
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
                icon="👥"
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
                icon="📆"
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
                icon="💵"
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
                color="blue"
                icon="👨‍🏫"
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
                icon="⚠️"
                onClick={() => !isEditing && router.push('/dashboard/billing')}
                className={isEditing ? 'pointer-events-none' : ''}
            />
        ),
        avg_attendance: (
            <MetricCard
                title="Avg Attendance"
                value={overview.avg_attendance?.value || '0%'}
                subtitle="high engagement"
                trend={{ value: String(overview.avg_attendance?.trend || ''), positive: !!overview.avg_attendance?.positive }}
                color="blue"
                icon="📈"
                className={isEditing ? 'pointer-events-none' : ''}
            />
        ),
        new_enquiries: (
            <MetricCard
                title="New Enquiries"
                value={overview.new_enquiries?.value || 0}
                subtitle="new leads"
                trend={{ value: String(overview.new_enquiries?.trend || ''), positive: !!overview.new_enquiries?.positive }}
                color="yellow"
                icon="📨"
                className={isEditing ? 'pointer-events-none' : ''}
            />
        ),

        // Teacher Widgets
        my_students: (
            <MetricCard
                title="My Students"
                value={overview.my_students?.value || 0}
                subtitle="active students"
                color="blue"
                icon="🎓"
                onClick={() => !isEditing && router.push('/dashboard/students')}
                className={isEditing ? 'pointer-events-none' : ''}
            />
        ),
        lessons_today: (
            <MetricCard
                title="Today's Schedule"
                value={overview.lessons_today?.value || 0}
                subtitle="lessons remaining"
                color="green"
                icon="📅"
                onClick={() => !isEditing && router.push('/dashboard/schedule')}
                className={isEditing ? 'pointer-events-none' : ''}
            />
        ),
        hours_taught: (
            <MetricCard
                title="Hours This Month"
                value={overview.hours_taught?.value || 0}
                subtitle="teaching hours"
                color="blue"
                icon="⏱️"
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
                icon="🎹"
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
                icon="🎵"
                className={isEditing ? 'pointer-events-none' : ''}
            />
        ),
        balance_due: (
            <MetricCard
                title="Balance Due"
                value={overview.balance_due?.value || '$0.00'}
                subtitle={overview.balance_due?.label || 'All paid up!'}
                color={String(overview.balance_due?.value || '').includes('$0') ? "blue" : "red"}
                icon="💰"
                onClick={() => !isEditing && router.push('/dashboard/billing')}
                className={isEditing ? 'pointer-events-none' : ''}
            />
        ),
    }

    return (
        <div className="max-w-7xl mx-auto px-4 pb-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Alert Banners */}
            {showAlert && (
                <AlertBanner
                    type="info"
                    message={`Welcome back, ${currentUser?.first_name || 'Admin'}! Live dashboard data is ready.`}
                    actionLabel="Dismiss"
                    onAction={handleDismissBanner}
                    onDismiss={handleDismissBanner}
                />
            )}

            {/* Customization Controls */}
            <div className="flex justify-end">
                {isEditing ? (
                    <div className="flex items-center gap-3 animate-in fade-in">
                        <span className="text-xs text-gray-500 font-semibold">Drag to reorder • Toggle eye to hide</span>
                        <button
                            onClick={() => {
                                setIsEditing(false);
                                const role = currentUser?.role || 'admin';
                                setWidgets(DEFAULT_WIDGETS[role] || DEFAULT_WIDGETS.admin);
                            }}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-bold text-sm active:scale-95"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveLayout}
                            className="px-4 py-2 bg-[#F39C12] text-white rounded-xl hover:bg-[#E67E22] transition-all font-bold text-sm shadow-lg active:scale-95"
                        >
                            Save Layout
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="text-xs text-gray-400 hover:text-gray-700 hover:underline flex items-center transition-colors font-semibold"
                    >
                        <span className="mr-1">⚙️</span> Customize Layout
                    </button>
                )}
            </div>

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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

            {/* Data Visualization Section - Only for admin and teacher */}
            {(currentUser?.role === 'admin' || currentUser?.role === 'teacher') && (
                <div className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex items-center justify-between"
                    >
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                            Analytics Overview
                        </h2>
                    </motion.div>

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
                                    <p className="text-sm text-gray-600">Last 6 months</p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
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
                                    <p className="text-sm text-gray-600">Monthly enrollment</p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
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
                                    <p className="text-sm text-gray-600">This month breakdown</p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
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

            {/* Role Specific Content */}
            {currentUser?.role === 'student' && (
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl">
                    <h3 className="text-2xl font-black text-gray-900 mb-6">Current Assignments</h3>
                    <div className="space-y-4">
                        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                            <h4 className="font-bold text-gray-900 mb-2">Recent Lessons</h4>
                            <p className="text-sm text-gray-600 mb-4 font-medium">Visit your lessons page to see full notes and assignments.</p>
                            <button
                                onClick={() => router.push('/dashboard/lessons')}
                                className="text-sm text-[#F39C12] font-bold hover:text-[#E67E22] transition-colors flex items-center gap-1"
                            >
                                View All Lessons →
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Recent Activity */}
            {(currentUser?.role === 'admin' || currentUser?.role === 'teacher') && (
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl">
                    <h3 className="text-2xl font-black text-gray-900 mb-6">Recent Activity</h3>
                    <ActivityList activities={stats.recent_activity} />
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
                    <span className="text-2xl">📋</span>
                </div>
                <p className="text-sm text-gray-400 font-semibold">No recent activity found.</p>
            </div>
        )
    }
    return (
        <div className="space-y-3">
            {activities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between py-4 px-5 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activity.type === 'success' ? 'bg-green-100 text-green-600' :
                                activity.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
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

