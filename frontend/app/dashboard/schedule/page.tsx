'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/contexts/UserContext'
import { useLessons, useStudents, useTeachers, useBands, useRooms } from '@/hooks/useDashboardData'
import api from '@/services/api'
import { toast } from 'react-hot-toast'
import { format, addDays, startOfWeek, addMinutes, setHours, setMinutes, parseISO, isSameDay, getHours } from 'date-fns'
import {
    Printer, Plus, Link, X, ChevronLeft, ChevronRight,
    Calendar as CalendarIcon, Clock, Info, RefreshCw, Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Modal from '@/components/Modal'

// --- Types ---
interface LessonBooking {
    student: string
    teacher: string
    band: string
    room: string
    date: string
    time: string
    duration: number
    lesson_type: string
}

export default function SchedulePage() {
    const { currentUser } = useUser()
    const [currentWeek, setCurrentWeek] = useState(new Date())
    const [showBookingModal, setShowBookingModal] = useState(false)
    const [showSubscribeModal, setShowSubscribeModal] = useState(false)
    const [use24Hour, setUse24Hour] = useState(false)
    const [bookingLoading, setBookingLoading] = useState(false)

    // ESC key handling is now managed by Dialog component

    // Data Fetching
    const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 })
    const { lessons, loading: lessonsLoading, refetch: refetchLessons } = useLessons({
        start_date: format(weekStart, 'yyyy-MM-dd'),
        end_date: format(addDays(weekStart, 7), 'yyyy-MM-dd')
    })
    const { students } = useStudents()
    const { teachers } = useTeachers()
    const { bands } = useBands()
    const { rooms } = useRooms()

    const [newBooking, setNewBooking] = useState<LessonBooking>({
        student: '',
        teacher: '',
        band: '',
        room: '',
        date: '',
        time: '09:00',
        duration: 60,
        lesson_type: 'private'
    })

    const [bookingMode, setBookingMode] = useState<'individual' | 'band' | 'event'>('individual')

    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

    // Time slots (8 AM - 9 PM)
    const startHour = 8
    const endHour = 21
    const timeSlots = Array.from({ length: endHour - startHour + 1 }, (_, i) => i + startHour)

    // Accurate time dropdown options (15 min intervals)
    const timeOptions = (() => {
        const options = []
        let currentTime = setMinutes(setHours(new Date(), startHour), 0)
        const endTime = setMinutes(setHours(new Date(), endHour), 0)

        while (currentTime <= endTime) {
            options.push(format(currentTime, 'HH:mm'))
            currentTime = addMinutes(currentTime, 15)
        }
        return options
    })()

    // Helpers
    const formatTime = (timeStr: string) => {
        if (!timeStr) return ''
        const [hours, minutes] = timeStr.split(':').map(Number)
        const date = new Date()
        date.setHours(hours, minutes)
        return use24Hour ? format(date, 'HH:mm') : format(date, 'h:mm a')
    }

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
            const startDateTime = new Date(`${newBooking.date}T${newBooking.time}`)
            const endDateTime = addMinutes(startDateTime, newBooking.duration)

            const payload: any = {
                scheduled_start: startDateTime.toISOString(),
                scheduled_end: endDateTime.toISOString(),
                lesson_type: newBooking.lesson_type,
                status: 'scheduled',
            }

            if (currentUser?.role === 'student') {
                if (newBooking.teacher) payload.teacher = newBooking.teacher
            } else {
                if (bookingMode === 'band' && newBooking.band) {
                    payload.band = newBooking.band
                } else if (bookingMode === 'individual' && newBooking.student) {
                    payload.student = newBooking.student
                }
                // Optional room for any mode
                if (newBooking.room) {
                    payload.room = newBooking.room
                }
            }

            await api.post('/lessons/', payload)
            toast.success('Lesson booked successfully')
            setShowBookingModal(false)
            setNewBooking({ student: '', teacher: '', band: '', room: '', date: '', time: '09:00', duration: 60, lesson_type: 'private' })
            refetchLessons()
        } catch (error) {
            console.error(error)
            toast.error('Failed to create booking')
        } finally {
            setBookingLoading(false)
        }
    }

    const getLessonsForSlot = (dayIdx: number, hour: number) => {
        const targetDate = weekDays[dayIdx]
        return lessons.filter((lesson: any) => {
            const lessonUserDate = parseISO(lesson.scheduled_start)
            return isSameDay(lessonUserDate, targetDate) && getHours(lessonUserDate) === hour
        })
    }

    if (lessonsLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-in fade-in duration-500">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Synchronizing Schedule...</p>
            </div>
        )
    }

    return (
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 print:space-y-2">
            <style jsx global>{`
                @media print {
                    nav, aside, header button, .no-print { display: none !important; }
                    main { margin: 0 !important; padding: 0 !important; width: 100% !important; }
                    .print-full-width { width: 100% !important; overflow: visible !important; }
                    table { border-collapse: collapse !important; }
                    td, th { border: 1px solid #ddd !important; }
                }
            `}</style>

            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4">
                <div className="space-y-2">
                    <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">Schedule</h1>
                    <p className="text-gray-500 font-medium max-w-lg">Orchestrate your weekly lesson calendar.</p>
                </div>
                <div className="grid grid-cols-4 gap-2 sm:gap-3 no-print">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => refetchLessons()}
                        title="Refresh"
                        className="w-full"
                    >
                        <RefreshCw className={`w-4 h-4 ${lessonsLoading ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setUse24Hour(!use24Hour)}
                        className="gap-2 w-full"
                    >
                        <Clock className="w-4 h-4" />
                        <span className="hidden sm:inline">{use24Hour ? '24h' : '12h'}</span>
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setShowSubscribeModal(true)}
                        className="gap-2 w-full"
                    >
                        <Link className="w-4 h-4" />
                        <span className="hidden sm:inline">Subscribe</span>
                    </Button>
                    <Button
                        onClick={handlePrint}
                        className="gap-2 w-full"
                        style={{
                            backgroundColor: 'var(--color-primary-dark)',
                            color: 'white'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = '0.9'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = '1'
                        }}
                    >
                        <Printer className="w-4 h-4" />
                        <span className="hidden sm:inline">Print</span>
                    </Button>
                    {['admin', 'teacher', 'student'].includes(currentUser?.role || '') && (
                        <Button
                            onClick={() => setShowBookingModal(true)}
                            className="gap-2 hover:scale-105 col-span-4 w-full"
                        >
                            <Plus className="w-4 h-4" />
                            New Booking
                        </Button>
                    )}
                </div>
            </header>

            {/* Week Navigation */}
            <div className="flex justify-between items-center bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm no-print">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={previousWeek}
                    className="text-gray-600"
                >
                    <ChevronLeft className="w-6 h-6" />
                </Button>
                <div className="text-center">
                    <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                        {format(weekStart, 'MMMM yyyy')}
                    </h2>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">
                        {format(weekStart, 'MMM d')} — {format(addDays(weekStart, 6), 'MMM d')}
                    </p>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={nextWeek}
                    className="text-gray-600"
                >
                    <ChevronRight className="w-6 h-6" />
                </Button>
            </div>

            {/* Print Header */}
            <div className="hidden print:block text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                    Schedule: {format(weekStart, 'MMMM d')} - {format(addDays(weekStart, 6), 'MMMM d, yyyy')}
                </h2>
            </div>

            {/* Schedule Grid */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden print-full-width flex flex-col h-[70vh]">
                <div className="overflow-auto custom-scrollbar flex-1 relative">
                    <table className="w-full min-w-[1000px] border-separate border-spacing-0">
                        <thead className="bg-gray-50/80 backdrop-blur-sm sticky top-0 z-20">
                            <tr>
                                <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest w-24 sticky left-0 z-30 bg-gray-50 border-r border-b border-gray-100">
                                    Time
                                </th>
                                {weekDays.map((day, idx) => (
                                    <th key={idx} className={`px-4 py-4 text-center min-w-[140px] border-b border-gray-100 ${idx < 6 ? 'border-r' : ''}`}>
                                        <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isSameDay(day, new Date()) ? 'text-primary' : 'text-gray-400'}`}>
                                            {format(day, 'EEE')}
                                        </div>
                                        <div className={`text-2xl font-black ${isSameDay(day, new Date()) ? 'text-primary' : 'text-gray-900'}`}>
                                            {format(day, 'd')}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {timeSlots.map((hour) => (
                                <tr key={hour} className="group">
                                    <td className="px-4 py-4 text-xs font-bold text-gray-400 border-r border-gray-100 bg-gray-50/30 sticky left-0 z-10 text-center">
                                        {formatGridHour(hour)}
                                    </td>
                                    {weekDays.map((day, dayIdx) => {
                                        const slotLessons = getLessonsForSlot(dayIdx, hour)
                                        return (
                                            <td key={dayIdx} className={`p-1 border-gray-50 h-24 align-top transition-colors hover:bg-gray-50/50 ${dayIdx < 6 ? 'border-r' : ''}`}>
                                                {slotLessons.length > 0 ? (
                                                    <div className="space-y-1 h-full overflow-y-auto custom-scrollbar">
                                                        {slotLessons.map((lesson: any) => (
                                                            <div
                                                                key={lesson.id}
                                                                className={`
                                                                    p-2 rounded-lg border-l-[3px] shadow-sm hover:shadow-md transition-all cursor-pointer group/card
                                                                    ${lesson.status === 'scheduled' ? 'bg-primary/10 border-primary hover:bg-primary/20' : ''}
                                                                    ${lesson.status === 'completed' ? 'bg-gray-100 border-gray-400' : ''}
                                                                    ${lesson.status === 'cancelled' ? 'bg-red-50 border-red-400' : ''}
                                                                `}
                                                            >
                                                                <div className="flex justify-between items-start gap-1">
                                                                    <div className="font-bold text-gray-900 text-xs truncate leading-tight">
                                                                        {lesson.lesson_type === 'group' && lesson.band_name
                                                                            ? lesson.band_name
                                                                            : lesson.student_name}
                                                                    </div>
                                                                    <div className="flex items-center gap-1">
                                                                        {lesson.duration_minutes !== 60 && (
                                                                            <span className="text-[9px] font-black uppercase bg-white/50 px-1 rounded text-gray-500">
                                                                                {lesson.duration_minutes}m
                                                                            </span>
                                                                        )}
                                                                        {lesson.room_name && (
                                                                            <span className="text-[9px] font-black uppercase bg-blue-50 px-1 rounded text-blue-500 truncate max-w-[50px]">
                                                                                {lesson.room_name}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <p className="text-[10px] font-medium text-gray-500 mt-0.5 truncate group-hover/card:text-gray-700">
                                                                    {lesson.student_instrument}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : null}
                                            </td>
                                        )
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Booking Modal */}
            <Modal
                isOpen={showBookingModal}
                onClose={() => setShowBookingModal(false)}
                title="New Booking"
                footer={
                    <>
                        <Button
                            variant="outline"
                            onClick={() => setShowBookingModal(false)}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleBooking}
                            disabled={bookingLoading}
                            className="flex-[2] gap-2"
                        >
                            {bookingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Booking'}
                        </Button>
                    </>
                }
            >
                <form onSubmit={handleBooking} className="space-y-6">
                        {/* Booking Mode Selector */}
                        <div className="flex p-1 bg-gray-50 rounded-2xl border border-gray-100 mb-2">
                            {(['individual', 'band', 'event'] as const).map((mode) => (
                                <Button
                                    key={mode}
                                    type="button"
                                    onClick={() => {
                                        setBookingMode(mode)
                                        if (mode === 'band') setNewBooking(prev => ({ ...prev, lesson_type: 'group' }))
                                        if (mode === 'individual') setNewBooking(prev => ({ ...prev, lesson_type: 'private' }))
                                        if (mode === 'event') setNewBooking(prev => ({ ...prev, lesson_type: 'workshop' }))
                                    }}
                                    variant={bookingMode === mode ? 'default' : 'ghost'}
                                    size="sm"
                                    className={`flex-1 text-[10px] uppercase tracking-widest ${bookingMode !== mode ? 'text-gray-400' : ''}`}
                                    style={bookingMode === mode ? {
                                        backgroundColor: 'var(--color-primary-dark)',
                                        color: 'white'
                                    } : undefined}
                                >
                                    {mode}
                                </Button>
                            ))}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {currentUser?.role !== 'student' ? (
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                                        {bookingMode === 'band' ? 'Band / Group' : bookingMode === 'individual' ? 'Student' : 'Target (Optional)'}
                                    </label>

                                    {bookingMode === 'band' ? (
                                        <select
                                            required
                                            value={newBooking.band}
                                            onChange={(e) => setNewBooking({ ...newBooking, band: e.target.value, student: '' })}
                                            className="w-full px-4 py-3 bg-gray-50 border-transparent focus:bg-white border-2 focus:border-primary rounded-xl font-bold text-gray-700 outline-none transition-all appearance-none"
                                        >
                                            <option value="">Select Band...</option>
                                            {bands.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                                        </select>
                                    ) : bookingMode === 'individual' ? (
                                        <select
                                            required
                                            value={newBooking.student}
                                            onChange={(e) => setNewBooking({ ...newBooking, student: e.target.value, band: '' })}
                                            className="w-full px-4 py-3 bg-gray-50 border-transparent focus:bg-white border-2 focus:border-primary rounded-xl font-bold text-gray-700 outline-none transition-all appearance-none"
                                        >
                                            <option value="">Select Student...</option>
                                            {students.map((s: any) => <option key={s.id} value={s.id}>{s.name || s.user?.email || 'Student'}</option>)}
                                        </select>
                                    ) : (
                                        <select
                                            value={newBooking.student || newBooking.band}
                                            onChange={(e) => {
                                                const val = e.target.value
                                                if (!val) {
                                                    setNewBooking({ ...newBooking, student: '', band: '' })
                                                } else if (students.find(s => s.id === val)) {
                                                    setNewBooking({ ...newBooking, student: val, band: '' })
                                                } else {
                                                    setNewBooking({ ...newBooking, band: val, student: '' })
                                                }
                                            }}
                                            className="w-full px-4 py-3 bg-gray-50 border-transparent focus:bg-white border-2 focus:border-primary rounded-xl font-bold text-gray-700 outline-none transition-all appearance-none"
                                        >
                                            <option value="">No specific student/band</option>
                                            <optgroup label="Students">
                                                {students.map((s: any) => <option key={s.id} value={s.id}>{s.name || s.user?.email}</option>)}
                                            </optgroup>
                                            <optgroup label="Bands">
                                                {bands.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                                            </optgroup>
                                        </select>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Instructor</label>
                                    <select
                                        required
                                        value={newBooking.teacher}
                                        onChange={(e) => setNewBooking({ ...newBooking, teacher: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border-transparent focus:bg-white border-2 focus:border-primary rounded-xl font-bold text-gray-700 outline-none transition-all appearance-none"
                                    >
                                        <option value="">Select Instructor...</option>
                                        {teachers.map((t: any) => <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>)}
                                    </select>
                                </div>
                            )}
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Room / location</label>
                                <select
                                    value={newBooking.room}
                                    onChange={(e) => setNewBooking({ ...newBooking, room: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border-transparent focus:bg-white border-2 focus:border-primary rounded-xl font-bold text-gray-700 outline-none transition-all appearance-none"
                                >
                                    <option value="">Select Room...</option>
                                    {rooms.map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
                                    <option value="external">External / Online</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Date</label>
                                <input
                                    type="date"
                                    required
                                    value={newBooking.date}
                                    onChange={(e) => setNewBooking({ ...newBooking, date: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border-transparent focus:bg-white border-2 focus:border-primary rounded-xl font-bold text-gray-700 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Time</label>
                                <div className="relative">
                                    <select
                                        required
                                        value={newBooking.time}
                                        onChange={(e) => setNewBooking({ ...newBooking, time: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border-transparent focus:bg-white border-2 focus:border-primary rounded-xl font-bold text-gray-700 outline-none transition-all appearance-none"
                                    >
                                        {timeOptions.map(t => <option key={t} value={t}>{formatTime(t)}</option>)}
                                    </select>
                                    <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Duration (min)</label>
                                <input
                                    type="number"
                                    required
                                    min="15"
                                    step="15"
                                    value={newBooking.duration}
                                    onChange={(e) => setNewBooking({ ...newBooking, duration: parseInt(e.target.value) })}
                                    className="w-full px-4 py-3 bg-gray-50 border-transparent focus:bg-white border-2 focus:border-primary rounded-xl font-bold text-gray-700 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Lesson / Event Type</label>
                                <select
                                    value={newBooking.lesson_type}
                                    onChange={(e) => setNewBooking({ ...newBooking, lesson_type: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border-transparent focus:bg-white border-2 focus:border-primary-dark rounded-xl font-bold text-gray-700 outline-none transition-all appearance-none"
                                >
                                    <option value="private">Private Lesson</option>
                                    <option value="group">Group Lesson / Band</option>
                                    <option value="workshop">Workshop</option>
                                    <option value="recital">Recital</option>
                                    <option value="makeup">Makeup Lesson</option>
                                    <option value="other">Other Event</option>
                                </select>
                            </div>
                        </div>
                </form>
            </Modal>

            {/* Subscribe Modal */}
            <Modal
                isOpen={showSubscribeModal}
                onClose={() => setShowSubscribeModal(false)}
                title="Subscribe"
                footer={
                    <Button
                        variant="secondary"
                        onClick={() => setShowSubscribeModal(false)}
                        className="px-8"
                    >
                        Close
                    </Button>
                }
            >
                <div className="space-y-6">
                        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3">
                            <Info className="w-5 h-5 text-blue-600 shrink-0" />
                            <p className="text-sm text-blue-800 font-medium">Use this link to subscribe in your calendar app (Google Calendar, iCal, etc).</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Feed URL</label>
                            <div className="flex gap-2">
                                <input
                                    readOnly
                                    value="http://localhost:8000/api/calendar/my/lessons.ics"
                                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono text-gray-600 outline-none"
                                />
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        navigator.clipboard.writeText("http://localhost:8000/api/calendar/my/lessons.ics")
                                        toast.success("Copied!")
                                    }}
                                >
                                    Copy
                                </Button>
                            </div>
                        </div>
                </div>
            </Modal>
        </div>
    )
}
