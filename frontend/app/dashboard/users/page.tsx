'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { useUsers, useTeachers } from '@/hooks/useDashboardData'
import api from '@/services/api'
import { toast } from 'react-hot-toast'
import { X, Loader2, UserPlus, Music, Link as LinkIcon, Edit, UserCog, Trash2 } from 'lucide-react'

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
        // Profile specific
        band_ids: [] as string[],
        family_id: '',
        specialties: [] as string[],
        instrument: ''
    })

    const [newSpecialty, setNewSpecialty] = useState('')

    // Close on Escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsUserModalOpen(false)
        }
        if (isUserModalOpen) {
            window.addEventListener('keydown', handleEscape)
            return () => window.removeEventListener('keydown', handleEscape)
        }
    }, [isUserModalOpen])

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
                // Update User info
                const { data: updatedUser } = await api.patch(`/core/users/${selectedUser.id}/`, {
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    role: formData.role,
                    is_active: formData.is_active
                })

                // If student, update related data
                if (formData.role === 'student' || updatedUser.role === 'student') {
                    // Note: In a real app, you'd wrap these in a single transaction or batch endpoint

                    // Bands: Clear and re-assign (simplification for this demo)
                    // Currently we only have assign_to_band. Let's just use what we have.
                    if (formData.band_ids.length > 0) {
                        // For this demo, we'll just assign the first one or logic for multiple if backend supports it
                        // Since we have parallel assignments, we'll just do it for the selected ones
                        for (const bId of formData.band_ids) {
                            await api.post(`/core/users/${updatedUser.id}/assign_to_band/`, { band_id: bId })
                        }
                    }

                    // Family link
                    if (formData.family_id) {
                        await api.post(`/core/users/${updatedUser.id}/link_family/`, { parent_id: formData.family_id })
                    }

                    // Instrument
                    if (formData.instrument && updatedUser.student_profile?.id) {
                        await api.patch(`/core/students/${updatedUser.student_profile.id}/`, {
                            instrument: formData.instrument
                        })
                    }
                }

                // If teacher, update specialties
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
        // Prevent deleting yourself
        if (userId === currentUser?.id) {
            toast.error("You cannot delete your own account!")
            return
        }

        // Confirm deletion
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

    // Filter state
    const [filterRole, setFilterRole] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [page, setPage] = useState(1)

    // Reset page on filter change
    useEffect(() => {
        setPage(1)
    }, [filterRole, searchQuery])

    // Main Users Data (Paginated)
    const { users, meta, loading, refresh } = useUsers({
        page,
        role: filterRole !== 'all' ? filterRole : undefined,
        search: searchQuery
    })

    // Fetch Parents separate for Dropdown (limited to page 1 for now, but focused)
    const { users: parentOptions } = useUsers({ role: 'parent' })

    const getRoleBadge = (role: string) => {
        const styles: Record<string, string> = {
            admin: 'bg-purple-100 text-purple-800',
            teacher: 'bg-blue-100 text-blue-800 border-blue-200',
            student: 'bg-green-100 text-green-800 border-green-200',
            parent: 'bg-orange-100 text-orange-800 border-orange-200',
        }
        return (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[role] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                {role === 'teacher' ? 'instructor' : role}
            </span>
        )
    }

    // Pagination helpers
    const PAGE_SIZE = 20
    const totalPages = Math.ceil((meta?.count || 0) / PAGE_SIZE)
    const hasNext = !!meta?.next
    const hasPrevious = !!meta?.previous

    if (loading && users.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                <p className="text-gray-500 font-medium">Loading users...</p>
            </div>
        )
    }

    return (
        <>
            <div className="max-w-7xl mx-auto px-4 pb-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Users</h1>
                        <p className="text-lg text-gray-500 mt-2">Manage all system users, roles, and profiles.</p>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-[#2C3E50] text-white rounded-xl hover:bg-[#34495E] transition-all hover:scale-105 shadow-lg active:scale-95 font-bold"
                    >
                        <UserPlus className="w-5 h-5" />
                        <span>Add New User</span>
                    </button>
                </div>

                {/* Main Content Card */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="p-6 bg-gray-50/50 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-white border rounded-xl shadow-sm">
                                <select
                                    value={filterRole}
                                    onChange={(e) => setFilterRole(e.target.value)}
                                    className="bg-transparent border-none text-sm font-semibold text-gray-700 focus:ring-0 cursor-pointer"
                                >
                                    <option value="all">All Roles</option>
                                    <option value="student">Students</option>
                                    <option value="teacher">Instructors</option>
                                    <option value="parent">Parents</option>
                                    <option value="admin">Administrators</option>
                                </select>
                            </div>
                        </div>
                        <div className="relative w-full md:w-96">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-white border-b border-gray-100">
                                    <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">User Details</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Role</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Membership & Family</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 border-b border-gray-50">
                                {users.length > 0 ? users.map((user: any) => (
                                    <tr key={user.id} className="hover:bg-gray-50/80 transition-all group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200 flex items-center justify-center text-gray-700 font-bold overflow-hidden shadow-sm group-hover:shadow-md transition-all group-hover:-translate-y-0.5">
                                                    {user.avatar ? (
                                                        <img src={user.avatar} alt={user.full_name || "User avatar"} className="w-full h-full object-cover" />
                                                    ) : (
                                                        (user.first_name || user.email)[0].toUpperCase()
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="text-base font-bold text-gray-900 leading-tight">
                                                        {user.full_name || `${user.first_name} ${user.last_name}`}
                                                    </div>
                                                    <div className="text-sm text-gray-500 font-medium">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            {getRoleBadge(user.role)}
                                        </td>
                                        <td className="px-8 py-6">
                                            {user.role === 'student' ? (
                                                <div className="space-y-2">
                                                    {user.student_profile?.bands && Array.isArray(user.student_profile.bands) && user.student_profile.bands.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {user.student_profile.bands.map((b: any) => (
                                                                <span key={b.id} className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-100 shadow-sm">
                                                                    <Music className="w-2.5 h-2.5 mr-1" />
                                                                    {b.name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-300 font-semibold italic">Solo Trainee</span>
                                                    )}
                                                    {user.student_profile?.family_id && (
                                                        <div className="flex items-center gap-1.5 p-1 bg-orange-50/50 rounded-lg w-fit border border-orange-100">
                                                            <div className="w-5 h-5 bg-orange-100 rounded-md flex items-center justify-center">
                                                                <LinkIcon className="w-3 h-3 text-orange-600" />
                                                            </div>
                                                            <span className="text-[10px] text-orange-700 font-bold uppercase tracking-tighter">Family Linked</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">—</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full mr-2 ${user.is_active ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                                                {user.is_active ? 'Active' : 'Offline'}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(user)}
                                                    className="p-3 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-2xl transition-all active:scale-90"
                                                    title="Edit User"
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </button>
                                                {user.id !== currentUser?.id && (
                                                    <button
                                                        onClick={() => handleDeleteUser(user.id, user.full_name || `${user.first_name} ${user.last_name}`)}
                                                        className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all active:scale-90"
                                                        title="Delete User"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                                                    <UserCog className="w-8 h-8 text-gray-300" />
                                                </div>
                                                <p className="text-gray-400 font-bold text-lg">No users found matching your criteria</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Footer / Pagination */}
                    <div className="p-8 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                            Displaying {users.length} of {meta?.count || 0} Users
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={!hasPrevious}
                                className="px-4 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <span className="px-4 py-2 text-sm font-bold text-white bg-primary rounded-xl shadow-md cursor-default">
                                {page} / {totalPages || 1}
                            </span>
                            <button
                                onClick={() => setPage(p => p + 1)}
                                disabled={!hasNext}
                                className="px-4 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Comprehensive User Modal */}
            {isUserModalOpen && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-300 antialiased"
                    onClick={() => setIsUserModalOpen(false)}
                >
                    <div
                        className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in slide-in-from-top-4 duration-300 ring-1 ring-black/5 border border-white/20"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-10 py-8 bg-[#2C3E50] text-white flex items-center justify-between ring-1 ring-white/10 shrink-0">
                            <div>
                                <h2 className="text-2xl font-black">{selectedUser ? 'Edit Profile' : 'New User'}</h2>
                                <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mt-0.5">
                                    {selectedUser ? 'Modify credentials & assignments' : 'Grant system access'}
                                </p>
                            </div>
                            <button onClick={() => setIsUserModalOpen(false)} className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Basic Info */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">First Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.first_name}
                                            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary outline-none font-bold text-gray-900 transition-all"
                                            placeholder="Jane"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Last Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.last_name}
                                            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary outline-none font-bold text-gray-900 transition-all"
                                            placeholder="Smith"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        disabled={!!selectedUser}
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary outline-none font-bold text-gray-900 disabled:opacity-50 transition-all"
                                        placeholder="jane.smith@example.com"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">System Role</label>
                                        <select
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary outline-none font-bold text-gray-900 appearance-none bg-no-repeat bg-[right_1rem_center]"
                                            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236B7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundSize: '1.25rem' }}
                                        >
                                            <option value="student">Student</option>
                                            <option value="teacher">Instructor</option>
                                            <option value="parent">Parent</option>
                                            <option value="admin">Administrator</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Account Status</label>
                                        <div className="flex items-center gap-4 px-4 py-3 bg-gray-50 rounded-2xl h-[52px]">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.is_active}
                                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                            </label>
                                            <span className="text-sm font-bold text-gray-700">{formData.is_active ? 'Active' : 'Disabled'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Specific Assignments for Students */}
                                {(formData.role === 'student') && (
                                    <div className="p-6 bg-primary/5 rounded-[2rem] space-y-6 border border-primary/10 animate-in slide-in-from-top-2 duration-500">
                                        <div className="flex items-center gap-2 mb-2">
                                            <UserCog className="w-4 h-4 text-primary" />
                                            <h3 className="text-xs font-black text-primary uppercase tracking-widest">Student Customization</h3>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Primary Instrument</label>
                                                <select
                                                    value={formData.instrument}
                                                    onChange={(e) => setFormData({ ...formData, instrument: e.target.value })}
                                                    className="w-full px-4 py-3 bg-white border-2 border-primary/10 rounded-2xl focus:ring-2 focus:ring-primary outline-none font-bold text-gray-900 appearance-none bg-no-repeat bg-[right_1rem_center]"
                                                    style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236B7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundSize: '1.25rem' }}
                                                >
                                                    <option value="">Select an instrument...</option>
                                                    {allInstruments.map(inst => (
                                                        <option key={inst} value={inst}>{inst}</option>
                                                    ))}
                                                    {/* Fallback if no instruments exist/selected */}
                                                    {!allInstruments.includes(formData.instrument) && formData.instrument && (
                                                        <option value={formData.instrument}>{formData.instrument}</option>
                                                    )}
                                                </select>
                                                <p className="text-[9px] text-gray-400 italic">Available instruments are defined by instructor specialties.</p>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Band Membership</label>
                                                <select
                                                    multiple
                                                    value={formData.band_ids}
                                                    onChange={(e) => {
                                                        const values = Array.from(e.target.selectedOptions, option => option.value)
                                                        setFormData({ ...formData, band_ids: values })
                                                    }}
                                                    className="w-full px-4 py-3 bg-white border-2 border-primary/10 rounded-2xl focus:ring-2 focus:ring-primary outline-none font-bold text-gray-900 min-h-[100px]"
                                                >
                                                    {bands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                                </select>
                                                <p className="text-[9px] text-gray-400 italic">Hold Ctrl/Cmd to select multiple bands</p>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Link Parent/Guardian</label>
                                                <select
                                                    value={formData.family_id}
                                                    onChange={(e) => setFormData({ ...formData, family_id: e.target.value })}
                                                    className="w-full px-4 py-3 bg-white border-2 border-primary/10 rounded-2xl focus:ring-2 focus:ring-primary outline-none font-bold text-gray-900 appearance-none bg-no-repeat bg-[right_1rem_center]"
                                                    style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23E67E22\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundSize: '1.25rem' }}
                                                >
                                                    <option value="">No linked parent</option>
                                                    {parentOptions.map((p: any) => <option key={p.id} value={p.id}>{p.full_name || p.email}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Specific Assignments for Teachers */}
                                {(formData.role === 'teacher') && (
                                    <div className="p-6 bg-blue-50 rounded-[2rem] space-y-6 border border-blue-100 animate-in slide-in-from-top-2 duration-500">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Music className="w-4 h-4 text-blue-600" />
                                            <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest">Instructor Specialties</h3>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex flex-wrap gap-2">
                                                {formData.specialties.map(spec => (
                                                    <span key={spec} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold flex items-center gap-1 group">
                                                        {spec}
                                                        <button
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, specialties: formData.specialties.filter(s => s !== spec) })}
                                                            className="hover:text-blue-900 transition-colors"
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    </span>
                                                ))}
                                                {formData.specialties.length === 0 && (
                                                    <p className="text-[10px] text-gray-400 italic">No specialties added yet.</p>
                                                )}
                                            </div>

                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={newSpecialty}
                                                    onChange={(e) => setNewSpecialty(e.target.value)}
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            const trimmed = newSpecialty.trim();
                                                            if (!trimmed) return;

                                                            // Normalize to Title Case
                                                            const formatted = trimmed.replace(
                                                                /\w\S*/g,
                                                                (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                                                            );

                                                            if (formData.specialties.some(s => s.toLowerCase() === formatted.toLowerCase())) {
                                                                toast.error('This specialty is already listed');
                                                                return;
                                                            }

                                                            setFormData({ ...formData, specialties: [...formData.specialties, formatted] });
                                                            setNewSpecialty('');
                                                        }
                                                    }}
                                                    placeholder="e.g. Jazz Piano"
                                                    className="flex-1 px-4 py-2 bg-white border border-blue-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const trimmed = newSpecialty.trim();
                                                        if (!trimmed) return;

                                                        // Normalize to Title Case
                                                        const formatted = trimmed.replace(
                                                            /\w\S*/g,
                                                            (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                                                        );

                                                        if (formData.specialties.some(s => s.toLowerCase() === formatted.toLowerCase())) {
                                                            toast.error('This specialty is already listed');
                                                            return;
                                                        }

                                                        setFormData({ ...formData, specialties: [...formData.specialties, formatted] });
                                                        setNewSpecialty('');
                                                    }}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-sm"
                                                >
                                                    Add
                                                </button>
                                            </div>
                                            <p className="text-[9px] text-blue-400 italic font-medium">Instruments added here will be available for student enrollment.</p>
                                        </div>
                                    </div>
                                )}

                                <div className="pt-4 flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsUserModalOpen(false)}
                                        className="flex-1 px-8 py-4 border-2 border-gray-100 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all active:scale-95"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-[2] px-8 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all shadow-xl hover:shadow-primary/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                                    >
                                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (selectedUser ? 'Save Changes' : 'Create Account')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

function Users(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    )
}
