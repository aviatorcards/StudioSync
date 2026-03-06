'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, User, Mail, Phone, Music, Users, Info, Trash2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '@/services/api'
import { formatPhoneNumber } from '@/lib/utils'

/** Returns the age in whole years given an ISO date string, or null if blank. */
function calcAge(birthDate: string): number | null {
    if (!birthDate) return null
    const today = new Date()
    const dob = new Date(birthDate)
    let age = today.getFullYear() - dob.getFullYear()
    const m = today.getMonth() - dob.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--
    return age
}

export default function EditStudentPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
    const params = use(paramsPromise)
    const studentId = params.id
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        instrument: '',
        instruments: [] as string[],
        birth_date: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
    })

    const age = calcAge(formData.birth_date)
    const isMinor = age !== null && age < 18
    const ageUnknown = age === null
    const showParentSection = isMinor || ageUnknown

    useEffect(() => {
        const fetchStudent = async () => {
            try {
                const response = await api.get(`/students/${studentId}/`)
                const student = response.data
                console.log('Fetched student data:', student)

                // Fallback logic for fields that might be either top-level or on the nested 'user' object
                const firstName = student.first_name || student.user?.first_name || (student.name ? student.name.split(' ')[0] : '')
                const lastName = student.last_name || student.user?.last_name || (student.name ? student.name.split(' ').slice(1).join(' ') : '')
                const email = student.email || student.user?.email || ''
                const phone = student.phone || student.user?.phone || ''

                setFormData({
                    first_name: firstName,
                    last_name: lastName,
                    email: email,
                    phone: phone,
                    instrument: '', // Used for input only
                    instruments: student.instruments || (student.instrument ? [student.instrument] : []),
                    birth_date: student.birth_date || '',
                    emergency_contact_name: student.emergency_contact_name || '',
                    emergency_contact_phone: student.emergency_contact_phone || '',
                })
            } catch (error) {
                console.error('Failed to load student:', error)
                toast.error('Failed to load student details')
                router.push('/dashboard/students')
            } finally {
                setLoading(false)
            }
        }
        if (studentId) fetchStudent()
    }, [studentId, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            await api.patch(`/students/${studentId}/`, formData)
            toast.success('Ready to go! Student profile updated.')
            router.push('/dashboard/students')
        } catch (error: any) {
            console.error('Failed to update student:', error)
            const errorMsg = error.response?.data?.email?.[0] || 'Failed to update student'
            toast.error(errorMsg)
        } finally {
            setSaving(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        let value = e.target.value
        if (e.target.type === 'tel') {
            value = formatPhoneNumber(value)
        }
        setFormData(prev => ({ ...prev, [e.target.name]: value }))
    }

    const handleDelete = async () => {
        if (!confirm('Are you sure? This will permanently remove the student profile.')) return
        try {
            await api.delete(`/students/${studentId}/`)
            toast.success('Profile removed')
            router.push('/dashboard/students')
        } catch (error) {
            toast.error('Failed to remove student')
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Music className="w-10 h-10 text-primary animate-bounce" />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Prepping the edit view...</p>
            </div>
        )
    }

    const inputClass = 'w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-primary rounded-2xl font-bold text-gray-700 outline-none transition-all'
    const disabledClass = 'w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-gray-400 cursor-not-allowed font-medium'

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-12">
            <div className="max-w-3xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="space-y-2">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 group mb-4"
                        >
                            <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                                <ArrowLeft className="w-4 h-4 text-gray-400 group-hover:text-white" />
                            </div>
                            <span className="text-[10px] font-black text-gray-400 group-hover:text-gray-900 uppercase tracking-[0.2em]">Return</span>
                        </button>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Edit Scholar Profile</h1>
                        <p className="text-gray-500 font-medium">Keep the details fresh and up to date</p>
                    </div>
                    <button
                        onClick={handleDelete}
                        className="text-red-600 hover:text-red-700 p-3 hover:bg-red-50 rounded-2xl flex items-center gap-2 font-bold text-xs uppercase tracking-widest border border-transparent hover:border-red-100 transition-all"
                    >
                        <Trash2 className="w-4 h-4" />
                        Remove Profile
                    </button>
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-10">
                    <form onSubmit={handleSubmit} className="space-y-10">

                        {/* ── Personal Information ── */}
                        <section className="space-y-6">
                            <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                    <User className="w-4 h-4" />
                                </div>
                                The Basics
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">First Name</label>
                                    <input type="text" name="first_name" required value={formData.first_name} onChange={handleChange} className={inputClass} placeholder="First Name" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Last Name</label>
                                    <input type="text" name="last_name" required value={formData.last_name} onChange={handleChange} className={inputClass} placeholder="Last Name" />
                                </div>
                            </div>
                        </section>

                        {/* ── Student Contact & Login ── */}
                        <section className="space-y-6">
                            <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-3">
                                <div className="w-8 h-8 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                                    <Mail className="w-4 h-4" />
                                </div>
                                Contact & Login
                            </h2>
                            <div className="space-y-6">
                                <div className="space-y-2 group">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Registered Email</label>
                                    <div className="relative">
                                        <input type="email" name="email" disabled value={formData.email} className={disabledClass} />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            <Info className="w-4 h-4 text-gray-300" />
                                        </div>
                                    </div>
                                    <p className="text-[10px] font-bold text-gray-400 italic">Login identity cannot be changed directly</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Direct Phone</label>
                                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={inputClass} placeholder="(555) 123-4567" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Celebration Day</label>
                                        <input type="date" name="birth_date" value={formData.birth_date} onChange={handleChange} className={inputClass} />
                                        {age !== null && (
                                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border w-fit mt-1 ${isMinor ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                                {isMinor ? `⚠ Minor — age ${age}` : `✓ Adult — age ${age}`}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* ── Musical Details ── */}
                        <section className="space-y-6">
                            <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-3">
                                <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                                    <Music className="w-4 h-4" />
                                </div>
                                Curriculum & Focus
                            </h2>
                            <div className="p-8 bg-indigo-50/50 rounded-3xl border border-indigo-100/50 space-y-6">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Focus Areas</label>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {formData.instruments.map(inst => (
                                        <div key={inst} className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-primary/10 rounded-2xl text-xs font-black text-primary uppercase tracking-widest cursor-pointer hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all group scale-in" onClick={() => {
                                            setFormData({ ...formData, instruments: formData.instruments.filter(i => i !== inst) })
                                        }}>
                                            {inst}
                                            <Plus className="w-3 h-3 rotate-45" />
                                        </div>
                                    ))}
                                </div>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="instrument"
                                        value={formData.instrument}
                                        onChange={handleChange}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter' && formData.instrument) {
                                                e.preventDefault()
                                                if (!formData.instruments.includes(formData.instrument)) {
                                                    setFormData({ ...formData, instruments: [...formData.instruments, formData.instrument], instrument: '' })
                                                }
                                            }
                                        }}
                                        className="w-full px-6 py-4 bg-white border-2 border-transparent focus:border-primary rounded-2xl font-bold text-gray-700 outline-none transition-all shadow-inner"
                                        placeholder="Add more areas of focus..."
                                    />
                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-3 flex items-center gap-2">
                                        <Info className="w-3 h-3" />
                                        Press Enter to add multiple entries
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* ── Parent / Guardian — conditional ── */}
                        {showParentSection && (
                            <section className={`rounded-[2rem] border p-8 space-y-6 ${isMinor ? 'bg-amber-50/50 border-amber-200/50' : 'bg-gray-50/50 border-gray-100'}`}>
                                <h2 className="text-xs font-black text-gray-900 flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isMinor ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400'}`}>
                                        <Users className="w-5 h-5" />
                                    </div>
                                    Guardianship & Safety
                                    {isMinor && (
                                        <span className="ml-2 text-[10px] font-black bg-amber-200 text-amber-800 px-3 py-1 rounded-full uppercase tracking-widest">
                                            Required
                                        </span>
                                    )}
                                </h2>

                                {ageUnknown && (
                                    <div className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-blue-100 text-xs font-medium text-blue-700 leading-relaxed shadow-sm">
                                        <Info className="w-5 h-5 flex-shrink-0 text-blue-400" />
                                        <span>Adding a birth date above will help us automatically manage this section for minors.</span>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Guardian Name</label>
                                        <input
                                            type="text"
                                            name="emergency_contact_name"
                                            required={isMinor}
                                            value={formData.emergency_contact_name}
                                            onChange={handleChange}
                                            className="w-full px-5 py-3.5 bg-white border-2 border-transparent focus:border-primary rounded-2xl font-bold text-gray-700 outline-none transition-all shadow-sm"
                                            placeholder="Parent or Guardian"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Primary Guardian Phone</label>
                                        <input
                                            type="tel"
                                            name="emergency_contact_phone"
                                            required={isMinor}
                                            value={formData.emergency_contact_phone}
                                            onChange={handleChange}
                                            className="w-full px-5 py-3.5 bg-white border-2 border-transparent focus:border-primary rounded-2xl font-bold text-gray-700 outline-none transition-all shadow-sm"
                                            placeholder="(555) 123-4567"
                                        />
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* ── Actions ── */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-10 py-4 bg-white border-2 border-gray-100 text-gray-500 rounded-2xl hover:bg-gray-50 font-black text-[10px] uppercase tracking-[0.2em] transition-all"
                            >
                                Never Mind
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 px-10 py-4 bg-primary text-white rounded-2xl hover:scale-105 shadow-xl shadow-primary/20 font-black text-[10px] uppercase tracking-[0.2em] transition-all disabled:opacity-50 disabled:scale-100"
                            >
                                {saving ? 'Applying...' : 'Save Profile Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
