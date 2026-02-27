'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { useUsers, useTeachers } from '@/hooks/useDashboardData'
import api from '@/services/api'
import { toast } from 'react-hot-toast'
import {
    X, Loader2, UserPlus, Music, Link as LinkIcon, Edit, UserCog, Trash2,
    Search, ChevronLeft, ChevronRight, Users as UsersIcon, Mail, Shield,
    User, CheckCircle2, AlertCircle, Sparkles, Filter
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogHeader, DialogContent, DialogFooter } from '@/components/ui/dialog'

export default function UsersPage() {
    const { currentUser } = useUser()
    const { teachers } = useTeachers()
    const [bands, setBands] = useState<any[]>([])
    const router = useRouter()

    // Modal state
    const [isUserModalOpen, setIsUserModalOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<any>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [formData, setFormData] = useState({
        email: '',
        first_name: '',
        last_name: '',
        role: 'student',
        is_active: true,
        band_ids: [] as string[],
        family_id: '',
        specialties: [] as string[],
        instrument: ''
    })

    const [newSpecialty, setNewSpecialty] = useState('')

    // Filter state
    const [filterRole, setFilterRole] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [page, setPage] = useState(1)

    // Reset page on filter change
    useEffect(() => {
        setPage(1)
    }, [filterRole, searchQuery])

    // Derived: all unique specialties from all teachers
    const allInstruments = Array.from(new Set(
        teachers.flatMap((t: any) => t.specialties || [])
    )).sort()

    useEffect(() => {
        const fetchBands = async () => {
            try {
                const res = await api.get('/core/bands/')
                setBands(res.data.results || (Array.isArray(res.data) ? res.data : []))
            } catch (err) {
                console.error(err)
            }
        }
        fetchBands()
    }, [])

    // Main Users Data (Paginated)
    const { users, meta, loading, refresh } = useUsers({
        page,
        role: filterRole !== 'all' ? filterRole : undefined,
        search: searchQuery
    })

    // Fetch Parents separate for Dropdown
    const { users: parentOptions } = useUsers({ role: 'parent' })

    const handleOpenModal = (user: any = null) => {
        if (user) {
            setSelectedUser(user)
            setFormData({
                email: user.email,
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                role: user.role,
                is_active: user.is_active,
                band_ids: user.student_profile?.bands?.map((b: any) => b.id) || [],
                family_id: user.student_profile?.family_id || '',
                specialties: user.teacher_profile?.specialties || [],
                instrument: user.student_profile?.instrument || ''
            })
        } else {
            setSelectedUser(null)
            setFormData({
                email: '',
                first_name: '',
                last_name: '',
                role: 'student',
                is_active: true,
                band_ids: [],
                family_id: '',
                specialties: [],
                instrument: ''
            })
        }
        setIsUserModalOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            if (selectedUser) {
                const { data: updatedUser } = await api.patch(`/core/users/${selectedUser.id}/`, {
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    role: formData.role,
                    is_active: formData.is_active
                })

                if (formData.role === 'student' || updatedUser.role === 'student') {
                    const originalBandIds = selectedUser.student_profile?.bands?.map((b: any) => b.id) || []
                    const currentBandIds = formData.band_ids || []
                    
                    const toAdd = currentBandIds.filter(id => !originalBandIds.includes(id))
                    const toRemove = originalBandIds.filter((id: string) => !currentBandIds.includes(id))

                    for (const bId of toAdd) {
                        await api.post(`/core/users/${updatedUser.id}/assign_to_band/`, { band_id: bId })
                    }
                    for (const bId of toRemove) {
                        await api.post(`/core/users/${updatedUser.id}/remove_from_band/`, { band_id: bId })
                    }

                    if (formData.family_id) {
                        await api.post(`/core/users/${updatedUser.id}/link_family/`, { parent_id: formData.family_id })
                    }

                    if (formData.instrument && updatedUser.student_profile?.id) {
                        await api.patch(`/core/students/${updatedUser.student_profile.id}/`, {
                            instrument: formData.instrument
                        })
                    }
                }

                if (formData.role === 'teacher' && updatedUser.teacher_profile?.id) {
                    await api.patch(`/core/teachers/${updatedUser.teacher_profile.id}/`, {
                        specialties: formData.specialties
                    })
                }

                toast.success('User updated successfully!')
            } else {
                await api.post('/core/users/', formData)
                toast.success('User created successfully!')
            }
            setIsUserModalOpen(false)
            if (refresh) refresh()
        } catch (error: any) {
            console.error('Failed to save user:', error)
            toast.error(error.response?.data?.detail || 'Failed to save user')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteUser = async (userId: string, userName: string) => {
        if (userId === currentUser?.id) {
            toast.error("You cannot delete your own account!")
            return
        }

        if (!confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
            return
        }

        try {
            await api.delete(`/core/users/${userId}/`)
            toast.success(`${userName} has been deleted successfully`)
            if (refresh) refresh()
        } catch (error: any) {
            console.error('Failed to delete user:', error)
            toast.error(error.response?.data?.detail || 'Failed to delete user')
        }
    }

    const getRoleBadge = (role: string) => {
        const styles: Record<string, string> = {
            admin: 'bg-purple-50 text-purple-600 border-purple-100',
            teacher: 'bg-blue-50 text-blue-600 border-blue-100',
            student: 'bg-green-50 text-green-600 border-green-100',
            parent: 'bg-orange-50 text-orange-600 border-orange-100',
        }
        return (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[role] || 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                {role === 'teacher' ? 'Instructor' : role}
            </span>
        )
    }

    const PAGE_SIZE = 20
    const totalPages = Math.ceil((meta?.count || 0) / PAGE_SIZE)
    const hasNext = !!meta?.next
    const hasPrevious = !!meta?.previous

    if (loading && users.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-in fade-in duration-500">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Accessing Directory...</p>
            </div>
        )
    }

    return (
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4">
                <div className="space-y-2">
                    <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        Users
                        <div className="bg-primary/10 px-3 py-1 rounded-full text-xs font-black text-primary uppercase tracking-widest">
                            {meta?.count || 0} Total
                        </div>
                    </h1>
                    <p className="text-gray-500 font-medium max-w-lg">Manage the studio community, verify credentials, and orchestrate roles.</p>
                </div>
                <Button
                    onClick={() => handleOpenModal()}
                    className="gap-2 hover:scale-105 shadow-lg shadow-gray-200"
                >
                    <UserPlus className="w-4 h-4" />
                    Onboard User
                </Button>
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Accounts', value: meta?.count || 0, icon: UsersIcon, color: 'blue' },
                    { label: 'Active Students', value: users.filter((u: any) => u.role === 'student' && u.is_active).length, icon: UserCog, color: 'green' },
                    { label: 'Faculty', value: users.filter((u: any) => u.role === 'teacher').length, icon: Music, color: 'purple' },
                    { label: 'System Health', value: '100%', icon: Shield, color: 'teal' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-10 h-10 bg-${stat.color}-50 rounded-xl flex items-center justify-center text-${stat.color}-600 group-hover:scale-110 transition-transform`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            {i === 3 && <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-sm shadow-green-200" />}
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight uppercase tracking-tighter">{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-3xl border border-gray-100 shadow-xl">
                 <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search directory..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-transparent focus:bg-white border-2 focus:border-primary rounded-2xl font-bold text-sm text-gray-700 outline-none transition-all"
                    />
                </div>
                <div className="flex p-1 bg-gray-50 rounded-2xl border border-gray-100 overflow-x-auto w-full md:w-auto no-scrollbar">
                    {[
                        { value: 'all', label: 'All Users' },
                        { value: 'student', label: 'Students' },
                        { value: 'teacher', label: 'Faculty' },
                        { value: 'parent', label: 'Parents' },
                        { value: 'admin', label: 'Admins' }
                    ].map(({ value, label }) => (
                        <button
                            key={value}
                            onClick={() => setFilterRole(value)}
                            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                filterRole === value
                                    ? 'bg-white text-primary shadow-sm'
                                    : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid/Table View */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-2xl overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full border-separate border-spacing-0">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Identity</th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Classification</th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Profile Insight</th>
                                <th className="px-6 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">System Access</th>
                                <th className="px-6 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {users.map((user: any) => (
                                <tr key={user.id} className="group hover:bg-gray-50/30 transition-all">
                                    <td className="px-6 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-900 font-black text-sm border-2 border-white shadow-sm overflow-hidden group-hover:scale-105 transition-transform">
                                                {user.avatar ? (
                                                    <img src={user.avatar} alt={user.full_name} className="w-full h-full object-cover" />
                                                ) : (
                                                    (user.first_name || user.email)[0].toUpperCase()
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-black text-gray-900 uppercase tracking-tighter leading-tight">
                                                    {user.full_name || `${user.first_name} ${user.last_name}`}
                                                </span>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{user.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        {getRoleBadge(user.role)}
                                    </td>
                                    <td className="px-6 py-6">
                                        {user.role === 'student' && user.student_profile?.bands?.length > 0 ? (
                                            <div className="flex flex-wrap gap-1.5">
                                                {user.student_profile.bands.slice(0, 2).map((b: any) => (
                                                    <span key={b.id} className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-primary/5 text-primary border border-primary/10">
                                                        <Music className="w-3 h-3 mr-1" />
                                                        {b.name}
                                                    </span>
                                                ))}
                                                {user.student_profile.bands.length > 2 && (
                                                    <span className="text-[10px] font-black text-gray-400">+{user.student_profile.bands.length - 2}</span>
                                                )}
                                            </div>
                                        ) : user.role === 'teacher' && user.teacher_profile?.specialties?.length > 0 ? (
                                            <div className="flex flex-wrap gap-1.5">
                                                {user.teacher_profile.specialties.slice(0, 2).map((s: string) => (
                                                    <span key={s} className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-purple-50 text-purple-600 border border-purple-100">
                                                        <Sparkles className="w-3 h-3 mr-1" />
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Member</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-6 text-center">
                                         <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                            user.is_active ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
                                         }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-red-500'}`} />
                                            {user.is_active ? 'Authorized' : 'Suspended'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2 opactiy-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleOpenModal(user)}
                                                className="text-gray-400 hover:text-primary rounded-xl"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            {user.id !== currentUser?.id && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeleteUser(user.id, user.full_name || `${user.first_name} ${user.last_name}`)}
                                                    className="text-gray-400 hover:text-red-500 rounded-xl"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-6 bg-gray-50/30 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-gray-50">
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Exhibiting <span className="text-gray-900">{users.length}</span> of <span className="text-gray-900">{meta?.count || 0}</span> studio members
                    </div>
                    <div className="flex items-center gap-3">
                         <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={!hasPrevious}
                            className="rounded-xl"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                        <div className="px-6 py-2 bg-white border border-gray-100 rounded-2xl text-xs font-black text-gray-700 shadow-sm">
                            {page} / {totalPages}
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setPage(p => p + 1)}
                            disabled={!hasNext}
                            className="rounded-xl"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* User Modal */}
            <Dialog
                open={isUserModalOpen}
                onOpenChange={setIsUserModalOpen}
                size="lg"
            >
                <DialogHeader title={selectedUser ? 'Edit System Member' : 'Onboard New Member'} />
                <DialogContent>
                    <form id="user-onboarding-form" onSubmit={handleSubmit} className="space-y-8">
                            {/* Basic Info */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Legal First Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.first_name}
                                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                        className="w-full px-5 py-3.5 bg-gray-50 border-transparent focus:bg-white border-2 focus:border-primary rounded-2xl font-bold text-gray-700 outline-none transition-all"
                                        placeholder="Jane"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Legal Last Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.last_name}
                                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                        className="w-full px-5 py-3.5 bg-gray-50 border-transparent focus:bg-white border-2 focus:border-primary rounded-2xl font-bold text-gray-700 outline-none transition-all"
                                        placeholder="Smith"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Official Email Address</label>
                                <input
                                    type="email"
                                    required
                                    disabled={!!selectedUser}
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-gray-50 border-transparent focus:bg-white border-2 focus:border-primary rounded-2xl font-bold text-gray-700 outline-none transition-all disabled:opacity-50"
                                    placeholder="jane.smith@example.com"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">System Role</label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full px-5 py-3.5 bg-gray-50 border-transparent focus:bg-white border-2 focus:border-primary rounded-2xl font-bold text-gray-700 outline-none transition-all appearance-none"
                                    >
                                        <option value="student">Student</option>
                                        <option value="teacher">Instructor</option>
                                        <option value="parent">Parent</option>
                                        <option value="admin">Administrator</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Account Status</label>
                                    <div 
                                        onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                                        className={`flex items-center justify-between px-5 py-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                                            formData.is_active ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                                        }`}
                                    >
                                        <span className={`text-sm font-black uppercase tracking-widest ${formData.is_active ? 'text-green-600' : 'text-red-600'}`}>
                                            {formData.is_active ? 'Authorized' : 'Suspended'}
                                        </span>
                                        <div className={`w-10 h-6 rounded-full p-1 transition-colors ${formData.is_active ? 'bg-green-500' : 'bg-red-400'}`}>
                                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${formData.is_active ? 'translate-x-4' : 'translate-x-0'}`} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Student Fields */}
                            {formData.role === 'student' && (
                                <div className="p-8 bg-green-50/50 rounded-3xl border border-green-100 space-y-6 animate-in slide-in-from-top-2">
                                    <h3 className="text-xs font-black text-green-700 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <UserCog className="w-4 h-4" />
                                        Student Configuration
                                    </h3>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Primary Instrument</label>
                                        <select
                                            value={formData.instrument}
                                            onChange={(e) => setFormData({ ...formData, instrument: e.target.value })}
                                            className="w-full px-5 py-3.5 bg-white border-transparent focus:border-green-400 border-2 rounded-2xl font-bold text-gray-700 outline-none transition-all appearance-none"
                                        >
                                            <option value="">Select instrument...</option>
                                            {allInstruments.map(inst => (
                                                <option key={inst} value={inst}>{inst}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Band Affiliations</label>
                                        <select
                                            multiple
                                            value={formData.band_ids}
                                            onChange={(e) => {
                                                const values = Array.from(e.target.selectedOptions, option => option.value)
                                                setFormData({ ...formData, band_ids: values })
                                            }}
                                            className="w-full px-5 py-3.5 bg-white border-transparent focus:border-green-400 border-2 rounded-2xl font-bold text-sm text-gray-700 outline-none transition-all min-h-[120px] custom-scrollbar"
                                        >
                                            {bands.map(b => <option key={b.id} value={b.id} className="py-2">{b.name}</option>)}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Legal Guardian / Parent</label>
                                        <select
                                            value={formData.family_id}
                                            onChange={(e) => setFormData({ ...formData, family_id: e.target.value })}
                                            className="w-full px-5 py-3.5 bg-white border-transparent focus:border-green-400 border-2 rounded-2xl font-bold text-gray-700 outline-none transition-all appearance-none"
                                        >
                                            <option value="">No linked guardian</option>
                                            {parentOptions.map((p: any) => <option key={p.id} value={p.id}>{p.full_name || p.email}</option>)}
                                        </select>
                                    </div>
                                </div>
                            )}

                            {/* Teacher Fields */}
                            {formData.role === 'teacher' && (
                                <div className="p-8 bg-blue-50/50 rounded-3xl border border-blue-100 space-y-6 animate-in slide-in-from-top-2">
                                     <h3 className="text-xs font-black text-blue-700 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Sparkles className="w-4 h-4" />
                                        Instructor Credentials
                                    </h3>

                                    <div className="flex flex-wrap gap-2">
                                        {formData.specialties.map(spec => (
                                            <span key={spec} className="px-4 py-2 bg-white border border-blue-100 shadow-sm text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-blue-50 transition-colors">
                                                {spec}
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, specialties: formData.specialties.filter(s => s !== spec) })}
                                                    className="hover:text-red-500 transition-colors"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            value={newSpecialty}
                                            onChange={(e) => setNewSpecialty(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault()
                                                    const trimmed = newSpecialty.trim()
                                                    if (!trimmed) return
                                                    const formatted = trimmed.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())
                                                    if (!formData.specialties.includes(formatted)) {
                                                        setFormData({ ...formData, specialties: [...formData.specialties, formatted] })
                                                        setNewSpecialty('')
                                                    }
                                                }
                                            }}
                                            placeholder="Add expertise (e.g. Neo-Soul Rhythm)"
                                            className="flex-1 px-5 py-3.5 bg-white border-transparent focus:border-blue-400 border-2 rounded-2xl font-bold text-sm text-gray-700 outline-none transition-all shadow-sm"
                                        />
                                        <Button
                                            type="button"
                                            onClick={() => {
                                                const trimmed = newSpecialty.trim()
                                                if (!trimmed) return
                                                const formatted = trimmed.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())
                                                if (!formData.specialties.includes(formatted)) {
                                                    setFormData({ ...formData, specialties: [...formData.specialties, formatted] })
                                                    setNewSpecialty('')
                                                }
                                            }}
                                        >
                                            Add
                                        </Button>
                                    </div>
                                </div>
                            )}

                    </form>
                </DialogContent>
                <DialogFooter>
                    <Button
                        variant="ghost"
                        onClick={() => setIsUserModalOpen(false)}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        form="user-onboarding-form"
                        disabled={isSubmitting}
                        className="flex-[2] gap-2 active:scale-95 transition-transform"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Synchronizing...
                            </>
                        ) : (
                            selectedUser ? 'Commit Changes' : 'Activate Membership'
                        )}
                    </Button>
                </DialogFooter>
            </Dialog>
        </div>
    )
}
