'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, User, Mail, Phone, Music, Users, Info } from 'lucide-react'
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

export default function AddStudentPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        instrument: '',
        birth_date: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
    })

    const age = calcAge(formData.birth_date)
    const isMinor = age !== null && age < 18
    const ageUnknown = age === null
    const showParentSection = isMinor || ageUnknown

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            await api.post('/students/', formData)
            toast.success('Student created successfully!')
            router.push('/dashboard/students')
        } catch (error: any) {
            console.error('Failed to create student:', error)
            const errorMsg = error.response?.data?.email?.[0] || 'Failed to create student'
            toast.error(errorMsg)
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        let value = e.target.value
        if (e.target.type === 'tel') {
            value = formatPhoneNumber(value)
        }
        setFormData(prev => ({ ...prev, [e.target.name]: value }))
    }

    const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition'

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Students
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">Add New Student</h1>
                    <p className="text-gray-500 mt-1">Create a new student profile with login credentials</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* ── Personal Information ── */}
                        <section>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-[var(--color-primary)]" />
                                Personal Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        First Name <span className="text-red-500">*</span>
                                    </label>
                                    <input type="text" name="first_name" required value={formData.first_name} onChange={handleChange} className={inputClass} placeholder="John" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Last Name <span className="text-red-500">*</span>
                                    </label>
                                    <input type="text" name="last_name" required value={formData.last_name} onChange={handleChange} className={inputClass} placeholder="Doe" />
                                </div>
                            </div>
                        </section>

                        {/* ── Contact & Login ── */}
                        <section>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Mail className="w-5 h-5 text-[var(--color-primary)]" />
                                Student Contact &amp; Login
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email Address <span className="text-red-500">*</span>
                                    </label>
                                    <input type="email" name="email" required value={formData.email} onChange={handleChange} className={inputClass} placeholder="john.doe@example.com" />
                                    <p className="text-xs text-gray-500 mt-1">Used for login — can be the student's or parent's email for minors</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Student Phone Number
                                        </label>
                                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={inputClass} placeholder="(555) 123-4567" />
                                        <p className="text-xs text-gray-500 mt-1">Direct line for the student</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Birth Date
                                        </label>
                                        <input type="date" name="birth_date" value={formData.birth_date} onChange={handleChange} className={inputClass} />
                                        {age !== null && (
                                            <p className="text-xs mt-1 font-medium" style={{ color: isMinor ? '#d97706' : '#16a34a' }}>
                                                {isMinor ? `⚠ Minor — age ${age}` : `✓ Adult — age ${age}`}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* ── Musical Details ── */}
                        <section>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Music className="w-5 h-5 text-[var(--color-primary)]" />
                                Musical Details
                            </h2>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Instrument</label>
                                <input type="text" name="instrument" value={formData.instrument} onChange={handleChange} className={inputClass} placeholder="Piano, Guitar, Violin... (Optional)" />
                            </div>
                        </section>

                        {/* ── Parent / Guardian — conditional ── */}
                        {showParentSection && (
                            <section className={`rounded-xl border p-6 space-y-4 ${isMinor ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'}`}>
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <Users className={`w-5 h-5 ${isMinor ? 'text-amber-600' : 'text-gray-500'}`} />
                                    Parent / Guardian Contact
                                    {isMinor && (
                                        <span className="ml-2 text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                                            Required for minors
                                        </span>
                                    )}
                                </h2>

                                {ageUnknown && (
                                    <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
                                        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                        <span>Enter a birth date above to automatically show or hide this section based on the student's age. You can still fill it in now if needed.</span>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Parent / Guardian Name
                                            {isMinor && <span className="text-red-500 ml-1">*</span>}
                                        </label>
                                        <input
                                            type="text"
                                            name="emergency_contact_name"
                                            required={isMinor}
                                            value={formData.emergency_contact_name}
                                            onChange={handleChange}
                                            className={inputClass}
                                            placeholder="Parent or Guardian"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Parent / Guardian Phone
                                            {isMinor && <span className="text-red-500 ml-1">*</span>}
                                        </label>
                                        <input
                                            type="tel"
                                            name="emergency_contact_phone"
                                            required={isMinor}
                                            value={formData.emergency_contact_phone}
                                            onChange={handleChange}
                                            className={inputClass}
                                            placeholder="(555) 123-4567"
                                        />
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* ── Actions ── */}
                        <div className="flex gap-3 pt-4 border-t">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Creating...' : 'Create Student'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
