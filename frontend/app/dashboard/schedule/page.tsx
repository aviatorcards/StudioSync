'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/contexts/UserContext'
import { useLessons, useStudents, useTeachers } from '@/hooks/useDashboardData'
import api from '@/services/api'
import { toast } from 'react-hot-toast'
import { format, addDays, startOfWeek, addMinutes, setHours, setMinutes, parseISO, isSameDay, getHours } from 'date-fns'
import {
    Printer,
    Plus,
    Link,
    X,
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Clock,
    Info,
    RefreshCw,
    Loader2
} from 'lucide-react'

export default function SchedulePage() {
    const { currentUser } = useUser()
    const [currentWeek, setCurrentWeek] = useState(new Date())
    const [showBookingModal, setShowBookingModal] = useState(false)
    const [showSubscribeModal, setShowSubscribeModal] = useState(false)
    const [use24Hour, setUse24Hour] = useState(false)
    const [bookingLoading, setBookingLoading] = useState(false)

    // Close on Escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setShowBookingModal(false)
                setShowSubscribeModal(false)
            }
        }
        if (showBookingModal || showSubscribeModal) {
            window.addEventListener('keydown', handleEscape)
            return () => window.removeEventListener('keydown', handleEscape)
        }
    }, [showBookingModal, showSubscribeModal])

    // Fetch data
    const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 })
    const { lessons, loading: lessonsLoading, refetch: refetchLessons } = useLessons({
        start_date: format(weekStart, 'yyyy-MM-dd'),
        end_date: format(addDays(weekStart, 7), 'yyyy-MM-dd')
    })
    const { students } = useStudents()
    const { teachers } = useTeachers()

    const [newBooking, setNewBooking] = useState({
        student: '',
        teacher: '',
        date: '',
        time: '09:00',
        duration: 60,
        lesson_type: 'private'
    })

    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

    // Generate time slots (8 AM to 9 PM)
    const startHour = 8
    const endHour = 21
    const timeSlots = Array.from({ length: endHour - startHour + 1 }, (_, i) => i + startHour)

    // Generate accurate time options for dropdown (15 min intervals)
    const generateTimeOptions = () => {
        const options = []
        let currentTime = setMinutes(setHours(new Date(), startHour), 0)
        const endTime = setMinutes(setHours(new Date(), endHour), 0)

        while (currentTime <= endTime) {
            options.push(format(currentTime, 'HH:mm'))
            currentTime = addMinutes(currentTime, 15)
        }
        return options
    }

    const timeOptions = generateTimeOptions()

    const formatTime = (timeStr: string) => {
        if (!timeStr) return ''
        const [hours, minutes] = timeStr.split(':').map(Number)
        const date = new Date()
        date.setHours(hours, minutes)
        return use24Hour ? format(date, 'HH:mm') : format(date, 'h:mm a')
    }

    // Display formatter for the grid (hour only)
    const formatGridHour = (hour: number) => {
        const date = new Date()
        date.setHours(hour, 0)
        return use24Hour ? format(date, 'HH:mm') : format(date, 'h a')
    }

    const previousWeek = () => setCurrentWeek(addDays(currentWeek, -7))
    const nextWeek = () => setCurrentWeek(addDays(currentWeek, 7))

    const handlePrint = () => {
        window.print()
    }

    const handleBooking = async (e: React.FormEvent) => {
        e.preventDefault()
        setBookingLoading(true)

        try {
            // Construct Date Objects
            const startDateTime = new Date(`${newBooking.date}T${newBooking.time}`)
            const endDateTime = addMinutes(startDateTime, newBooking.duration)

            const payload: any = {
                scheduled_start: startDateTime.toISOString(),
                scheduled_end: endDateTime.toISOString(),
                lesson_type: newBooking.lesson_type,
                status: 'scheduled',
            }

            if (currentUser?.role === 'student') {
                // Students book for themselves (backend force assigns)
                // Need to send teacher
                if (newBooking.teacher) {
                    payload.teacher = newBooking.teacher
                }
            } else {
                // Admin/Teacher books for student
                payload.student = newBooking.student
            }

            await api.post('/lessons/', payload)
            toast.success('Lesson booked successfully!')
            setShowBookingModal(false)
            setNewBooking({ student: '', teacher: '', date: '', time: '09:00', duration: 60, lesson_type: 'private' })
            refetchLessons()
        } catch (error) {
            console.error(error)
            toast.error('Failed to create booking')
        } finally {
            setBookingLoading(false)
        }
    }

    // Real data helper
    const getLessonsForSlot = (dayIdx: number, hour: number) => {
        const targetDate = weekDays[dayIdx]

        return lessons.filter((lesson: any) => {
            const lessonUserDate = parseISO(lesson.scheduled_start)
            // Check if same day and same hour
            return isSameDay(lessonUserDate, targetDate) && getHours(lessonUserDate) === hour
        })
    }

    if (lessonsLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                <p className="text-gray-500 font-bold tracking-[0.2em] uppercase text-xs">Synchronizing Schedule...</p>
            </div>
        )
    }

    return (
        <div className="max-w-[1600px] mx-auto px-4 pb-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 print:space-y-2">
            <style jsx global>{`
        @media print {
          nav, aside, header button, .no-print {
            display: none !important;
          }
          main {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
          }
          .print-full-width {
            width: 100% !important;
          }
        }
      `}</style>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Schedule</h1>
                    <p className="text-lg text-gray-500 mt-2 font-medium">Orchestrate your weekly lesson calendar.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 no-print">
                    <button
                        onClick={() => refetchLessons()}
                        className="p-3 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all shadow-sm active:scale-95"
                        title="Refresh"
                    >
                        <RefreshCw className={`w-4 h-4 ${lessonsLoading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={() => setUse24Hour(!use24Hour)}
                        className="px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all text-sm font-bold flex items-center gap-2 shadow-sm active:scale-95"
                    >
                        <Clock className="w-4 h-4" />
                        {use24Hour ? '24h' : '12h'}
                    </button>
                    <button
                        onClick={() => setShowSubscribeModal(true)}
                        className="px-5 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all shadow-sm text-sm font-bold flex items-center gap-2 active:scale-95"
                    >
                        <Link className="w-4 h-4" />
                        Subscribe
                    </button>
                    <button
                        onClick={handlePrint}
                        className="px-5 py-3 bg-[#2C3E50] text-white rounded-xl hover:bg-[#34495E] transition-all shadow-lg text-sm font-bold flex items-center gap-2 active:scale-95"
                    >
                        <Printer className="w-4 h-4" />
                        Print
                    </button>
                    {['admin', 'teacher', 'student'].includes(currentUser?.role || '') && (
                        <button
                            onClick={() => setShowBookingModal(true)}
                            className="px-5 py-3 bg-[#F39C12] text-white rounded-xl hover:bg-[#E67E22] transition-all shadow-lg text-sm font-bold flex items-center gap-2 active:scale-95 hover:scale-105"
                        >
                            <Plus className="w-4 h-4" />
                            New Booking
                        </button>
                    )}
                </div>
            </div>

            {/* Week Navigation */}
            <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl no-print">
                <button
                    onClick={previousWeek}
                    className="p-3 hover:bg-gray-100 rounded-xl transition-all text-gray-600 active:scale-90"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-black text-gray-900 tracking-tight">
                    {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
                </h2>
                <button
                    onClick={nextWeek}
                    className="p-3 hover:bg-gray-100 rounded-xl transition-all text-gray-600 active:scale-90"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>

            {/* Print-only Header */}
            <div className="hidden print:block text-center mb-4">
                <h2 className="text-xl font-bold">
                    Schedule: {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
                </h2>
            </div>

            {/* Schedule Grid */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl overflow-hidden print-full-width">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50 border-b border-gray-100 sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] w-28 bg-gray-50/50">
                                    Time
                                </th>
                                {weekDays.map((day, idx) => (
                                    <th key={idx} className="px-6 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-l border-gray-100 bg-gray-50/50">
                                        <div className="text-gray-400 mb-1.5">{format(day, 'EEE')}</div>
                                        <div className="text-2xl font-black text-gray-900">{format(day, 'd')}</div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {timeSlots.map((hour) => (
                                <tr key={hour} className="hover:bg-gray-50/30 transition-colors">
                                    <td className="px-6 py-4 text-sm font-bold text-gray-500 border-r border-gray-50 bg-gray-50/20">
                                        {formatGridHour(hour)}
                                    </td>
                                    {weekDays.map((day, dayIdx) => {
                                        const slotLessons = getLessonsForSlot(dayIdx, hour)
                                        return (
                                            <td key={dayIdx} className="px-2 py-2 border-r border-gray-50 last:border-0 print:border-gray-300 relative h-20 align-top">
                                                {slotLessons.length > 0 ? (
                                                    <div className="space-y-1.5">
                                                        {slotLessons.map((lesson: any) => (
                                                            <div
                                                                key={lesson.id}
                                                                className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 border-l-4 border-indigo-500 p-2.5 rounded-xl cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all print:bg-gray-100 print:border-gray-800 group text-xs overflow-hidden"
                                                                title={`${lesson.student_name} - ${lesson.student_instrument}`}
                                                            >
                                                                <div className="font-black text-indigo-900 print:text-black truncate leading-tight">
                                                                    {lesson.student_name}
                                                                </div>
                                                                <div className="text-indigo-600 print:text-gray-600 flex items-center justify-between text-[10px] font-bold mt-1">
                                                                    <span className="truncate">{lesson.student_instrument}</span>
                                                                    {lesson.duration_minutes > 0 && <span className="ml-1 bg-indigo-200 px-1.5 py-0.5 rounded">{lesson.duration_minutes}m</span>}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    // Empty slot click handler could go here
                                                    <div className="w-full h-full" />
                                                )}
                                            </td>
                                        )
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* New Booking Modal */}
            {showBookingModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[9999] no-print animate-in fade-in duration-300 antialiased" onClick={() => setShowBookingModal(false)}>
                    <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full mx-4 overflow-hidden animate-in zoom-in slide-in-from-top-4 duration-300 ring-1 ring-black/5" onClick={(e) => e.stopPropagation()}>
                        <div className="px-10 py-8 bg-[#2C3E50] text-white flex items-center justify-between ring-1 ring-white/10">
                            <div>
                                <h2 className="text-3xl font-black tracking-tight">New Booking</h2>
                                <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Schedule a Lesson Session</p>
                            </div>
                            <button onClick={() => setShowBookingModal(false)} className="w-12 h-12 rounded-2xl hover:bg-white/10 flex items-center justify-center transition-colors">
                                <X className="w-7 h-7" />
                            </button>
                        </div>

                        <form onSubmit={handleBooking} className="p-10 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {currentUser?.role !== 'student' && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Student *</label>
                                        <select
                                            required
                                            value={newBooking.student}
                                            onChange={(e) => setNewBooking({ ...newBooking, student: e.target.value })}
                                            className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#F39C12] outline-none font-bold text-gray-900 transition-all text-sm"
                                        >
                                            <option value="">Select a student...</option>
                                            {students.map((student: any) => (
                                                <option key={student.id} value={student.id}>
                                                    {student.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {currentUser?.role === 'student' && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Instructor *</label>
                                        <select
                                            required
                                            value={newBooking.teacher}
                                            onChange={(e) => setNewBooking({ ...newBooking, teacher: e.target.value })}
                                            className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#F39C12] outline-none font-bold text-gray-900 transition-all text-sm"
                                        >
                                            <option value="">Select an instructor...</option>
                                            {teachers.map((teacher: any) => (
                                                <option key={teacher.id} value={teacher.id}>
                                                    {teacher.first_name} {teacher.last_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Duration (min)</label>
                                    <input
                                        type="number"
                                        value={newBooking.duration}
                                        onChange={(e) => setNewBooking({ ...newBooking, duration: parseInt(e.target.value) })}
                                        className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#F39C12] outline-none font-bold text-gray-900 transition-all text-sm"
                                        step="15"
                                        min="15"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date *</label>
                                    <input
                                        type="date"
                                        required
                                        value={newBooking.date}
                                        onChange={(e) => setNewBooking({ ...newBooking, date: e.target.value })}
                                        className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#F39C12] outline-none font-bold text-gray-900 transition-all text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Time *</label>
                                    <div className="relative">
                                        <select
                                            required
                                            value={newBooking.time}
                                            onChange={(e) => setNewBooking({ ...newBooking, time: e.target.value })}
                                            className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#F39C12] outline-none appearance-none font-bold text-gray-900 transition-all text-sm"
                                        >
                                            {timeOptions.map((time) => (
                                                <option key={time} value={time}>
                                                    {formatTime(time)}
                                                </option>
                                            ))}
                                        </select>
                                        <Clock className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Lesson Type</label>
                                <select
                                    value={newBooking.lesson_type}
                                    onChange={(e) => setNewBooking({ ...newBooking, lesson_type: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#F39C12] outline-none font-bold text-gray-900 text-sm"
                                >
                                    <option value="private">Private Lesson</option>
                                    <option value="group">Group Lesson</option>
                                    <option value="workshop">Workshop</option>
                                    <option value="makeup">Makeup Lesson</option>
                                </select>
                            </div>

                            <div className="flex gap-4 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowBookingModal(false)}
                                    className="flex-1 px-8 py-4 border-2 border-gray-100 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all active:scale-95"
                                >
                                    Dismiss
                                </button>
                                <button
                                    type="submit"
                                    disabled={bookingLoading}
                                    className="flex-[2] px-8 py-4 bg-[#F39C12] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#E67E22] transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    {bookingLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Booking'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Subscribe Modal */}
            {showSubscribeModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[9999] no-print animate-in fade-in duration-300 antialiased" onClick={() => setShowSubscribeModal(false)}>
                    <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in zoom-in slide-in-from-top-4 duration-300 ring-1 ring-black/5" onClick={(e) => e.stopPropagation()}>
                        <div className="px-10 py-8 bg-[#2C3E50] text-white flex items-center justify-between ring-1 ring-white/10">
                            <div>
                                <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
                                    <Link className="w-7 h-7" />
                                    Subscribe
                                </h2>
                                <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Sync to Your Calendar</p>
                            </div>
                            <button onClick={() => setShowSubscribeModal(false)} className="w-12 h-12 rounded-2xl hover:bg-white/10 flex items-center justify-center transition-colors">
                                <X className="w-7 h-7" />
                            </button>
                        </div>

                        <div className="p-10 space-y-6">
                            <div className="bg-blue-50/50 p-5 rounded-2xl text-sm text-blue-800 border border-blue-100 flex gap-3">
                                <Info className="w-5 h-5 shrink-0 text-blue-600" />
                                <p className="font-medium leading-relaxed"><strong>How to use:</strong> Copy the link below and look for &quot;Add by URL&quot; or &quot;Subscribe&quot; in your calendar app settings. Your schedule will sync automatically!</p>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Your Calendar Feed URL</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        readOnly
                                        value="http://localhost:8000/api/calendar/my/lessons.ics"
                                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-600 focus:outline-none font-mono"
                                    />
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText("http://localhost:8000/api/calendar/my/lessons.ics")
                                            toast.success("Link copied to clipboard!")
                                        }}
                                        className="px-4 py-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl transition-all text-sm font-bold text-gray-700 active:scale-95"
                                    >
                                        Copy
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="px-10 pb-10 flex justify-end">
                            <button
                                onClick={() => setShowSubscribeModal(false)}
                                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all text-sm font-bold active:scale-95"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
