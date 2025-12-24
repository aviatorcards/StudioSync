'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, User, Mail, Phone, Music, Calendar, Trash2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '@/services/api'

export default function EditStudentPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        instrument: '',
        skill_level: 'beginner',
        birth_date: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
    })

    useEffect(() => {
        const fetchStudent = async () => {
            try {
                // Fetch student details
                // Note: The API likely returns nested user object. We need to flatten it or handle it.
                // Checking previous view_file of StudentViewSet, it returns nested user serialized data.
                const response = await api.get(`/students/students/${params.id}/`)
                const student = response.data

                setFormData({
                    first_name: student.user.first_name || '',
                    last_name: student.user.last_name || '',
                    email: student.user.email || '',
                    instrument: student.instrument || '',
                    skill_level: student.skill_level || 'beginner',
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

        if (params.id) {
            fetchStudent()
        }
    }, [params.id, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            await api.patch(`/students/students/${params.id}/`, formData)
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
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this student? This action cannot be undone.')) return

        try {
            await api.delete(`/students/students/${params.id}/`)
            toast.success('Student deleted')
            router.push('/dashboard/students')
        } catch (error) {
            toast.error('Failed to delete student')
        }
    }

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading student details...</div>
    }

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

                {/* Form Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Personal Information */}
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-[#F39C12]" />
                                Personal Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        First Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        required
                                        value={formData.first_name}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F39C12] focus:border-transparent outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Last Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        required
                                        value={formData.last_name}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F39C12] focus:border-transparent outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Mail className="w-5 h-5 text-[#F39C12]" />
                                Contact & Login
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        disabled
                                        value={formData.email}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed directly</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Birth Date
                                    </label>
                                    <input
                                        type="date"
                                        name="birth_date"
                                        value={formData.birth_date}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F39C12] focus:border-transparent outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Musical Information */}
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Music className="w-5 h-5 text-[#F39C12]" />
                                Musical Details
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Instrument <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="instrument"
                                        required
                                        value={formData.instrument}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F39C12] focus:border-transparent outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Skill Level
                                    </label>
                                    <select
                                        name="skill_level"
                                        value={formData.skill_level}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F39C12] focus:border-transparent outline-none"
                                    >
                                        <option value="beginner">Beginner</option>
                                        <option value="intermediate">Intermediate</option>
                                        <option value="advanced">Advanced</option>
                                        <option value="professional">Professional</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Emergency Contact */}
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Phone className="w-5 h-5 text-[#F39C12]" />
                                Emergency Contact
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Contact Name
                                    </label>
                                    <input
                                        type="text"
                                        name="emergency_contact_name"
                                        value={formData.emergency_contact_name}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F39C12] focus:border-transparent outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Contact Phone
                                    </label>
                                    <input
                                        type="tel"
                                        name="emergency_contact_phone"
                                        value={formData.emergency_contact_phone}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F39C12] focus:border-transparent outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
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
                                className="flex-1 px-6 py-2.5 bg-[#F39C12] text-white rounded-lg hover:bg-[#E67E22] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
