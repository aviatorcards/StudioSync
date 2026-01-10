'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    UserPlus, Search, Edit, Mail, Phone,
    GraduationCap, Music, Users, Loader2, X,
    CheckCircle, Download, ChevronRight,
    DollarSign, Briefcase, Award, Zap
} from 'lucide-react'
import { useUser } from '@/contexts/UserContext'
import { useTeachers } from '@/hooks/useDashboardData'
import api from '@/services/api'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Dialog, DialogHeader, DialogContent, DialogFooter } from '@/components/ui/dialog'

export default function InstructorsPage() {
    const router = useRouter()
    const { currentUser } = useUser()
    const { teachers, loading, refresh } = useTeachers()

    const [searchQuery, setSearchQuery] = useState('')
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [selectedTeacher, setSelectedTeacher] = useState<any>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [newInstrument, setNewInstrument] = useState('')

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        specialties: [] as string[],
        hourly_rate: '',
        is_active: true
    })

    const handleOpenEdit = (teacher: any) => {
        setSelectedTeacher(teacher)
        setFormData({
            first_name: teacher.first_name || '',
            last_name: teacher.last_name || '',
            email: teacher.email || '',
            phone: teacher.phone || '',
            specialties: Array.isArray(teacher.specialties) ? teacher.specialties :
                (Array.isArray(teacher.instruments) ? teacher.instruments : []),
            hourly_rate: teacher.hourly_rate?.toString() || '',
            is_active: teacher.is_active ?? true
        })
        setIsEditModalOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            await api.patch(`/core/teachers/${selectedTeacher.id}/`, formData)
            toast.success('Instructor updated successfully')
            setIsEditModalOpen(false)
            if (refresh) refresh()
        } catch (error: any) {
            console.error('Failed to update teacher:', error)
            toast.error(error.response?.data?.detail || 'Failed to update instructor')
        } finally {
            setIsSubmitting(false)
        }
    }

    const filteredTeachers = teachers.filter((t: any) => {
        const fullName = `${t.first_name} ${t.last_name}`.toLowerCase()
        return fullName.includes(searchQuery.toLowerCase()) ||
            t.email.toLowerCase().includes(searchQuery.toLowerCase())
    })

    const handleExport = () => {
        const headers = ['First Name', 'Last Name', 'Specialties', 'Email', 'Phone', 'Students', 'Rate']
        const csvContent = [
            headers.join(','),
            ...teachers.map((t: any) => [
                t.first_name,
                t.last_name,
                `"${Array.isArray(t.specialties) ? t.specialties.join(', ') : (Array.isArray(t.instruments) ? t.instruments.join(', ') : '')}"`,
                t.email,
                t.phone,
                t.students_count || 0,
                t.hourly_rate
            ].join(','))
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'instructors_export.csv'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success('Instructors list exported successfully')
    }

    // Calculate stats
    const activeInstructors = teachers.filter((t: any) => t.is_active).length
    const totalStudents = teachers.reduce((sum: number, t: any) => sum + (t.students_count || 0), 0)
    const avgRate = teachers.length > 0
        ? (teachers.reduce((sum: number, t: any) => sum + (parseFloat(t.hourly_rate) || 0), 0) / teachers.length).toFixed(2)
        : '0.00'

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-in fade-in duration-500">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Scanning Faculty Records...</p>
            </div>
        )
    }

    return (
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4">
                <div className="space-y-2">
                    <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight">Faculty & Mentors</h1>
                    <p className="text-gray-500 font-medium max-w-lg">Oversee pedagogical impact, instructional quality, and faculty growth.</p>
                </div>
                {currentUser?.role === 'admin' && (
                    <Button
                        onClick={() => router.push('/dashboard/users')}
                        className="gap-2 hover:scale-105 shadow-lg shadow-primary/20 transition-all font-black uppercase tracking-widest text-[10px] py-6 px-8"
                    >
                        <UserPlus className="w-4 h-4" />
                        Onboard Faculty
                    </Button>
                )}
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Faculty', value: teachers.length, icon: Users, color: 'purple' },
                    { label: 'Active Status', value: activeInstructors, icon: CheckCircle, color: 'emerald' },
                    { label: 'Mentorship Count', value: totalStudents, icon: GraduationCap, color: 'blue' },
                    { label: 'Market Average', value: `$${avgRate}`, icon: Music, color: 'orange' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm group hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 flex items-center justify-center text-${stat.color}-600 group-hover:scale-110 transition-transform`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Insights</div>
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                        <h3 className="text-3xl font-black text-gray-900 tracking-tight uppercase tracking-tighter">{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* Search & Export */}
            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative flex-1 w-full max-w-xl">
                    <Search className="absolute left-4 top-1/2 -track-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search faculty identity, instrument, or expertise..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-transparent focus:bg-white border-2 focus:border-primary rounded-2xl font-bold text-sm text-gray-700 outline-none transition-all"
                    />
                </div>
                <Button
                    variant="ghost"
                    onClick={handleExport}
                    className="gap-2 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-primary transition-colors"
                >
                    <Download className="w-4 h-4" />
                    Generate Directory Report
                </Button>
            </div>

            {/* Instructors List */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-2xl overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full border-separate border-spacing-0">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Instructor Identity</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Expertise Area</th>
                                <th className="px-8 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Mentorships</th>
                                <th className="px-8 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Market Rate</th>
                                <th className="px-8 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Operations</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredTeachers.map((teacher) => (
                                <tr key={teacher.id} className="group hover:bg-gray-50/30 transition-all">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-900 font-black text-lg border-2 border-white shadow-sm overflow-hidden group-hover:scale-105 transition-all">
                                                {teacher.avatar ? (
                                                    <img src={teacher.avatar} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    teacher.first_name[0].toUpperCase()
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-black text-gray-900 uppercase tracking-tighter leading-tight">
                                                    {teacher.first_name} {teacher.last_name}
                                                </span>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{teacher.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-wrap gap-1.5">
                                            {Array.from(new Set([
                                                ...(Array.isArray(teacher.specialties) ? teacher.specialties : []),
                                                ...(Array.isArray(teacher.instruments) ? teacher.instruments : [])
                                            ])).slice(0, 3).map((spec: string) => (
                                                <span key={spec} className="inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase bg-primary/5 text-primary border border-primary/10">
                                                    {spec}
                                                </span>
                                            ))}
                                            {Array.from(new Set([
                                                ...(Array.isArray(teacher.specialties) ? teacher.specialties : []),
                                                ...(Array.isArray(teacher.instruments) ? teacher.instruments : [])
                                            ])).length > 3 && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-black text-gray-400 uppercase">
                                                    +{Array.from(new Set([
                                                        ...(Array.isArray(teacher.specialties) ? teacher.specialties : []),
                                                        ...(Array.isArray(teacher.instruments) ? teacher.instruments : [])
                                                    ])).length - 3}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className="text-sm font-black text-gray-900">{teacher.students_count || 0}</span>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className="text-sm font-black text-gray-900">
                                            {teacher.hourly_rate ? `$${teacher.hourly_rate}` : '-'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                         <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                            teacher.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-gray-50 text-gray-400 border-gray-100'
                                         }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${teacher.is_active ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-gray-300'}`} />
                                            {teacher.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleOpenEdit(teacher)}
                                            className="text-gray-300 hover:text-primary rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            <Dialog
                open={isEditModalOpen}
                onOpenChange={setIsEditModalOpen}
                size="lg"
            >
                <DialogHeader title="Faculty Profile Enhancement" />
                <DialogContent>
                    <form id="edit-faculty-form" onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Public First Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.first_name}
                                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-gray-50 border-transparent focus:bg-white border-2 focus:border-primary rounded-2xl font-bold text-gray-700 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Public Last Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.last_name}
                                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-gray-50 border-transparent focus:bg-white border-2 focus:border-primary rounded-2xl font-bold text-gray-700 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Faculty Email Communication</label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-5 py-3.5 bg-gray-50 border-transparent focus:bg-white border-2 focus:border-primary rounded-2xl font-bold text-gray-700 outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-4 p-8 bg-primary/5 rounded-3xl border border-primary/10">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Award className="w-4 h-4" />
                                    Pedagogical Specializations
                                </label>
                                <span className="text-[10px] font-black text-gray-400">{formData.specialties.length} Total</span>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                                {formData.specialties.map((spec) => (
                                    <span key={spec} className="inline-flex items-center gap-2 px-4 py-2 bg-white text-primary rounded-xl text-[10px] font-black uppercase tracking-widest border border-primary/10 shadow-sm hover:border-primary/30 transition-all">
                                        {spec}
                                        <button
                                            type="button"
                                            onClick={() => setFormData({
                                                ...formData,
                                                specialties: formData.specialties.filter(i => i !== spec)
                                            })}
                                            className="hover:text-red-500 transition-colors"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </span>
                                ))}
                                {formData.specialties.length === 0 && (
                                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest py-2">No credentials listed</p>
                                )}
                            </div>
                            
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={newInstrument}
                                    onChange={(e) => setNewInstrument(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            const trimmed = newInstrument.trim();
                                            if (!trimmed) return;
                                            const formatted = trimmed.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
                                            if (formData.specialties.some(s => s.toLowerCase() === formatted.toLowerCase())) {
                                                toast.error('Specialty already exists');
                                                return;
                                            }
                                            setFormData({ ...formData, specialties: [...formData.specialties, formatted] });
                                            setNewInstrument('');
                                        }
                                    }}
                                    placeholder="Add skill (e.g. Masterclass Performance)"
                                    className="flex-1 px-5 py-3.5 bg-white border-transparent focus:border-primary border-2 rounded-2xl font-bold text-sm text-gray-700 outline-none transition-all shadow-sm"
                                />
                                <Button
                                    type="button"
                                    onClick={() => {
                                         const trimmed = newInstrument.trim();
                                         if (!trimmed) return;
                                         const formatted = trimmed.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
                                         if (formData.specialties.some(s => s.toLowerCase() === formatted.toLowerCase())) {
                                             toast.error('Specialty already exists');
                                             return;
                                         }
                                         setFormData({ ...formData, specialties: [...formData.specialties, formatted] });
                                         setNewInstrument('');
                                    }}
                                >
                                    Add
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <DollarSign className="w-3 h-3 text-emerald-500" />
                                    Hourly Compensation
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.hourly_rate}
                                    onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-gray-50 border-transparent focus:bg-white border-2 focus:border-primary rounded-2xl font-bold text-gray-700 outline-none transition-all"
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Teaching Status</label>
                                <div 
                                    onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                                    className={`flex items-center justify-between px-5 py-3.5 rounded-2xl border-2 transition-all cursor-pointer h-[54px] ${
                                        formData.is_active ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'
                                    }`}
                                >
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${formData.is_active ? 'text-emerald-600' : 'text-gray-400'}`}>
                                        {formData.is_active ? 'Authorized Faculty' : 'Inactive'}
                                    </span>
                                    <div className={`w-10 h-6 rounded-full p-1 transition-colors ${formData.is_active ? 'bg-emerald-500' : 'bg-gray-400'}`}>
                                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${formData.is_active ? 'translate-x-4' : 'translate-x-0'}`} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </DialogContent>
                <DialogFooter>
                    <Button
                        variant="ghost"
                        onClick={() => setIsEditModalOpen(false)}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        form="edit-faculty-form"
                        disabled={isSubmitting}
                        className="flex-[2] gap-2 active:scale-95 transition-transform"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Committing...
                            </>
                        ) : (
                            'Execute Profile Update'
                        )}
                    </Button>
                </DialogFooter>
            </Dialog>
        </div>
    )
}
