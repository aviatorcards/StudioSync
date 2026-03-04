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
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Loading Profile...</p>
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

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-12">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Navigation & Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <button
                        onClick={() => router.push('/dashboard/students')}
                        className="flex items-center gap-2 text-[10px] font-black text-gray-400 hover:text-gray-900 uppercase tracking-[0.2em] transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Roster
                    </button>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={() => router.push(`/dashboard/students/${studentId}/edit`)}
                            className="rounded-2xl gap-2 font-bold px-6"
                        >
                            <Edit className="w-4 h-4" />
                            Edit Profile
                        </Button>
                    </div>
                </div>

                {/* Profile Header Card */}
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden">
                    <div className="h-48 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative">
                        <div className="absolute -bottom-16 left-12 p-3 bg-white rounded-[2.5rem] shadow-xl">
                            <div className="w-32 h-32 rounded-[2rem] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-4 border-white overflow-hidden">
                                <span className="text-4xl font-black text-gray-400 uppercase tracking-tighter">
                                    {firstName[0]}{lastName[0]}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-20 pb-12 px-12 space-y-6">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase leading-none">
                                        {fullName}
                                    </h1>
                                    {student.is_active ? (
                                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-100">
                                            Active
                                        </span>
                                    ) : (
                                        <span className="px-3 py-1 bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-gray-100">
                                            Inactive
                                        </span>
                                    )}
                                </div>
                                <p className="text-lg font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <Music className="w-5 h-5 text-primary" />
                                    {student.instrument || 'Foundation Scholar'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Detailed Info Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Contact & Identity */}
                    <div className="lg:col-span-2 space-y-8">
                        <section className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
                            <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                    <User className="w-4 h-4" />
                                </div>
                                Identity & Contact
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Address</p>
                                    <p className="font-bold text-gray-900 flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-gray-300" />
                                        {email}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Direct Phone</p>
                                    <p className="font-bold text-gray-900 flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-gray-300" />
                                        {formatPhoneNumber(phone)}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date of Birth</p>
                                    <p className="font-bold text-gray-900 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-300" />
                                        {student.birth_date ? new Date(student.birth_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Not specified'}
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Emergency Contact */}
                        {(student.emergency_contact_name || student.emergency_contact_phone) && (
                            <section className="bg-amber-50/50 p-10 rounded-[2.5rem] border border-amber-100/50 space-y-8">
                                <h2 className="text-xs font-black text-amber-600/60 uppercase tracking-[0.3em] flex items-center gap-3">
                                    <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                                        <AlertCircle className="w-4 h-4" />
                                    </div>
                                    Guardianship & Emergency
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-amber-600/60 uppercase tracking-widest">Designated Guardian</p>
                                        <p className="font-bold text-gray-900">{student.emergency_contact_name || 'Not listed'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-amber-600/60 uppercase tracking-widest">Emergency Line</p>
                                        <p className="font-bold text-gray-900">{formatPhoneNumber(student.emergency_contact_phone) || 'Not listed'}</p>
                                    </div>
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Sidebar / Stats */}
                    <div className="space-y-8">
                        <section className="bg-gray-900 p-10 rounded-[2.5rem] text-white space-y-8">
                            <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Quick Metrics</h2>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Enrolled Since</span>
                                    <span className="font-black">2024</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Total Lessons</span>
                                    <span className="font-black text-2xl text-primary">12</span>
                                </div>
                                <div className="pt-6 border-t border-white/10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Clock className="w-4 h-4 text-primary" />
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Next Appearance</span>
                                    </div>
                                    <p className="font-bold text-lg">Next Tuesday @ 4:00 PM</p>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}
