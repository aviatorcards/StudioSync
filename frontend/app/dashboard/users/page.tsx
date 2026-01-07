'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { useUsers, useTeachers } from '@/hooks/useDashboardData'
import api from '@/services/api'
import { toast } from 'react-hot-toast'
import {
    X, Loader2, UserPlus, Music, Link as LinkIcon, Edit, UserCog, Trash2,
    Search, ChevronLeft, ChevronRight, Users as UsersIcon, Mail, Shield
} from 'lucide-react'
import Modal from '@/components/Modal'
import { Button } from '@/components/ui/button'

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
                    if (formData.band_ids.length > 0) {
                        for (const bId of formData.band_ids) {
                            await api.post(`/core/users/${updatedUser.id}/assign_to_band/`, { band_id: bId })
                        }
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
            admin: 'bg-purple-50 text-purple-700 border-purple-200',
            teacher: 'bg-blue-50 text-blue-700 border-blue-200',
            student: 'bg-green-50 text-green-700 border-green-200',
            parent: 'bg-orange-50 text-orange-700 border-orange-200',
        }
        return (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${styles[role] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                {role === 'teacher' ? 'Instructor' : role.charAt(0).toUpperCase() + role.slice(1)}
            </span>
        )
    }

    const PAGE_SIZE = 20
    const totalPages = Math.ceil((meta?.count || 0) / PAGE_SIZE)
    const hasNext = !!meta?.next
    const hasPrevious = !!meta?.previous

    if (loading && users.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-[var(--color-primary)] animate-spin mb-4" />
                <p className="text-gray-500 font-medium">Loading users...</p>
            </div>
        )
    }

    return (
        <>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-4xl font-bold text-gray-900">Users</h1>
                        <p className="text-sm text-gray-600 mt-1">Manage system users and roles</p>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#2C3E50] text-white rounded-lg hover:bg-[#34495E] transition-colors font-medium shadow-sm"
                    >
                        <UserPlus className="w-5 h-5" />
                        <span>Add User</span>
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-600 uppercase">Total Users</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{meta?.count || 0}</p>
                            </div>
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <UsersIcon className="w-5 h-5 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-600 uppercase">Students</p>
                                <p className="text-2xl font-bold text-green-600 mt-1">
                                    {users.filter((u: any) => u.role === 'student').length}
                                </p>
                            </div>
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <UserCog className="w-5 h-5 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-600 uppercase">Instructors</p>
                                <p className="text-2xl font-bold text-blue-600 mt-1">
                                    {users.filter((u: any) => u.role === 'teacher').length}
                                </p>
                            </div>
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Music className="w-5 h-5 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-600 uppercase">Active</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {users.filter((u: any) => u.is_active).length}
                                </p>
                            </div>
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
                    {/* Role Filter Tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2">
                        {[
                            { value: 'all', label: 'All Users' },
                            { value: 'student', label: 'Students' },
                            { value: 'teacher', label: 'Instructors' },
                            { value: 'parent', label: 'Parents' },
                            { value: 'admin', label: 'Admins' }
                        ].map(({ value, label }) => (
                            <button
                                key={value}
                                onClick={() => setFilterRole(value)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filterRole === value
                                        ? 'bg-gray-900 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-dark focus:border-transparent outline-none"
                        />
                    </div>
                </div>

                {/* Users List */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {users.length > 0 ? users.map((user: any) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-700 font-bold overflow-hidden">
                                                    {user.avatar ? (
                                                        <img src={user.avatar} alt={user.full_name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        (user.first_name || user.email)[0].toUpperCase()
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-semibold text-gray-900 truncate">
                                                        {user.full_name || `${user.first_name} ${user.last_name}`}
                                                    </div>
                                                    <div className="text-sm text-gray-500 truncate">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getRoleBadge(user.role)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.role === 'student' && user.student_profile?.bands?.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {user.student_profile.bands.slice(0, 2).map((b: any) => (
                                                        <span key={b.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-teal-50 text-teal-700 border border-teal-100">
                                                            <Music className="w-3 h-3 mr-1" />
                                                            {b.name}
                                                        </span>
                                                    ))}
                                                    {user.student_profile.bands.length > 2 && (
                                                        <span className="text-xs text-gray-500">+{user.student_profile.bands.length - 2}</span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-400">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                                                {user.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(user)}
                                                    className="p-2 text-gray-400 hover:text-[#2C3E50] hover:bg-gray-100 rounded-lg transition-colors"
                                                    title="Edit User"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                {user.id !== currentUser?.id && (
                                                    <button
                                                        onClick={() => handleDeleteUser(user.id, user.full_name || `${user.first_name} ${user.last_name}`)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete User"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <UserCog className="w-12 h-12 text-gray-300" />
                                                <p className="text-gray-500 font-medium">No users found</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile List View (Compact) */}
                    <div className="md:hidden space-y-0 bg-white rounded-xl border border-gray-100 shadow-md overflow-hidden">
                        {users.length > 0 ? users.map((user: any) => {
                            // Determine border color based on role
                            const getRoleColor = (role: string) => {
                                const colors: Record<string, string> = {
                                    admin: '#A855F7',      // purple
                                    teacher: '#3B82F6',    // blue
                                    student: '#10B981',    // green
                                    parent: '#F97316',     // orange
                                }
                                return colors[role] || '#6B7280' // gray fallback
                            }

                            return (
                                <div
                                    key={user.id}
                                    className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
                                    style={{ borderLeftWidth: '3px', borderLeftColor: getRoleColor(user.role) }}
                                >
                                    {/* Avatar */}
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xs shadow-sm flex-shrink-0">
                                        {user.avatar ? (
                                            <img src={user.avatar} alt={user.full_name} className="w-full h-full object-cover rounded-full" />
                                        ) : (
                                            (user.first_name?.[0] || user.email?.[0] || '?').toUpperCase()
                                        )}
                                    </div>

                                    {/* Main Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <h3 className="text-sm font-bold text-gray-900 truncate">
                                                {user.full_name || `${user.first_name} ${user.last_name}`}
                                            </h3>
                                            {getRoleBadge(user.role)}
                                        </div>
                                        <div className="flex items-center gap-3 text-[10px] text-gray-500 font-medium">
                                            <span className="inline-flex items-center gap-1 truncate">
                                                <Mail className="w-2.5 h-2.5 flex-shrink-0" />
                                                <span className="truncate">{user.email}</span>
                                            </span>
                                            <span className={`inline-flex items-center gap-1 flex-shrink-0 ${user.is_active ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                                                {user.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <button
                                        onClick={() => handleOpenModal(user)}
                                        className="text-gray-400 hover:text-primary h-8 w-8 flex items-center justify-center flex-shrink-0 transition-colors"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            )
                        }) : (
                            <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                                <UserCog className="w-10 h-10 text-gray-200" />
                                <p className="text-gray-400 text-sm font-bold">No users found</p>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                Showing {users.length} of {meta?.count || 0} users
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={!hasPrevious}
                                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <div className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-sm">
                                    {page} / {totalPages}
                                </div>
                                <button
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={!hasNext}
                                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* User Modal */}
            {isUserModalOpen && (
                <Modal
                    isOpen={isUserModalOpen}
                    onClose={() => setIsUserModalOpen(false)}
                    title={selectedUser ? 'Edit User' : 'New User'}
                    footer={
                        <>
                            <Button
                                variant="outline"
                                onClick={() => setIsUserModalOpen(false)}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="flex-1 gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    selectedUser ? 'Update User' : 'Create User'
                                )}
                            </Button>
                        </>
                    }
                >
                    <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Basic Info */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.first_name}
                                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-dark focus:border-transparent outline-none"
                                        placeholder="Jane"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.last_name}
                                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-dark focus:border-transparent outline-none"
                                        placeholder="Smith"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    disabled={!!selectedUser}
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-dark focus:border-transparent outline-none disabled:bg-gray-100"
                                    placeholder="jane.smith@example.com"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-dark focus:border-transparent outline-none"
                                    >
                                        <option value="student">Student</option>
                                        <option value="teacher">Instructor</option>
                                        <option value="parent">Parent</option>
                                        <option value="admin">Administrator</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <div className="flex items-center h-[42px] px-3 bg-gray-50 rounded-lg">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.is_active}
                                                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                        </label>
                                        <span className="ml-3 text-sm font-medium text-gray-700">
                                            {formData.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Student Fields */}
                            {formData.role === 'student' && (
                                <div className="p-4 bg-green-50 rounded-lg border border-green-100 space-y-4">
                                    <h3 className="text-sm font-bold text-green-900">Student Details</h3>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Instrument</label>
                                        <select
                                            value={formData.instrument}
                                            onChange={(e) => setFormData({ ...formData, instrument: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                        >
                                            <option value="">Select instrument...</option>
                                            {allInstruments.map(inst => (
                                                <option key={inst} value={inst}>{inst}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Bands (Hold Ctrl/Cmd for multiple)</label>
                                        <select
                                            multiple
                                            value={formData.band_ids}
                                            onChange={(e) => {
                                                const values = Array.from(e.target.selectedOptions, option => option.value)
                                                setFormData({ ...formData, band_ids: values })
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none min-h-[100px]"
                                        >
                                            {bands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Parent/Guardian</label>
                                        <select
                                            value={formData.family_id}
                                            onChange={(e) => setFormData({ ...formData, family_id: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                        >
                                            <option value="">No linked parent</option>
                                            {parentOptions.map((p: any) => <option key={p.id} value={p.id}>{p.full_name || p.email}</option>)}
                                        </select>
                                    </div>
                                </div>
                            )}

                            {/* Teacher Fields */}
                            {formData.role === 'teacher' && (
                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 space-y-4">
                                    <h3 className="text-sm font-bold text-blue-900">Instructor Specialties</h3>

                                    <div className="flex flex-wrap gap-2">
                                        {formData.specialties.map(spec => (
                                            <span key={spec} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium flex items-center gap-1">
                                                {spec}
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, specialties: formData.specialties.filter(s => s !== spec) })}
                                                    className="hover:text-blue-900"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newSpecialty}
                                            onChange={(e) => setNewSpecialty(e.target.value)}
                                            onKeyPress={(e) => {
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
                                            placeholder="e.g. Jazz Piano"
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                        <button
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
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>
                            )}

                    </form>
                </Modal>
            )}
        </>
    )
}
