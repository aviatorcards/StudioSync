'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import {
    Plus, Search, Package, Music, BookOpen, Mic, Headphones,
    Edit, Trash2, AlertCircle, TrendingDown, DollarSign,
    Wrench, X, Loader2, MapPin
} from 'lucide-react'

interface InventoryItem {
    id: string
    name: string
    category: 'instrument' | 'equipment' | 'sheet-music' | 'accessories' | 'other'
    quantity: number
    condition: 'excellent' | 'good' | 'fair' | 'needs-repair'
    location: string
    value: number
    notes: string
    last_maintenance?: string
}

export default function InventoryPage() {
    const [items, setItems] = useState<InventoryItem[]>([
        {
            id: '1',
            name: 'Yamaha U1 Upright Piano',
            category: 'instrument',
            quantity: 1,
            condition: 'excellent',
            location: 'Studio Room A',
            value: 5000,
            notes: 'Tuned quarterly',
            last_maintenance: '2024-12-01'
        },
        {
            id: '2',
            name: 'Shure SM58 Microphones',
            category: 'equipment',
            quantity: 4,
            condition: 'good',
            location: 'Supply Closet',
            value: 400,
            notes: 'For vocal lessons'
        },
        {
            id: '3',
            name: 'Suzuki Violin Method Books',
            category: 'sheet-music',
            quantity: 12,
            condition: 'good',
            location: 'Library Shelf B',
            value: 180,
            notes: 'All levels 1-5'
        }
    ])

    const [searchQuery, setSearchQuery] = useState('')
    const [filterCategory, setFilterCategory] = useState<string>('all')
    const [showAddModal, setShowAddModal] = useState(false)
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)

    // Close on Escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setShowAddModal(false)
                setEditingItem(null)
            }
        }
        if (showAddModal || editingItem) {
            window.addEventListener('keydown', handleEscape)
            return () => window.removeEventListener('keydown', handleEscape)
        }
    }, [showAddModal, editingItem])

    const categories = [
        { value: 'all', label: 'All Items', icon: Package },
        { value: 'instrument', label: 'Instruments', icon: Music },
        { value: 'equipment', label: 'Equipment', icon: Headphones },
        { value: 'sheet-music', label: 'Sheet Music', icon: BookOpen },
        { value: 'accessories', label: 'Accessories', icon: Mic },
    ]

    const conditionColors = {
        'excellent': 'bg-green-50 text-green-700 border-green-200',
        'good': 'bg-blue-50 text-blue-700 border-blue-200',
        'fair': 'bg-yellow-50 text-yellow-700 border-yellow-200',
        'needs-repair': 'bg-red-50 text-red-700 border-red-200',
    }

    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.location.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = filterCategory === 'all' || item.category === filterCategory
        return matchesSearch && matchesCategory
    })

    const totalValue = filteredItems.reduce((sum, item) => sum + item.value, 0)
    const lowStockItems = items.filter(item => item.quantity <= 2 && item.category !== 'instrument')

    return (
        <div className="max-w-7xl mx-auto px-4 pb-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Inventory Management</h1>
                    <p className="text-lg text-gray-500 mt-2 font-medium">Track instruments, equipment, and supplies.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-5 py-3 bg-[#F39C12] text-white rounded-xl hover:bg-[#E67E22] transition-all flex items-center gap-2 font-bold shadow-lg hover:scale-105 active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Add Item
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl relative overflow-hidden group hover:-translate-y-1 transition-all">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-100/30 to-transparent rounded-bl-[3rem] group-hover:scale-150 transition-transform duration-500" />
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center border border-blue-200 shadow-inner mb-4">
                            <Package className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Total Items</div>
                        <div className="text-3xl font-black text-gray-900">{items.length}</div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl relative overflow-hidden group hover:-translate-y-1 transition-all">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-100/30 to-transparent rounded-bl-[3rem] group-hover:scale-150 transition-transform duration-500" />
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-50 rounded-xl flex items-center justify-center border border-green-200 shadow-inner mb-4">
                            <DollarSign className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Total Value</div>
                        <div className="text-3xl font-black text-gray-900">${totalValue.toLocaleString()}</div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl relative overflow-hidden group hover:-translate-y-1 transition-all">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-100/30 to-transparent rounded-bl-[3rem] group-hover:scale-150 transition-transform duration-500" />
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-50 rounded-xl flex items-center justify-center border border-orange-200 shadow-inner mb-4">
                            <TrendingDown className="w-6 h-6 text-orange-600" />
                        </div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Low Stock</div>
                        <div className="text-3xl font-black text-orange-600">{lowStockItems.length}</div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl relative overflow-hidden group hover:-translate-y-1 transition-all">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-100/30 to-transparent rounded-bl-[3rem] group-hover:scale-150 transition-transform duration-500" />
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-50 rounded-xl flex items-center justify-center border border-red-200 shadow-inner mb-4">
                            <Wrench className="w-6 h-6 text-red-600" />
                        </div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Needs Repair</div>
                        <div className="text-3xl font-black text-red-600">
                            {items.filter(i => i.condition === 'needs-repair').length}
                        </div>
                    </div>
                </div>
            </div>

            {/* Low Stock Alert */}
            {lowStockItems.length > 0 && (
                <div className="bg-orange-50 border-2 border-orange-200 rounded-[2rem] p-6 flex items-start gap-4 shadow-lg">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center border border-orange-200 flex-shrink-0">
                        <AlertCircle className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                        <h3 className="font-black text-orange-900 text-lg mb-1">Low Stock Alert</h3>
                        <p className="text-sm text-orange-700 font-semibold">
                            {lowStockItems.length} item(s) running low: {lowStockItems.map(i => i.name).join(', ')}
                        </p>
                    </div>
                </div>
            )}

            {/* Category Tabs */}
            <div className="bg-white border border-gray-100 rounded-[2rem] p-3 flex gap-2 overflow-x-auto shadow-xl">
                {categories.map(cat => {
                    const Icon = cat.icon
                    const count = cat.value === 'all' ? items.length : items.filter(i => i.category === cat.value).length
                    return (
                        <button
                            key={cat.value}
                            onClick={() => setFilterCategory(cat.value)}
                            className={`flex items-center gap-2 px-5 py-3 rounded-xl whitespace-nowrap transition-all font-bold text-sm ${filterCategory === cat.value
                                ? 'bg-[#F39C12] text-white shadow-lg scale-105'
                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {cat.label} ({count})
                        </button>
                    )
                })}
            </div>

            {/* Inventory Table */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl overflow-hidden">
                {/* Search */}
                <div className="p-6 border-b border-gray-100 bg-gray-50/30">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search by name or location..."
                            className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#F39C12] focus:border-transparent outline-none font-medium text-sm shadow-sm"
                        />
                    </div>
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap">Item Details</th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap">Category</th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap">Location</th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap">Quantity</th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap">Value</th>
                                <th className="px-6 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredItems.length > 0 ? (
                                filteredItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50/50 transition-all group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 shrink-0 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 font-black shadow-sm group-hover:shadow-md transition-all group-hover:-translate-y-0.5">
                                                    {item.name[0]}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-gray-900 leading-tight">{item.name}</div>
                                                    <div className="text-xs text-gray-500 mt-0.5 font-medium flex items-center gap-1.5">
                                                        <span className={`inline-block w-2 h-2 rounded-full ${item.condition === 'excellent' ? 'bg-green-400' :
                                                            item.condition === 'good' ? 'bg-blue-400' :
                                                                item.condition === 'fair' ? 'bg-yellow-400' : 'bg-red-400'
                                                            }`} />
                                                        {item.condition.charAt(0).toUpperCase() + item.condition.slice(1)} Condition
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
                                                {item.category.replace('-', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-sm text-gray-600 font-semibold">
                                                <MapPin className="w-4 h-4 text-gray-400" />
                                                {item.location}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-[#1ABC9C] rounded-full"
                                                        style={{ width: `${Math.min((item.quantity / 50) * 100, 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm font-bold text-gray-900">{item.quantity}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-900">
                                                ${item.value?.toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right whitespace-nowrap">
                                            <button
                                                onClick={() => setEditingItem(item)}
                                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all active:scale-90"
                                                title="Edit"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (confirm(`Delete ${item.name}?`)) {
                                                        setItems(items.filter(i => i.id !== item.id))
                                                    }
                                                }}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all active:scale-90"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-24 text-center">
                                        <div className="flex flex-col items-center justify-center gap-4">
                                            <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center border-2 border-dashed border-gray-200">
                                                <Package className="w-10 h-10 text-gray-200" />
                                            </div>
                                            <div>
                                                <p className="text-xl font-black text-gray-900 mb-1">Inventory Empty</p>
                                                <p className="text-sm text-gray-400 font-medium">Try adjusting your search terms</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4 p-4">
                    {filteredItems.length > 0 ? filteredItems.map((item) => (
                        <div key={item.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 shrink-0 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 font-black shadow-sm">
                                        {item.name[0]}
                                    </div>
                                    <div>
                                        <div className="text-lg font-bold text-gray-900 leading-tight">{item.name}</div>
                                        <div className="text-xs text-gray-500 mt-0.5 font-medium flex items-center gap-1.5">
                                            <span className={`inline-block w-2 h-2 rounded-full ${item.condition === 'excellent' ? 'bg-green-400' :
                                                item.condition === 'good' ? 'bg-blue-400' :
                                                    item.condition === 'fair' ? 'bg-yellow-400' : 'bg-red-400'
                                                }`} />
                                            {item.condition.charAt(0).toUpperCase() + item.condition.slice(1)} Condition
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setEditingItem(item)}
                                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all active:scale-90 bg-gray-50"
                                        title="Edit"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (confirm(`Delete ${item.name}?`)) {
                                                setItems(items.filter(i => i.id !== item.id))
                                            }
                                        }}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all active:scale-90 bg-gray-50"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
                                    {item.category.replace('-', ' ')}
                                </span>
                                <span className="flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
                                    <MapPin className="w-3.5 h-3.5" />
                                    {item.location}
                                </span>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                <div className="flex items-center gap-2">
                                    <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#1ABC9C] rounded-full"
                                            style={{ width: `${Math.min((item.quantity / 50) * 100, 100)}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-bold text-gray-900">{item.quantity} Units</span>
                                </div>
                                <div className="text-sm font-black text-gray-900">
                                    ${item.value?.toLocaleString()}
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                <Package className="w-8 h-8 text-gray-200" />
                            </div>
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No Items Found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Add/Edit Modal Placeholder */}
            {(showAddModal || editingItem) && (
                <div
                    className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-300 antialiased"
                    onClick={() => {
                        setShowAddModal(false)
                        setEditingItem(null)
                    }}
                >
                    <div
                        className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in slide-in-from-top-4 duration-300 ring-1 ring-black/5"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-10 py-8 bg-[#2C3E50] text-white flex justify-between items-center ring-1 ring-white/10">
                            <div>
                                <h3 className="text-3xl font-black tracking-tight">
                                    {editingItem ? 'Edit Item' : 'Add New Item'}
                                </h3>
                                <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Inventory Management</p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowAddModal(false)
                                    setEditingItem(null)
                                }}
                                className="w-12 h-12 rounded-2xl hover:bg-white/10 flex items-center justify-center transition-colors"
                            >
                                <X className="w-7 h-7" />
                            </button>
                        </div>
                        <form className="p-10 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Item Name</label>
                                    <input
                                        type="text"
                                        defaultValue={editingItem?.name}
                                        className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#F39C12] outline-none font-bold text-gray-900 text-sm"
                                        placeholder="e.g. Yamaha Piano"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</label>
                                    <select
                                        defaultValue={editingItem?.category || 'instrument'}
                                        className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#F39C12] outline-none font-bold text-gray-900 text-sm"
                                    >
                                        <option value="instrument">Instrument</option>
                                        <option value="equipment">Equipment</option>
                                        <option value="sheet-music">Sheet Music</option>
                                        <option value="accessories">Accessories</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Quantity</label>
                                    <input
                                        type="number"
                                        defaultValue={editingItem?.quantity || 1}
                                        className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#F39C12] outline-none font-bold text-gray-900 text-sm"
                                    />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Location</label>
                                    <input
                                        type="text"
                                        defaultValue={editingItem?.location}
                                        className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#F39C12] outline-none font-bold text-gray-900 text-sm"
                                        placeholder="e.g. Room A"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddModal(false)
                                        setEditingItem(null)
                                    }}
                                    className="flex-1 px-8 py-4 border-2 border-gray-100 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddModal(false)
                                        setEditingItem(null)
                                        toast.success(editingItem ? 'Item updated!' : 'Item added!')
                                    }}
                                    className="flex-[2] px-8 py-4 bg-[#F39C12] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#E67E22] transition-all shadow-xl active:scale-95"
                                >
                                    {editingItem ? 'Update Item' : 'Add Item'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
