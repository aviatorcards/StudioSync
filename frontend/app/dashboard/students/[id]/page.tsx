'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import {
    ArrowLeft, User, Mail, Phone, Music,
    Calendar, Edit, Trash2, Clock,
    CheckCircle2, AlertCircle, MapPin
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import api from '@/services/api'
import { toast } from 'react-hot-toast'
import { formatPhoneNumber } from '@/lib/utils'

export default function StudentProfilePage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
    const params = use(paramsPromise)
    const studentId = params.id
    const router = useRouter()
    const [student, setStudent] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStudent = async () => {
            try {
                const response = await api.get(`/students/${studentId}/`)
                setStudent(response.data)
            } catch (error) {
                console.error('Failed to load student:', error)
                toast.error('Failed to load student profile')
                router.push('/dashboard/students')
            } finally {
                setLoading(false)
            }
        }
        if (studentId) fetchStudent()
    }, [studentId, router])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50/30">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <User className="w-6 h-6 text-primary animate-pulse" />
                        </div>
                    </div>
                    <div className="space-y-1 text-center">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Profile Access</p>
                        <p className="text-sm font-bold text-gray-900">Gathering the student details...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (!student) return null

    const firstName = student.first_name || student.user?.first_name || (student.name ? student.name.split(' ')[0] : 'Member')
    const lastName = student.last_name || student.user?.last_name || (student.name ? student.name.split(' ').slice(1).join(' ') : '')
    const email = student.email || student.user?.email || 'No email provided'
    const phone = student.phone || student.user?.phone || 'No phone provided'
    const fullName = `${firstName} ${lastName}`.trim()
    const instruments = student.instruments || (student.instrument ? [student.instrument] : [])

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-12">
            <div className="max-w-5xl mx-auto space-y-10">
                {/* Navigation & Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <button
                        onClick={() => router.push('/dashboard/students')}
                        className="flex items-center gap-2 group"
                    >
                        <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                            <ArrowLeft className="w-4 h-4 text-gray-400 group-hover:text-white" />
                        </div>
                        <span className="text-[10px] font-black text-gray-400 group-hover:text-gray-900 uppercase tracking-[0.2em] transition-colors">
                            Return to Student Roster
                        </span>
                    </button>
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            onClick={() => router.push(`/dashboard/students?edit=${studentId}`)}
                            className="h-12 rounded-2xl gap-3 font-bold px-8 border-gray-200 hover:border-primary hover:text-primary transition-all shadow-sm"
                        >
                            <Edit className="w-4 h-4" />
                            Update Profile
                        </Button>
                    </div>
                </div>

                {/* Profile Header Card */}
                <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden group">
                    <div className="h-64 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 relative overflow-hidden">
                        {/* Decorative background elements */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full -ml-32 -mb-32 blur-2xl" />

                        <div className="absolute -bottom-16 left-12 p-3 bg-white rounded-[2.5rem] shadow-2xl transition-transform duration-500 group-hover:scale-105">
                            <div className="w-32 h-32 rounded-[2rem] bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center border-4 border-white overflow-hidden shadow-inner">
                                <span className="text-4xl font-black text-gray-400 uppercase tracking-tighter">
                                    {firstName[0]}{lastName[0]}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-24 pb-12 px-12 space-y-8">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 flex-wrap">
                                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight uppercase leading-none">
                                        {fullName}
                                    </h1>
                                    {student.is_active ? (
                                        <div className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-100 shadow-sm shadow-emerald-100/50">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            Active Member
                                        </div>
                                    ) : (
                                        <span className="px-4 py-1.5 bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-gray-200">
                                            Currently Away
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {instruments.length > 0 ? (
                                        instruments.map((inst: string, idx: number) => (
                                            <div key={idx} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-100/50 shadow-sm">
                                                <Music className="w-4 h-4 text-indigo-400" />
                                                <span className="text-sm font-bold uppercase tracking-wider">{inst}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-500 rounded-xl border border-gray-100">
                                            <Music className="w-4 h-4 text-gray-300" />
                                            <span className="text-sm font-bold uppercase tracking-wider">Foundation Scholar</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Detailed Info Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Contact & Identity */}
                    <div className="lg:col-span-2 space-y-8">
                        <section className="bg-white p-12 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-200/30 space-y-10">
                            <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-4">
                                <div className="w-10 h-10 bg-blue-50/50 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                                    <User className="w-5 h-5" />
                                </div>
                                The Essentials
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                                <div className="space-y-2 group">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-primary transition-colors">Reach out at</p>
                                    <p className="font-bold text-lg text-gray-900 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                                            <Mail className="w-4 h-4 text-gray-300 group-hover:text-blue-400" />
                                        </div>
                                        {email}
                                    </p>
                                </div>
                                <div className="space-y-2 group">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-primary transition-colors">Call or Text</p>
                                    <p className="font-bold text-lg text-gray-900 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                                            <Phone className="w-4 h-4 text-gray-300 group-hover:text-blue-400" />
                                        </div>
                                        {formatPhoneNumber(phone)}
                                    </p>
                                </div>
                                <div className="space-y-2 group">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-primary transition-colors">Celebration Day</p>
                                    <p className="font-bold text-lg text-gray-900 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                                            <Calendar className="w-4 h-4 text-gray-300 group-hover:text-blue-400" />
                                        </div>
                                        {student.birth_date ? new Date(student.birth_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Waiting to be updated'}
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Emergency Contact */}
                        {(student.emergency_contact_name || student.emergency_contact_phone) && (
                            <section className="bg-gradient-to-br from-amber-50/80 to-orange-50/50 p-12 rounded-[3rem] border border-amber-100/50 space-y-10 shadow-lg shadow-amber-100/20">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xs font-black text-amber-700/60 uppercase tracking-[0.3em] flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-amber-600 shadow-sm">
                                            <AlertCircle className="w-5 h-5" />
                                        </div>
                                        Family & Safety
                                    </h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-amber-700/50 uppercase tracking-widest">Primary Guardian</p>
                                        <p className="text-xl font-black text-gray-900">{student.emergency_contact_name || 'Not listed yet'}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-amber-700/50 uppercase tracking-widest">Emergency Line</p>
                                        <p className="text-xl font-black text-gray-900">{formatPhoneNumber(student.emergency_contact_phone) || 'Not listed yet'}</p>
                                    </div>
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Sidebar / Stats */}
                    <div className="space-y-8">
                        <section className="bg-gray-900 p-10 rounded-[3rem] text-white space-y-10 overflow-hidden relative group">
                            {/* Decorative element */}
                            <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/30 transition-all duration-700" />

                            <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] relative z-10">Studio Journey</h2>
                            <div className="space-y-8 relative z-10">
                                <div className="space-y-2">
                                    <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Part of the family since</span>
                                    <p className="text-2xl font-black">{student.created_at ? new Date(student.created_at).getFullYear() : '2024'}</p>
                                </div>
                                <div className="space-y-2">
                                    <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Milestones Achieved</span>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-black text-primary">12</span>
                                        <span className="text-xs font-bold text-gray-400 lowercase tracking-normal italic">shared lessons</span>
                                    </div>
                                </div>
                                <div className="pt-8 border-t border-white/5 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                                            <Clock className="w-4 h-4" />
                                        </div>
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Upcoming Lesson</span>
                                    </div>
                                    <div className="bg-white/5 p-5 rounded-2xl border border-white/5 group-hover:border-primary/20 transition-all">
                                        <p className="font-black text-lg">Next Tuesday</p>
                                        <p className="text-primary text-sm font-bold">4:00 PM Sharp</p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}
