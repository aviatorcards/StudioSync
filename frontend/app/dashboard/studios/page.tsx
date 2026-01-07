'use client'

import { useState, useRef, useEffect } from 'react'
import { Stage, Layer, Rect, Transformer, Text, Group } from 'react-konva'
import { useStudios } from '@/hooks/useDashboardData'
import {
    Loader2, Square, Music, Monitor, Armchair,
    Save, Plus, Building2, X, MapPin, CheckCircle2, Link as LinkIcon,
    DoorOpen, Maximize, Disc, Speaker, Mic2, BookOpen, Warehouse, Printer,
    Lock, Unlock, Sparkles, Globe, Clock, DollarSign, Target
} from 'lucide-react'
import api from '@/services/api'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Dialog, DialogHeader, DialogContent, DialogFooter } from '@/components/ui/dialog'

// --- Interfaces & Constants ---

interface ShapeItem {
    id: string
    type: 'wall' | 'piano' | 'chair' | 'desk' | 'door' | 'window' | 'drum' | 'amp' | 'mic' | 'music_stand' | 'sofa' | 'plant'
    x: number
    y: number
    width: number
    height: number
    rotation: number
    fill: string
    locked?: boolean
}

const GRID_SIZE = 20

const TOOLBOX_ITEMS = [
    // Structure
    { type: 'wall', label: 'Wall', icon: Square, width: 100, height: 10, fill: '#333333' },
    { type: 'door', label: 'Door', icon: DoorOpen, width: 50, height: 8, fill: '#8B4513' },
    { type: 'window', label: 'Window', icon: Maximize, width: 50, height: 5, fill: '#3498db' },

    // Instruments
    { type: 'piano', label: 'Grand Piano', icon: Music, width: 120, height: 100, fill: '#000000' },
    { type: 'drum', label: 'Drum Kit', icon: Disc, width: 80, height: 80, fill: '#c0392b' },
    { type: 'amp', label: 'Guitar Amp', icon: Speaker, width: 40, height: 25, fill: '#2d3436' },

    // Equipment
    { type: 'mic', label: 'Microphone', icon: Mic2, width: 20, height: 20, fill: '#7f8c8d' },
    { type: 'music_stand', label: 'Music Stand', icon: BookOpen, width: 30, height: 10, fill: '#95a5a6' },

    // Furniture
    { type: 'desk', label: 'Teacher Desk', icon: Monitor, width: 90, height: 45, fill: '#8e44ad' },
    { type: 'chair', label: 'Chair', icon: Armchair, width: 30, height: 30, fill: '#e67e22' },
    { type: 'sofa', label: 'Waiting Sofa', icon: Warehouse, width: 100, height: 40, fill: '#2ecc71' },
]

export default function StudiosPage() {
    const { studios, loading: studiosLoading, refetch } = useStudios()

    // Determine primary studio
    const activeStudio = studios && studios.length > 0 ? studios[0] : null

    // --- Editor State ---
    const [shapes, setShapes] = useState<ShapeItem[]>([])
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [editorLoading, setEditorLoading] = useState(false)
    const [saving, setSaving] = useState(false)

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

    // --- Konva Refs ---
    const stageRef = useRef<any>(null)
    const transformerRef = useRef<any>(null)

    // --- Effects ---

    // Load layout for active studio
    useEffect(() => {
        if (activeStudio?.id) {
            setEditorLoading(true)
            const fetchLayout = async () => {
                try {
                    const res = await api.get(`/core/studios/${activeStudio.id}/`)
                    if (res.data.layout_data && Array.isArray(res.data.layout_data)) {
                        setShapes(res.data.layout_data)
                    } else {
                        setShapes([]) 
                    }
                } catch (err: any) {
                    console.error(err)
                    if (err.response?.status !== 404) {
                        toast.error('Failed to load architecture data')
                    }
                } finally {
                    setEditorLoading(false)
                }
            }
            fetchLayout()
        }
    }, [activeStudio?.id])

    // Handle selection and transformer update
    useEffect(() => {
        if (selectedId && transformerRef.current && stageRef.current) {
            const node = stageRef.current.findOne('#' + selectedId)
            if (node) {
                transformerRef.current.nodes([node])
                transformerRef.current.getLayer().batchDraw()
            }
        }
    }, [selectedId, shapes])


    // --- Actions ---

    const handleSave = async () => {
        if (!activeStudio) return
        setSaving(true)
        try {
            await api.patch(`/core/studios/${activeStudio.id}/`, {
                layout_data: shapes
            })
            toast.success('Architecture layout synchronized')
        } catch (err) {
            console.error(err)
            toast.error('Synchronization failed')
        } finally {
            setSaving(false)
        }
    }

    const handleAddItem = (type: string) => {
        const template = TOOLBOX_ITEMS.find(t => t.type === type)
        if (!template) return

        const newShape: ShapeItem = {
            id: `shape-${Date.now()}`,
            type: template.type as any,
            x: 100,
            y: 100,
            width: template.width,
            height: template.height,
            rotation: 0,
            fill: template.fill
        }
        setShapes([...shapes, newShape])
        setSelectedId(newShape.id)
    }

    const handleDeleteItem = () => {
        if (selectedId) {
            setShapes(shapes.filter(s => s.id !== selectedId))
            setSelectedId(null)
            if (transformerRef.current) transformerRef.current.nodes([])
        }
    }

    const toggleLock = () => {
        if (!selectedId) return
        setShapes(shapes.map(s => {
            if (s.id === selectedId) {
                return { ...s, locked: !s.locked }
            }
            return s
        }))
    }

    const handlePrint = () => {
        if (!stageRef.current) return
        setSelectedId(null)
        if (transformerRef.current) transformerRef.current.nodes([])

        setTimeout(() => {
            const dataUrl = stageRef.current.toDataURL({ pixelRatio: 2 })
            const printWindow = window.open('', '_blank')
            if (printWindow) {
                printWindow.document.write(`
                    <html>
                        <head>
                            <title>${activeStudio?.name || 'Studio'} Blueprint</title>
                            <style>
                                body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #fff; font-family: system-ui; }
                                img { max-width: 100%; height: auto; border: 1px solid #eee; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
                                @media print {
                                    body { -webkit-print-color-adjust: exact; }
                                    img { border: none; box-shadow: none; }
                                }
                            </style>
                        </head>
                        <body>
                            <img src="${dataUrl}" onload="window.print();" />
                        </body>
                    </html>
                `)
                printWindow.document.close()
            }
        }, 100)
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

    // Case 2: Studio Exists -> Editor View
    return (
        <div className="flex flex-col h-[calc(100vh-theme(spacing.24))] -m-8 relative overflow-hidden bg-gray-50/30">
            {/* Mobile Desktop-Only Notice */}
            <div className="block md:hidden p-8">
                 <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl p-10 text-center space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                    <div className="w-20 h-20 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 mx-auto">
                        <Monitor className="w-10 h-10" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Large Display Required</h3>
                        <p className="text-sm font-medium text-gray-500 leading-relaxed">
                            The Blueprint Designer requires significant screen real estate for precise architectural orchestration. 
                            Please access this module from a desktop environment.
                        </p>
                    </div>
                </div>
            </div>

            {/* Desktop Content */}
            <div className="hidden md:flex flex-col flex-1">
                {/* Editor Header */}
                <header className="h-20 bg-white border-b border-gray-100 px-8 flex items-center justify-between shrink-0 z-20">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                            <Maximize className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-lg font-black text-gray-900 tracking-tighter uppercase leading-tight">
                                {activeStudio.name} Blueprint
                            </h1>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Architectural Orchestration Mode</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {selectedId && (
                            <div className="flex items-center gap-2 p-1.5 bg-gray-50 rounded-2xl mr-4 border border-gray-100 animate-in slide-in-from-right-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={toggleLock}
                                    className={`px-4 rounded-xl text-[10px] font-black uppercase tracking-widest gap-2 ${
                                        shapes.find(s => s.id === selectedId)?.locked 
                                            ? 'text-orange-600 bg-white shadow-sm' 
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    {shapes.find(s => s.id === selectedId)?.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                                    {shapes.find(s => s.id === selectedId)?.locked ? 'Unlock' : 'Lock'}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleDeleteItem}
                                    className="px-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50"
                                >
                                    Eliminate
                                </Button>
                            </div>
                        )}
                        <Button
                            variant="ghost"
                            onClick={handlePrint}
                            className="gap-2 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500"
                        >
                            <Printer className="w-4 h-4" />
                            Render PDF
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="gap-2 px-8 rounded-2xl shadow-lg shadow-primary/10 transition-all font-black uppercase tracking-widest text-[10px] py-6"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {saving ? 'Synchronizing...' : 'Save Blueprint'}
                        </Button>
                    </div>
                </header>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar / Elements Library */}
                    <aside className="w-72 bg-white border-r border-gray-100 px-6 py-8 flex flex-col gap-6 overflow-y-auto z-10 custom-scrollbar">
                        <div className="space-y-1">
                            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Architecture Library</h2>
                            <p className="text-[10px] font-medium text-gray-400">Drag items to the canvas area</p>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-3">
                            {TOOLBOX_ITEMS.map((item) => (
                                <button
                                    key={item.type}
                                    onClick={() => handleAddItem(item.type)}
                                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-[1.25rem] hover:bg-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-2 border-transparent hover:border-primary/20 transition-all group text-left active:scale-[0.98]"
                                >
                                    <div className="w-12 h-12 rounded-[1rem] bg-white border border-gray-100 flex items-center justify-center group-hover:bg-primary/5 transition-colors shadow-sm">
                                        <item.icon className="w-5 h-5 text-gray-500 group-hover:text-primary transition-colors" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-black text-gray-700 text-xs uppercase tracking-tight">{item.label}</span>
                                        <span className="text-[9px] font-bold text-gray-400 uppercase">Interactive Component</span>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="mt-auto p-6 bg-primary/[0.03] rounded-3xl border border-primary/10 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                <Target className="w-3.5 h-3.5" />
                                Design Tip
                            </p>
                            <p className="text-[11px] font-medium text-gray-600 leading-relaxed">
                                Use the <span className="font-black text-primary">handles</span> to resize and rotate. Changes are temporarily stored until <span className="font-black text-primary">Saved</span>.
                            </p>
                        </div>
                    </aside>

                    {/* Canvas Main Area */}
                    <main className="flex-1 bg-gray-50/50 relative overflow-hidden flex items-center justify-center p-12">
                         {/* Grid Background */}
                         <div
                            className="absolute inset-0 opacity-[0.03] pointer-events-none"
                            style={{
                                backgroundImage: 'radial-gradient(#000 1.5px, transparent 1.5px)',
                                backgroundSize: '32px 32px'
                            }}
                        />

                        {editorLoading ? (
                            <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500">
                                <Loader2 className="w-12 h-12 animate-spin text-primary/20" />
                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Rendering Environment...</p>
                            </div>
                        ) : (
                            <div className="bg-white shadow-[0_32px_100px_rgba(0,0,0,0.06)] rounded-sm overflow-hidden border border-gray-200 ring-8 ring-white transform scale-[0.85] origin-center">
                                <Stage
                                    width={1000}
                                    height={800}
                                    ref={stageRef}
                                    onMouseDown={(e: any) => {
                                        if (e.target === e.target.getStage()) {
                                            setSelectedId(null)
                                            if (transformerRef.current) transformerRef.current.nodes([])
                                        }
                                    }}
                                >
                                    <Layer>
                                        {shapes.map((shape) => (
                                            <Group
                                                key={shape.id}
                                                id={shape.id}
                                                x={shape.x}
                                                y={shape.y}
                                                rotation={shape.rotation}
                                                draggable={!shape.locked}
                                                onClick={() => setSelectedId(shape.id)}
                                                onTap={() => setSelectedId(shape.id)}
                                                onDragEnd={(e: any) => {
                                                    const newShapes = shapes.map(s => {
                                                        if (s.id === shape.id) {
                                                            return {
                                                                ...s,
                                                                x: Math.round(e.target.x() / GRID_SIZE) * GRID_SIZE,
                                                                y: Math.round(e.target.y() / GRID_SIZE) * GRID_SIZE
                                                            }
                                                        }
                                                        return s
                                                    })
                                                    setShapes(newShapes)
                                                }}
                                                onTransformEnd={(e: any) => {
                                                    const node = stageRef.current.findOne('#' + shape.id)
                                                    if (node) {
                                                        const scaleX = node.scaleX();
                                                        const scaleY = node.scaleY();
                                                        node.scaleX(1);
                                                        node.scaleY(1);

                                                        const newShapes = shapes.map(s => {
                                                            if (s.id === shape.id) {
                                                                return {
                                                                    ...s,
                                                                    x: node.x(),
                                                                    y: node.y(),
                                                                    rotation: node.rotation(),
                                                                    width: Math.max(5, s.width * scaleX),
                                                                    height: Math.max(5, s.height * scaleY)
                                                                }
                                                            }
                                                            return s
                                                        })
                                                        setShapes(newShapes)
                                                    }
                                                }}
                                            >
                                                <Rect
                                                    width={shape.width}
                                                    height={shape.height}
                                                    fill={selectedId === shape.id ? '#6366f1' : shape.fill}
                                                    opacity={0.8}
                                                    cornerRadius={6}
                                                    shadowColor="black"
                                                    shadowBlur={15}
                                                    shadowOpacity={0.1}
                                                    shadowOffset={{ x: 2, y: 4 }}
                                                />
                                                <Text
                                                    text={shape.type.toUpperCase()}
                                                    fontSize={9}
                                                    fontStyle="bold"
                                                    fill="white"
                                                    width={shape.width}
                                                    align="center"
                                                    y={shape.height / 2 - 4}
                                                    opacity={0.9}
                                                />
                                            </Group>
                                        ))}
                                        <Transformer
                                            ref={transformerRef}
                                            rotateAnchorOffset={24}
                                            anchorSize={10}
                                            anchorCornerRadius={5}
                                            anchorFill="#6366f1"
                                            anchorStroke="#6366f1"
                                            borderStroke="#6366f1"
                                            boundBoxFunc={(oldBox, newBox) => {
                                                if (newBox.width < 10 || newBox.height < 10) return oldBox
                                                return newBox
                                            }}
                                        />
                                    </Layer>
                                </Stage>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    )
}
