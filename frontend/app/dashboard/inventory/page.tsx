'use client'

import { useState } from 'react'
import {
    Plus, Search, Package, Music, BookOpen, Mic, Headphones,
    Edit, AlertCircle, TrendingDown, DollarSign,
    Wrench, X, MapPin, ChevronLeft, ChevronRight, MoreHorizontal, Filter, ArrowUpDown
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'

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
    // -------------------------------------------------------------------------
    // STATE & DATA
    // -------------------------------------------------------------------------
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
        },
        {
            id: '4',
            name: 'Music Stands (Standard)',
            category: 'accessories',
            quantity: 15,
            condition: 'fair',
            location: 'Main Hall',
            value: 450,
            notes: 'Some scratches'
        },
        {
            id: '5',
            name: 'Guitar Strings (Nylon)',
            category: 'accessories',
            quantity: 8,
            condition: 'excellent',
            location: 'Storage Drawer 1',
            value: 120,
            notes: 'Backup sets'
        }
    ])

    const [searchQuery, setSearchQuery] = useState('')
    const [filterCategory, setFilterCategory] = useState<string>('all')
    const [sortBy, setSortBy] = useState<'name' | 'value' | 'quantity'>('name')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

    // Pagination
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 8

    // Selection
    const [selectedItems, setSelectedItems] = useState<string[]>([])

    // Modal
    const [showAddModal, setShowAddModal] = useState(false)
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)

    const categories = [
        { value: 'all', label: 'All Items', icon: Package },
        { value: 'instrument', label: 'Instruments', icon: Music },
        { value: 'equipment', label: 'Equipment', icon: Headphones },
        { value: 'sheet-music', label: 'Sheet Music', icon: BookOpen },
        { value: 'accessories', label: 'Accessories', icon: Mic },
    ]

    // -------------------------------------------------------------------------
    // FILTERING & PAGINATION
    // -------------------------------------------------------------------------
    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.location.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = filterCategory === 'all' || item.category === filterCategory
        return matchesSearch && matchesCategory
    }).sort((a, b) => {
        let valA = a[sortBy]
        let valB = b[sortBy]

        if (typeof valA === 'string') valA = valA.toLowerCase()
        if (typeof valB === 'string') valB = valB.toLowerCase()

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1
        return 0
    })

    const totalPages = Math.ceil(filteredItems.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const currentItems = filteredItems.slice(startIndex, startIndex + itemsPerPage)

    // -------------------------------------------------------------------------
    // HANDLERS
    // -------------------------------------------------------------------------
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage)
        }
    }

    const toggleItemSelection = (id: string) => {
        setSelectedItems(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    const toggleSort = (field: 'name' | 'value' | 'quantity') => {
        if (sortBy === field) {
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
        } else {
            setSortBy(field)
            setSortOrder('asc')
        }
    }

    // -------------------------------------------------------------------------
    // HELPER COMPONENTS
    // -------------------------------------------------------------------------
    const ConditionBadge = ({ condition }: { condition: string }) => {
        const styles = {
            excellent: 'bg-green-50 text-green-700 border-green-200',
            good: 'bg-blue-50 text-blue-700 border-blue-200',
            fair: 'bg-yellow-50 text-yellow-700 border-yellow-200',
            'needs-repair': 'bg-red-50 text-red-700 border-red-200',
        }
        const style = styles[condition as keyof typeof styles] || styles.good
        const label = condition === 'needs-repair' ? 'Needs Repair' : condition.charAt(0).toUpperCase() + condition.slice(1)

        return (
            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${style} whitespace-nowrap`}>
                {label}
            </span>
        )
    }

    // -------------------------------------------------------------------------
    // RENDER
    // -------------------------------------------------------------------------
    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 space-y-4 sm:space-y-6 overflow-x-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 sm:gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">Inventory</h1>
                    <p className="text-sm sm:text-lg text-gray-500 mt-2 font-medium">Manage instruments, equipment, and resources.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => {
                            setEditingItem(null)
                            setShowAddModal(true)
                        }}
                        className="min-w-[200px] px-6 py-3 bg-[#F39C12] text-white rounded-xl hover:bg-[#E67E22] transition-all shadow-lg text-sm font-bold flex items-center justify-center gap-2 active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Add New Item</span>
                    </button>
                </div>
            </div>

            {/* Mobile Stats Grid - Compact (Visible on all screens, adjusting columns) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between min-h-[100px]">
                    <div className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Total Items</div>
                    <div className="text-2xl sm:text-3xl font-black text-gray-900">{items.length}</div>
                </div>
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between min-h-[100px]">
                    <div className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Total Value</div>
                    <div className="text-2xl sm:text-3xl font-black text-gray-900">${items.reduce((acc, i) => acc + i.value, 0).toLocaleString()}</div>
                </div>
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between min-h-[100px]">
                    <div className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Low Stock</div>
                    <div className="text-2xl sm:text-3xl font-black text-orange-600">{items.filter(i => i.quantity <= 2).length}</div>
                </div>
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between min-h-[100px]">
                    <div className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Repairs</div>
                    <div className="text-2xl sm:text-3xl font-black text-red-600">{items.filter(i => i.condition === 'needs-repair').length}</div>
                </div>
            </div>

            {/* Filters & Controls Container */}
            <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-[2rem] border border-gray-100 shadow-xl space-y-4">
                <div className="flex flex-col gap-4">

                    {/* Category Filter Pills - Horizontal Scroll */}
                    <div className="w-full -mx-1 px-1">
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {categories.map(cat => {
                                const Icon = cat.icon
                                const isActive = filterCategory === cat.value
                                return (
                                    <button
                                        key={cat.value}
                                        onClick={() => setFilterCategory(cat.value)}
                                        className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 flex-shrink-0 min-h-[44px] ${isActive
                                                ? 'bg-gray-900 text-white shadow-md'
                                                : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'
                                            }`}
                                    >
                                        <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#F39C12]' : 'text-gray-400'}`} />
                                        {cat.label}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="flex flex-col gap-3 w-full">
                        <div className="relative w-full">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#F39C12] outline-none font-medium transition-shadow shadow-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Mobile Sort */}
                        <div className="sm:hidden w-full">
                            <button
                                onClick={() => toggleSort('name')}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl font-bold text-xs text-gray-600 shadow-sm"
                            >
                                <ArrowUpDown className="w-3.5 h-3.5" />
                                Sort
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Data Table / Card View Area */}
            <div className="bg-white rounded-xl sm:rounded-[2.5rem] border border-gray-100 shadow-2xl overflow-hidden">

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-5 text-left w-4">
                                    <input
                                        type="checkbox"
                                        checked={selectedItems.length === currentItems.length && currentItems.length > 0}
                                        onChange={() => {
                                            if (selectedItems.length === currentItems.length) {
                                                setSelectedItems([])
                                            } else {
                                                setSelectedItems(currentItems.map(i => i.id))
                                            }
                                        }}
                                        className="rounded border-gray-300 text-[#F39C12] focus:ring-[#F39C12] w-4 h-4 cursor-pointer"
                                    />
                                </th>
                                {[
                                    { id: 'name', label: 'Item Name' },
                                    { id: 'category', label: 'Category' },
                                    { id: 'location', label: 'Location' },
                                    { id: 'condition', label: 'Condition' },
                                    { id: 'quantity', label: 'Qty' },
                                    { id: 'value', label: 'Value ($)' },
                                    { id: 'actions', label: '' }
                                ].map((header) => (
                                    <th
                                        key={header.id}
                                        onClick={() => header.id !== 'actions' && header.id !== 'category' && header.id !== 'condition' ? toggleSort(header.id as any) : null}
                                        className={`px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap ${header.id !== 'actions' && header.id !== 'category' && header.id !== 'condition' ? 'cursor-pointer hover:text-gray-600 transition-colors group' : ''}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            {header.label}
                                            {sortBy === header.id && (
                                                <ArrowUpDown className={`w-3 h-3 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {currentItems.length > 0 ? (
                                currentItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50/50 transition-all group">
                                        <td className="px-6 py-5">
                                            <input
                                                type="checkbox"
                                                checked={selectedItems.includes(item.id)}
                                                onChange={() => toggleItemSelection(item.id)}
                                                className="rounded border-gray-300 text-[#F39C12] focus:ring-[#F39C12] w-4 h-4 cursor-pointer"
                                            />
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 shrink-0 rounded-xl bg-orange-50 text-[#F39C12] flex items-center justify-center font-black text-lg border border-orange-100">
                                                    {item.name[0]}
                                                </div>
                                                <div className="text-sm font-bold text-gray-900">{item.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-md uppercase tracking-wide">
                                                {item.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                                {item.location}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <ConditionBadge condition={item.condition} />
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-gray-900">
                                            {item.quantity}
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-gray-900">
                                            ${item.value.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-5 text-right whitespace-nowrap">
                                            <button
                                                onClick={() => setEditingItem(item)}
                                                className="text-gray-400 hover:text-[#F39C12] p-2 rounded-lg hover:bg-orange-50 transition-all active:scale-90"
                                            >
                                                <Edit className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center gap-4">
                                            <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center border-2 border-dashed border-gray-200">
                                                <Package className="w-10 h-10 text-gray-200" />
                                            </div>
                                            <div>
                                                <p className="text-xl font-black text-gray-900 mb-1">No Items Found</p>
                                                <p className="text-sm text-gray-400 font-medium">Try adjusting your filters or search terms</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View - Matches Lessons Page Mobile View */}
                <div className="md:hidden space-y-3 p-4 sm:p-5">
                    {currentItems.length > 0 ? currentItems.map((item) => (
                        <div key={item.id} className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
                            <div className="flex items-start justify-between">
                                <div className="flex flex-col">
                                    <span className="text-sm font-black text-gray-900 leading-tight mb-1">{item.name}</span>
                                    <span className="text-xs text-gray-500 font-semibold flex items-center gap-1.5">
                                        <MapPin className="w-3 h-3" />
                                        {item.location}
                                    </span>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={selectedItems.includes(item.id)}
                                    onChange={() => toggleItemSelection(item.id)}
                                    className="rounded border-gray-300 text-[#F39C12] focus:ring-[#F39C12] w-5 h-5 ml-2"
                                />
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center text-[#F39C12] text-xs font-black border border-orange-200">
                                    {item.name[0]}
                                </div>
                                <div className="flex-1">
                                    <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-0.5">Value</div>
                                    <div className="text-sm font-black text-gray-900">${item.value.toLocaleString()}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-0.5">Qty</div>
                                    <div className="text-sm font-black text-gray-900">{item.quantity}</div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-md uppercase tracking-wide">
                                        {item.category}
                                    </span>
                                    <ConditionBadge condition={item.condition} />
                                </div>
                            </div>

                            <div className="flex items-center justify-end pt-4 border-t border-gray-50">
                                <button
                                    onClick={() => setEditingItem(item)}
                                    className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-[#F39C12] uppercase tracking-wider transition-colors"
                                >
                                    <Edit className="w-4 h-4" />
                                    Edit Item
                                </button>
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

                {/* Pagination - Matches Lessons Page Pagination */}
                <div className="p-4 sm:p-6 border-t border-gray-100 bg-gray-50/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs sm:text-sm text-gray-600 font-semibold text-center sm:text-left">
                        <span className="font-black text-gray-900">{filteredItems.length > 0 ? startIndex + 1 : 0}</span> to <span className="font-black text-gray-900">{Math.min(startIndex + itemsPerPage, filteredItems.length)}</span> of <span className="font-black text-gray-900">{filteredItems.length}</span>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-2 sm:p-2.5 border border-gray-200 rounded-xl bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-90 shadow-sm"
                        >
                            <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                        <span className="px-3 sm:px-5 py-2 sm:py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-black text-gray-700 shadow-sm whitespace-nowrap">
                            {currentPage} / {totalPages || 1}
                        </span>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="p-2 sm:p-2.5 border border-gray-200 rounded-xl bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-90 shadow-sm"
                        >
                            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {(showAddModal || editingItem) && (
                    <div
                        className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300"
                        onClick={() => {
                            setShowAddModal(false)
                            setEditingItem(null)
                        }}
                    >
                        <div
                            className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in slide-in-from-top-4 duration-300 ring-1 ring-black/5"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
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

                            {/* Modal Content */}
                            <form className="p-8 sm:p-10 space-y-6 overflow-y-auto max-h-[60vh]">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Item Name</label>
                                    <input
                                        type="text"
                                        defaultValue={editingItem?.name}
                                        className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#F39C12] outline-none font-bold text-gray-900 text-sm"
                                        placeholder="e.g. Yamaha Piano"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
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
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Quantity</label>
                                        <input
                                            type="number"
                                            defaultValue={editingItem?.quantity || 1}
                                            className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#F39C12] outline-none font-bold text-gray-900 text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Value ($)</label>
                                        <input
                                            type="number"
                                            defaultValue={editingItem?.value}
                                            className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#F39C12] outline-none font-bold text-gray-900 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Condition</label>
                                        <select
                                            defaultValue={editingItem?.condition || 'good'}
                                            className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#F39C12] outline-none font-bold text-gray-900 text-sm"
                                        >
                                            <option value="excellent">Excellent</option>
                                            <option value="good">Good</option>
                                            <option value="fair">Fair</option>
                                            <option value="needs-repair">Needs Repair</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Location</label>
                                    <input
                                        type="text"
                                        defaultValue={editingItem?.location}
                                        className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#F39C12] outline-none font-bold text-gray-900 text-sm"
                                        placeholder="Room or Shelf ID"
                                    />
                                </div>
                            </form>

                            {/* Modal Footer */}
                            <div className="px-10 pb-10 flex gap-4">
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
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
