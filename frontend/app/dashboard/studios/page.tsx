'use client'

import { useState } from 'react'
import { useStudios } from '@/hooks/useDashboardData'
import {
    Loader2, Plus, Building2, MapPin, Globe, Phone, Mail, Settings,
    Sparkles, Clock, DollarSign, Calendar
} from 'lucide-react'
import api from '@/services/api'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Dialog, DialogHeader, DialogContent, DialogFooter } from '@/components/ui/dialog'
import { useRouter } from 'next/navigation'

export default function StudiosPage() {
    const { studios, loading: studiosLoading, refetch } = useStudios()
    const router = useRouter()

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
                            className="flex-[2] gap-2 active:scale-95 transition-transform"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Initializing...
                                </>
                            ) : (
                                'Complete Onboarding'
                            )}
                        </Button>
                    </DialogFooter>
                </Dialog>
            </div>
        )
    }

    // Case 2: Studio Exists -> Simple Details View
    return (
        <div className="max-w-5xl mx-auto px-6 py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div className="space-y-2">
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">{activeStudio.name}</h1>
                    <p className="text-gray-500 font-medium flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {activeStudio.city}, {activeStudio.state} {activeStudio.country}
                    </p>
                </div>
                <Button
                    onClick={() => router.push('/dashboard/settings')}
                    className="gap-2 px-6 py-6 shadow-xl shadow-primary/10 transition-all font-bold"
                >
                    <Settings className="w-4 h-4" />
                    Configure Settings
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Info Card */}
                <div className="md:col-span-2 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-8">
                    <div className="flex items-center gap-4 border-b border-gray-50 pb-6">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                            <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-gray-900">Studio Details</h3>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Operational Information</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Address</span>
                            <p className="font-medium text-gray-900">
                                {activeStudio.address_line1}<br />
                                {activeStudio.address_line2 && <>{activeStudio.address_line2}<br /></>}
                                {activeStudio.city}, {activeStudio.state} {activeStudio.postal_code}
                            </p>
                        </div>
                        
                         <div className="space-y-1">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact</span>
                            <div className="space-y-2 mt-1">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Mail className="w-3.5 h-3.5" />
                                    {activeStudio.email}
                                </div>
                                {activeStudio.phone && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Phone className="w-3.5 h-3.5" />
                                        {activeStudio.phone}
                                    </div>
                                )}
                                 {activeStudio.website && (
                                    <div className="flex items-center gap-2 text-sm text-primary">
                                        <Globe className="w-3.5 h-3.5" />
                                        <a href={activeStudio.website} target="_blank" rel="noreferrer" className="hover:underline">
                                            {activeStudio.website.replace(/^https?:\/\//, '')}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>

                         <div className="space-y-1">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">System</span>
                            <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                <Globe className="w-3.5 h-3.5 text-gray-400" />
                                {activeStudio.timezone}
                            </p>
                             <p className="text-sm font-medium text-gray-900 flex items-center gap-2 mt-1">
                                <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                                {activeStudio.currency}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Quick Actions / Stats Placeholder */}
                <div className="space-y-6">
                    <div className="bg-primary text-white rounded-3xl p-8 shadow-xl shadow-primary/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                        <h3 className="text-lg font-black mb-1">Quick Actions</h3>
                        <p className="text-primary-foreground/80 text-sm mb-6">Manage your studio operations</p>
                        
                        <div className="space-y-3 relative z-10">
                            <Button 
                                variant="secondary" 
                                className="w-full justify-start text-primary font-bold"
                                onClick={() => router.push('/dashboard/schedule')}
                            >
                                <Calendar className="w-4 h-4 mr-2" />
                                View Schedule
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
