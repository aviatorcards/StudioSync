'use client'

import { useState, useEffect } from 'react'
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

export default function EditStudentPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
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

    useEffect(() => {
        const fetchStudent = async () => {
            try {
                const response = await api.get(`/students/${params.id}/`)
                const student = response.data
                setFormData({
                    first_name: student.user?.first_name || '',
                    last_name: student.user?.last_name || '',
                    email: student.user?.email || '',
                    phone: student.user?.phone || '',
                    instrument: student.instrument || '',
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
        if (params.id) fetchStudent()
    }, [params.id, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            await api.patch(`/students/${params.id}/`, formData)
            toast.success('Student updated successfully!')
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
        if (!confirm('Are you sure you want to delete this student? This action cannot be undone.')) return
        try {
            await api.delete(`/students/${params.id}/`)
            toast.success('Student deleted')
            router.push('/dashboard/students')
        } catch (error) {
            toast.error('Failed to delete student')
        }
    }

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading student details...</div>
    }

    const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition'
    const disabledClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed'

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex justify-between items-start">
                    <div>
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Students
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900">Edit Student</h1>
                        <p className="text-gray-500 mt-1">Update student profile information</p>
                    </div>
                    <button
                        onClick={handleDelete}
                        className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg flex items-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete Student
                    </button>
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
                                    <input type="text" name="first_name" required value={formData.first_name} onChange={handleChange} className={inputClass} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Last Name <span className="text-red-500">*</span>
                                    </label>
                                    <input type="text" name="last_name" required value={formData.last_name} onChange={handleChange} className={inputClass} />
                                </div>
                            </div>
                        </section>

                        {/* ── Student Contact & Login ── */}
                        <section>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Mail className="w-5 h-5 text-[var(--color-primary)]" />
                                Student Contact &amp; Login
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <input type="email" name="email" disabled value={formData.email} className={disabledClass} />
                                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed directly</p>
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
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Birth Date</label>
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Instrument <span className="text-red-500">*</span>
                                </label>
                                <input type="text" name="instrument" required value={formData.instrument} onChange={handleChange} className={inputClass} />
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
                                        <span>Enter a birth date above to automatically show or hide this section based on the student's age.</span>
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
                                disabled={saving}
                                className="flex-1 px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
