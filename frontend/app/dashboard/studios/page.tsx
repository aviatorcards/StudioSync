'use client'

import { useState, useRef } from 'react'
import { useStudios } from '@/hooks/useDashboardData'
import {
    Loader2, Plus, Building2, MapPin, Globe, Phone, Mail, Settings,
    Sparkles, Clock, DollarSign, Calendar, Palette, Camera
} from 'lucide-react'
import api from '@/services/api'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Dialog, DialogHeader, DialogContent, DialogFooter } from '@/components/ui/dialog'
import { useRouter } from 'next/navigation'

export default function StudiosPage() {
    const { studios, loading: studiosLoading, refetch } = useStudios()
    const router = useRouter()
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Determine primary studio
    const activeStudio = studios && studios.length > 0 ? studios[0] : null

    // --- Creation Modal State ---
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        website: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'US',
        currency: 'USD',
        timezone: 'UTC',
        is_active: true
    })

    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !activeStudio) return

        const uploadData = new FormData()
        uploadData.append('cover_image', file)

        const toastId = toast.loading('Uploading cover image...')

        try {
            await api.patch('/core/studios/current/', uploadData)
            toast.success('Cover image updated!', { id: toastId })
            refetch()
        } catch (error: any) {
            console.error('Upload failed:', error)
            toast.error('Failed to upload cover image', { id: toastId })
        }
    }

    // --- Modal Actions (Creation) ---

    const handleOpenCreate = () => {
        const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
        setFormData({
            name: '',
            email: '',
            phone: '',
            website: '',
            address_line1: '',
            address_line2: '',
            city: '',
            state: '',
            postal_code: '',
            country: 'US',
            currency: 'USD',
            timezone: userTimezone,
            is_active: true
        })
        setIsDialogOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            await api.post('/core/studios/', formData)
            toast.success('Studio initialized successfully')
            setIsDialogOpen(false)
            refetch()
        } catch (error: any) {
            console.error('Failed to create studio:', error)
            toast.error(error.response?.data?.detail || 'Initialization failed')
        } finally {
            setIsSubmitting(false)
        }
    }


    // --- Render Logic ---

    if (studiosLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-700">
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                <p className="text-[10px] font-black text-gray-400 tracking-[0.3em] uppercase">Accessing Infrastructure...</p>
            </div>
        )
    }

    // Case 1: No Studio Exists 
    if (!activeStudio) {
        return (
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl p-24 text-center relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:scale-110 transition-transform duration-1000" />
                     <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-50 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl group-hover:scale-110 transition-transform duration-1000" />

                    <div className="flex flex-col items-center gap-8 relative z-10">
                        <div className="w-28 h-28 bg-white rounded-[2.5rem] flex items-center justify-center border-2 border-dashed border-gray-200 shadow-sm">
                            <Building2 className="w-12 h-12 text-gray-300" />
                        </div>
                        <div className="space-y-3">
                            <h2 className="text-4xl font-black text-gray-900 tracking-tight">Setup Your Main Headquarters</h2>
                            <p className="text-gray-500 font-medium max-w-lg mx-auto leading-relaxed">
                                Initialize your primary studio environment to start orchestrating lesson plans, designing layouts, and managing your faculty roster.
                            </p>
                        </div>
                        <Button
                            onClick={handleOpenCreate}
                            className="px-10 py-8 text-sm font-black uppercase tracking-[0.1em] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
                        >
                            <Plus className="w-5 h-5 mr-1" />
                            Initialize Headquarters
                        </Button>
                    </div>
                </div>

                {/* Create Studio Dialog */}
                <Dialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    size="xl"
                >
                    <DialogHeader title="Studio Initialization" />
                    <DialogContent>
                        <form id="studio-creation-form" onSubmit={handleSubmit} className="space-y-10">
                            {/* Basics */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                        <Sparkles className="w-4 h-4" />
                                    </div>
                                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">Core Identity</h3>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Official Studio Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-6 py-4 bg-gray-50 border-transparent border-2 focus:border-primary focus:bg-white rounded-2xl outline-none font-bold text-gray-900 transition-all placeholder:text-gray-300"
                                        placeholder="e.g. Apex Music Conservatoire"
                                    />
                                </div>
                            </div>

                            {/* Contact */}
                            <div className="space-y-6 pt-6 border-t border-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                                        <Globe className="w-4 h-4" />
                                    </div>
                                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">Global Communication</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Administrative Email</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-6 py-4 bg-gray-50 border-transparent border-2 focus:border-primary focus:bg-white rounded-2xl outline-none font-bold text-gray-900 transition-all placeholder:text-gray-300"
                                            placeholder="hq@studio.com"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Primary Phone</label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-6 py-4 bg-gray-50 border-transparent border-2 focus:border-primary focus:bg-white rounded-2xl outline-none font-bold text-gray-900 transition-all placeholder:text-gray-300"
                                            placeholder="+1 (555) 000-0000"
                                        />
                                    </div>
                                    <div className="col-span-full space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Public Domain / Website</label>
                                        <input
                                            type="url"
                                            value={formData.website}
                                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                            className="w-full px-6 py-4 bg-gray-50 border-transparent border-2 focus:border-primary focus:bg-white rounded-2xl outline-none font-bold text-gray-900 transition-all placeholder:text-gray-300"
                                            placeholder="https://apexmusic.com"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Location */}
                            <div className="space-y-6 pt-6 border-t border-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">Physical Location</h3>
                                </div>
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        value={formData.address_line1}
                                        onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                                        className="w-full px-6 py-4 bg-gray-50 border-transparent border-2 focus:border-primary focus:bg-white rounded-2xl outline-none font-bold text-gray-900 transition-all placeholder:text-gray-300"
                                        placeholder="Street Address"
                                    />
                                    <input
                                        type="text"
                                        value={formData.address_line2}
                                        onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                                        className="w-full px-6 py-4 bg-gray-50 border-transparent border-2 focus:border-primary focus:bg-white rounded-2xl outline-none font-bold text-gray-900 transition-all placeholder:text-gray-300"
                                        placeholder="Suite / Floor / Unit (Optional)"
                                    />
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <input
                                            type="text"
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            className="w-full px-6 py-4 bg-gray-50 border-transparent border-2 focus:border-primary focus:bg-white rounded-2xl outline-none font-bold text-sm text-gray-900 transition-all placeholder:text-gray-300"
                                            placeholder="City"
                                        />
                                        <input
                                            type="text"
                                            value={formData.state}
                                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                            className="w-full px-6 py-4 bg-gray-50 border-transparent border-2 focus:border-primary focus:bg-white rounded-2xl outline-none font-bold text-sm text-gray-900 transition-all placeholder:text-gray-300"
                                            placeholder="State"
                                        />
                                        <input
                                            type="text"
                                            value={formData.postal_code}
                                            onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                                            className="w-full px-6 py-4 bg-gray-50 border-transparent border-2 focus:border-primary focus:bg-white rounded-2xl outline-none font-bold text-sm text-gray-900 transition-all placeholder:text-gray-300"
                                            placeholder="Postal Code"
                                        />
                                        <input
                                            type="text"
                                            value={formData.country}
                                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                            className="w-full px-6 py-4 bg-gray-50 border-transparent border-2 focus:border-primary focus:bg-white rounded-2xl outline-none font-bold text-sm text-gray-900 transition-all placeholder:text-gray-300"
                                            placeholder="ISO (US)"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* System Settings */}
                             <div className="space-y-6 pt-6 border-t border-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                                        <Clock className="w-4 h-4" />
                                    </div>
                                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">System Parameters</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                     <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                            <DollarSign className="w-3 h-3 text-emerald-500" />
                                            Active Currency
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.currency}
                                            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                            className="w-full px-6 py-4 bg-gray-50 border-transparent border-2 focus:border-primary focus:bg-white rounded-2xl outline-none font-bold text-gray-900 transition-all placeholder:text-gray-300"
                                            placeholder="USD"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Regional Timezone</label>
                                        <input
                                            type="text"
                                            value={formData.timezone}
                                            onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                                            className="w-full px-6 py-4 bg-gray-50 border-transparent border-2 focus:border-primary focus:bg-white rounded-2xl outline-none font-bold text-gray-900 transition-all placeholder:text-gray-300"
                                            placeholder="America/New_York"
                                        />
                                    </div>
                                </div>
                            </div>
                        </form>
                    </DialogContent>
                    <DialogFooter>
                         <Button
                            variant="ghost"
                            onClick={() => setIsDialogOpen(false)}
                            className="flex-1"
                        >
                            Abort
                        </Button>
                        <Button
                            type="submit"
                            form="studio-creation-form"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Initializing...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Initialize Headquarters
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </Dialog>
            </div>
        )
    }

    // Case 2: Studio Exists -> Simple Details View
    return (
        <div className="max-w-[1600px] mx-auto px-6 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
            {/* Hero Section */}
            <div className="relative w-full h-64 md:h-80 rounded-[2.5rem] overflow-hidden group shadow-2xl">
                {/* File Input */}
                <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleCoverUpload}
                />
                
                {/* Upload Button */}
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute top-6 right-6 z-20 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full backdrop-blur-md transition-all"
                    title="Change Cover Image"
                >
                    <Camera className="w-5 h-5" />
                </button>

                {/* Background Image / Gradient */}
                <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
                    style={{ 
                        backgroundImage: activeStudio.cover_image 
                            ? `url(${activeStudio.cover_image})` 
                            : activeStudio.settings?.cover_image 
                                ? `url(${activeStudio.settings.cover_image})` 
                                : 'none',
                        background: (activeStudio.cover_image || activeStudio.settings?.cover_image) 
                            ? undefined 
                            : 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)'
                    }}
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors duration-500" />
                
                {/* Content */}
                <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full flex flex-col md:flex-row items-end justify-between gap-6">
                    <div className="flex items-end gap-6">
                        {/* Logo */}
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-3xl shadow-xl flex items-center justify-center overflow-hidden border-4 border-white transform translate-y-4 md:translate-y-0 group-hover:-translate-y-2 transition-transform duration-500">
                            {activeStudio.settings?.logo_url ? (
                                <img src={activeStudio.settings.logo_url} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                                <Building2 className="w-10 h-10 md:w-12 md:h-12 text-gray-300" />
                            )}
                        </div>
                        
                        <div className="mb-2 text-white shadow-sm">
                            <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-2 drop-shadow-md">{activeStudio.name}</h1>
                            <p className="font-medium text-white/90 flex items-center gap-2 text-sm md:text-base drop-shadow">
                                <MapPin className="w-4 h-4" />
                                {[activeStudio.city, activeStudio.state, activeStudio.country].filter(Boolean).join(', ')}
                            </p>
                        </div>
                    </div>
                    
                    <Button
                        onClick={() => router.push('/dashboard/settings')}
                        className="bg-white/20 hover:bg-white/30 text-white border border-white/40 backdrop-blur-md gap-2 px-6 py-6 rounded-2xl transition-all font-bold mb-2 shadow-lg"
                    >
                        <Settings className="w-5 h-5" />
                        Configure Studio
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Info Card */}
                <div className="lg:col-span-2 space-y-8">
                     {/* Operational Details */}
                    <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
                        <div className="flex items-center gap-4 border-b border-gray-50 pb-6 mb-8">
                            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                                <Globe className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-gray-900">Operational Details</h3>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Contact & Location</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12">
                            <div className="space-y-2">
                                <span className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    <MapPin className="w-3 h-3" /> Address
                                </span>
                                <p className="font-medium text-gray-900 leading-relaxed text-lg">
                                    {activeStudio.address_line1}<br />
                                    {activeStudio.address_line2 && <>{activeStudio.address_line2}<br /></>}
                                    <span className="text-gray-500">{activeStudio.city}, {activeStudio.state} {activeStudio.postal_code}</span>
                                </p>
                            </div>
                            
                             <div className="space-y-2">
                                <span className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    <Phone className="w-3 h-3" /> Contact Methods
                                </span>
                                <div className="space-y-3 mt-1">
                                    <div className="flex items-center gap-3 text-gray-700 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                        <span className="font-medium">{activeStudio.email}</span>
                                    </div>
                                    {activeStudio.phone && (
                                        <div className="flex items-center gap-3 text-gray-700 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                                            <Phone className="w-4 h-4 text-gray-400" />
                                            <span className="font-medium">{activeStudio.phone}</span>
                                        </div>
                                    )}
                                     {activeStudio.website && (
                                        <div className="flex items-center gap-3 text-indigo-600 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/50 hover:bg-indigo-50 transition-colors cursor-pointer" onClick={() => window.open(activeStudio.website, '_blank')}>
                                            <Globe className="w-4 h-4" />
                                            <span className="font-bold">{activeStudio.website.replace(/^https?:\/\//, '')}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar: Quick Actions & Branding */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <div className="bg-gray-900 text-white rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-30 group-hover:opacity-50 transition-opacity duration-700" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-700" />
                        
                        <h3 className="text-xl font-black mb-2 relative z-10">Studio Command</h3>
                        <p className="text-gray-400 text-sm mb-8 relative z-10">Manage your daily operations</p>
                        
                        <div className="space-y-3 relative z-10">
                            <Button 
                                className="w-full justify-start text-gray-900 bg-white hover:bg-gray-100 font-bold h-auto py-4 px-6 rounded-xl"
                                onClick={() => router.push('/dashboard/schedule')}
                            >
                                <Calendar className="w-5 h-5 mr-3 text-indigo-600" />
                                Master Schedule
                            </Button>
                             <Button 
                                variant="ghost"
                                className="w-full justify-start text-white hover:bg-white/10 font-bold h-auto py-4 px-6 rounded-xl border border-white/10"
                                onClick={() => router.push('/dashboard/students')}
                            >
                                <Sparkles className="w-5 h-5 mr-3 text-yellow-400" />
                                Student Roster
                            </Button>
                        </div>
                    </div>

                    {/* Branding Preview Mini-Card */}
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] p-8 text-white relative overflow-hidden">
                        <div className="relative z-10">
                             <div className="flex items-center gap-3 mb-4">
                                <Palette className="w-5 h-5 text-white/80" />
                                <h4 className="font-bold text-lg">Identity & Theme</h4>
                            </div>
                            <p className="text-white/80 text-sm mb-6 leading-relaxed">
                                Customize your studio's digital presence. Your brand color communicates your vibe.
                            </p>
                            <Button 
                                onClick={() => router.push('/dashboard/settings?tab=appearance')}
                                className="w-full bg-white text-indigo-600 hover:bg-gray-50 font-bold border-none shadow-lg py-6 rounded-xl"
                            >
                                Open Visual Editor
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
