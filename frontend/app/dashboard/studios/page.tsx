'use client'

import { useState, useRef, useEffect } from 'react'
import { Stage, Layer, Rect, Transformer, Text, Group } from 'react-konva'
import { useStudios } from '@/hooks/useDashboardData'
import {
    Loader2, Square, Music, Monitor, Armchair,
    Save, Plus, Building2, X, MapPin, CheckCircle2, Link as LinkIcon,
    DoorOpen, Maximize, Disc, Speaker, Mic2, BookOpen, Warehouse, Printer,
    Lock, Unlock
} from 'lucide-react'
import api from '@/services/api'
import { toast } from 'react-hot-toast'

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

    // Determine primary studio (User: "primary studio that we're currently in")
    // We'll default to the first one for now.
    const activeStudio = studios && studios.length > 0 ? studios[0] : null

    // --- Editor State ---
    const [shapes, setShapes] = useState<ShapeItem[]>([])
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [editorLoading, setEditorLoading] = useState(false)
    const [saving, setSaving] = useState(false)

    // --- Creation Modal State (for when no studio exists) ---
    const [isModalOpen, setIsModalOpen] = useState(false)
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
                    // Check if layout_data exists and is an array
                    if (res.data.layout_data && Array.isArray(res.data.layout_data)) {
                        setShapes(res.data.layout_data)
                    } else {
                        setShapes([]) // Reset if no layout data, or invalid
                    }
                } catch (err: any) {
                    console.error(err)
                    // Don't show error toast on 404/empty, just log
                    if (err.response?.status !== 404) {
                        toast.error('Failed to load layout')
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

    // Close modal on Escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsModalOpen(false)
        }
        if (isModalOpen) {
            window.addEventListener('keydown', handleEscape)
            return () => window.removeEventListener('keydown', handleEscape)
        }
    }, [isModalOpen])


    // --- Actions ---

    const handleSave = async () => {
        if (!activeStudio) return
        setSaving(true)
        try {
            await api.patch(`/core/studios/${activeStudio.id}/`, {
                layout_data: shapes
            })
            toast.success('Layout saved successfully')
        } catch (err) {
            console.error(err)
            toast.error('Failed to save layout')
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

        // 1. Deselect everything for a clean print
        setSelectedId(null)
        if (transformerRef.current) transformerRef.current.nodes([])

        // Wait a tick for selection to clear, then print
        setTimeout(() => {
            const dataUrl = stageRef.current.toDataURL({ pixelRatio: 2 })
            const printWindow = window.open('', '_blank')
            if (printWindow) {
                printWindow.document.write(`
                    <html>
                        <head>
                            <title>${activeStudio?.name || 'Studio'} Layout</title>
                            <style>
                                body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #fff; }
                                img { max-width: 100%; height: auto; border: 1px solid #eee; }
                                @media print {
                                    body { -webkit-print-color-adjust: exact; }
                                    img { border: none; }
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
        setIsModalOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            await api.post('/core/studios/', formData)
            toast.success('Studio created successfully')
            setIsModalOpen(false)
            refetch() // Reload studios to trigger activeStudio
        } catch (error: any) {
            console.error('Failed to create studio:', error)
            const errorMsg = error.response?.data?.detail || 'Operation failed'
            toast.error(errorMsg)
        } finally {
            setIsSubmitting(false)
        }
    }


    // --- Render Logic ---

    if (studiosLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                <Loader2 className="w-10 h-10 text-[#2C3E50] animate-spin mb-4" />
                <p className="text-gray-500 font-bold tracking-[0.2em] uppercase text-xs">Loading Studio...</p>
            </div>
        )
    }

    // Case 1: No Studio Exists -> Show Empty State / Creation Prompt
    if (!activeStudio) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl p-20 text-center">
                    <div className="flex flex-col items-center gap-6">
                        <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center border-2 border-dashed border-gray-200">
                            <Building2 className="w-12 h-12 text-gray-300" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-gray-900 mb-2">Setup Your Studio</h2>
                            <p className="text-gray-500 font-medium max-w-md mx-auto">
                                Before you can design your layout, you need to create your primary studio profile.
                            </p>
                        </div>
                        <button
                            onClick={handleOpenCreate}
                            className="px-8 py-4 bg-[#2C3E50] text-white rounded-2xl hover:bg-[#34495E] transition-all flex items-center gap-2 font-bold shadow-lg hover:scale-105 active:scale-95"
                        >
                            <Plus className="w-5 h-5" />
                            Create Studio Profile
                        </button>
                    </div>
                </div>

                {/* Create Modal */}
                {isModalOpen && (
                    <div
                        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-300 antialiased"
                        onClick={() => setIsModalOpen(false)}
                    >
                        <div
                            className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in zoom-in slide-in-from-top-4 duration-300 ring-1 ring-black/5 flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="px-10 py-8 bg-[#2C3E50] text-white flex items-center justify-between shrink-0 ring-1 ring-white/10">
                                <div>
                                    <h2 className="text-3xl font-black tracking-tight">Add New Studio</h2>
                                    <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mt-1">Configure Location & Settings</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 rounded-2xl hover:bg-white/10 flex items-center justify-center transition-colors">
                                    <X className="w-7 h-7" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto flex-1 scrollbar-hide">
                                {/* Basics */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 text-[#2C3E50]">
                                        <Building2 className="w-6 h-6" />
                                        <h3 className="text-lg font-black uppercase tracking-wide">Core Identity</h3>
                                    </div>
                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Studio Name *</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#2C3E50] outline-none font-bold text-gray-900 transition-all shadow-inner placeholder:font-medium"
                                                placeholder="e.g. Downtown Music Academy"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Contact */}
                                <div className="space-y-6 pt-6 border-t border-gray-100">
                                    <div className="flex items-center gap-4 text-[#2C3E50]">
                                        <LinkIcon className="w-6 h-6" />
                                        <h3 className="text-lg font-black uppercase tracking-wide">Contact Info</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Address</label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#2C3E50] outline-none font-bold text-gray-900 transition-all shadow-inner placeholder:font-medium"
                                                placeholder="info@academy.com"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone Number</label>
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#2C3E50] outline-none font-bold text-gray-900 transition-all shadow-inner placeholder:font-medium"
                                                placeholder="(555) 123-4567"
                                            />
                                        </div>
                                        <div className="col-span-full space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Website URL</label>
                                            <input
                                                type="url"
                                                value={formData.website}
                                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#2C3E50] outline-none font-bold text-gray-900 transition-all shadow-inner placeholder:font-medium"
                                                placeholder="https://example.com"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Location */}
                                <div className="space-y-6 pt-6 border-t border-gray-100">
                                    <div className="flex items-center gap-4 text-[#2C3E50]">
                                        <MapPin className="w-6 h-6" />
                                        <h3 className="text-lg font-black uppercase tracking-wide">Location</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <input
                                            type="text"
                                            value={formData.address_line1}
                                            onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#2C3E50] outline-none font-bold text-gray-900 transition-all shadow-inner placeholder:font-medium"
                                            placeholder="Address Line 1"
                                        />
                                        <input
                                            type="text"
                                            value={formData.address_line2}
                                            onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#2C3E50] outline-none font-bold text-gray-900 transition-all shadow-inner placeholder:font-medium"
                                            placeholder="Address Line 2 (Optional)"
                                        />
                                        <div className="grid grid-cols-2 gap-4">
                                            <input
                                                type="text"
                                                value={formData.city}
                                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#2C3E50] outline-none font-bold text-gray-900 transition-all shadow-inner placeholder:font-medium"
                                                placeholder="City"
                                            />
                                            <input
                                                type="text"
                                                value={formData.state}
                                                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#2C3E50] outline-none font-bold text-gray-900 transition-all shadow-inner placeholder:font-medium"
                                                placeholder="State/Region"
                                            />
                                            <input
                                                type="text"
                                                value={formData.postal_code}
                                                onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                                                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#2C3E50] outline-none font-bold text-gray-900 transition-all shadow-inner placeholder:font-medium"
                                                placeholder="Zip Code"
                                            />
                                            <input
                                                type="text"
                                                value={formData.country}
                                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#2C3E50] outline-none font-bold text-gray-900 transition-all shadow-inner placeholder:font-medium"
                                                placeholder="Country Code (e.g. US)"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Settings */}
                                <div className="space-y-6 pt-6 border-t border-gray-100">
                                    <div className="flex items-center gap-4 text-[#2C3E50]">
                                        <CheckCircle2 className="w-6 h-6" />
                                        <h3 className="text-lg font-black uppercase tracking-wide">Settings</h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Currency</label>
                                            <input
                                                type="text"
                                                value={formData.currency}
                                                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#2C3E50] outline-none font-bold text-gray-900 transition-all shadow-inner placeholder:font-medium"
                                                placeholder="USD"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Timezone</label>
                                            <input
                                                type="text"
                                                value={formData.timezone}
                                                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                                                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#2C3E50] outline-none font-bold text-gray-900 transition-all shadow-inner placeholder:font-medium"
                                                placeholder="UTC"
                                            />
                                        </div>
                                        <div className="col-span-full pt-4">
                                            <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-all">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.is_active}
                                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                                    className="w-5 h-5 rounded-md border-gray-300 text-[#2C3E50] focus:ring-[#2C3E50]"
                                                />
                                                <span className="font-bold text-gray-700">Studio is Active</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 px-8 py-4 border-2 border-gray-100 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all active:scale-95"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-[2] px-8 py-4 bg-[#2C3E50] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#34495E] disabled:opacity-50 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
                                    >
                                        {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</> : 'Create Studio'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    // Case 2: Studio Exists -> Editor View
    return (
        <div className="flex h-[calc(100vh-theme(spacing.24))] -m-8 flex-col">
            {/* Toolbar Header */}
            <div className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-black text-gray-900">
                        {activeStudio.name} <span className="text-gray-400 font-medium text-base ml-2">Studio Layout</span>
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    {selectedId && (
                        <>
                            <button
                                onClick={toggleLock}
                                className={`px-4 py-2 font-medium rounded-lg mr-2 text-sm flex items-center gap-2 transition-colors ${shapes.find(s => s.id === selectedId)?.locked
                                    ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                title={shapes.find(s => s.id === selectedId)?.locked ? "Unlock Item" : "Lock Item"}
                            >
                                {shapes.find(s => s.id === selectedId)?.locked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                {shapes.find(s => s.id === selectedId)?.locked ? 'Unlock' : 'Lock'}
                            </button>
                            <button
                                onClick={handleDeleteItem}
                                className="px-4 py-2 text-red-600 font-medium hover:bg-red-50 rounded-lg mr-4 text-sm"
                            >
                                Delete Selected
                            </button>
                        </>
                    )}
                    <button
                        onClick={handlePrint}
                        className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg mr-2 text-sm flex items-center gap-2"
                        title="Print Layout"
                    >
                        <Printer className="w-4 h-4" />
                        Print
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-5 py-2.5 bg-[#2C3E50] text-white rounded-xl font-bold flex items-center gap-2 hover:bg-[#34495E] disabled:opacity-50 transition-all shadow-md active:scale-95 text-sm"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? 'Saving...' : 'Save Layout'}
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Toolbox */}
                <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col gap-4 overflow-y-auto z-10 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]">
                    <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Furniture & Items</h2>
                    {TOOLBOX_ITEMS.map((item) => (
                        <button
                            key={item.type}
                            onClick={() => handleAddItem(item.type)}
                            className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-lg hover:-translate-y-1 border border-gray-100 transition-all group text-left"
                        >
                            <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center group-hover:border-[#2C3E50] transition-colors shadow-sm">
                                <item.icon className="w-5 h-5 text-gray-600" />
                            </div>
                            <span className="font-bold text-gray-700 text-sm">{item.label}</span>
                        </button>
                    ))}

                    <div className="mt-auto p-5 bg-blue-50/50 rounded-2xl border border-blue-100/50 text-blue-900 text-xs leading-relaxed">
                        <p className="font-bold mb-1 uppercase tracking-wider text-[10px] text-blue-400">Pro Tip</p>
                        Selected items can be rotated and resized using the handles directly on the canvas.
                    </div>
                </aside>

                {/* Canvas Area */}
                <main className="flex-1 bg-gray-50/50 relative overflow-hidden flex items-center justify-center">
                    {/* Grid Background */}
                    <div
                        className="absolute inset-0 opacity-10 pointer-events-none"
                        style={{
                            backgroundImage: 'radial-gradient(#2C3E50 1px, transparent 1px)',
                            backgroundSize: '24px 24px'
                        }}
                    />

                    {editorLoading ? (
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                            <p className="text-sm font-medium text-gray-400">Loading layout...</p>
                        </div>
                    ) : (
                        <div className="bg-white shadow-2xl rounded-sm overflow-hidden border border-gray-100">
                            <Stage
                                width={1000}
                                height={800}
                                ref={stageRef}
                                onMouseDown={(e: any) => {
                                    // Deselect if clicked on stage
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

                                                    // Reset scale and update width/height
                                                    node.scaleX(1);
                                                    node.scaleY(1);

                                                    const newShapes = shapes.map(s => {
                                                        if (s.id === shape.id) {
                                                            return {
                                                                ...s,
                                                                x: node.x(),
                                                                y: node.y(),
                                                                rotation: node.rotation(),
                                                                // Use stored shape width/height for calculation because Group width/height might be 0
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
                                                fill={selectedId === shape.id ? '#3498db' : shape.fill}
                                                opacity={0.9}
                                                cornerRadius={4}
                                                shadowColor="black"
                                                shadowBlur={10}
                                                shadowOpacity={0.15}
                                                shadowOffset={{ x: 2, y: 4 }}
                                            />
                                            <Text
                                                text={shape.type.toUpperCase()}
                                                fontSize={10}
                                                fontStyle="bold"
                                                fill="white"
                                                width={shape.width}
                                                align="center"
                                                y={shape.height / 2 - 5}
                                            />
                                        </Group>
                                    ))}
                                    <Transformer
                                        ref={transformerRef}
                                        boundBoxFunc={(oldBox, newBox) => {
                                            // Limit resize
                                            if (newBox.width < 5 || newBox.height < 5) {
                                                return oldBox
                                            }
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
    )
}
