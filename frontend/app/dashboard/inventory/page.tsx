'use client'

import { useState } from 'react'
import {
    Plus, Search, Package, Music, BookOpen, Headphones,
    Edit, X, MapPin, ChevronLeft, ChevronRight, Filter
} from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
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
    const [currentPage, setCurrentPage] = useState(1)
    const [showAddModal, setShowAddModal] = useState(false)
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)

    const itemsPerPage = 10

    const categories = [
        { value: 'all', label: 'All', icon: Package },
        { value: 'instrument', label: 'Instruments', icon: Music },
        { value: 'equipment', label: 'Equipment', icon: Headphones },
        { value: 'sheet-music', label: 'Sheet Music', icon: BookOpen },
    ]

    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.location.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = filterCategory === 'all' || item.category === filterCategory
        return matchesSearch && matchesCategory
    })

    const totalPages = Math.ceil(filteredItems.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const currentItems = filteredItems.slice(startIndex, startIndex + itemsPerPage)

    const totalValue = items.reduce((acc, i) => acc + i.value, 0)
    const lowStock = items.filter(i => i.quantity <= 2).length
    const needsRepair = items.filter(i => i.condition === 'needs-repair').length

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
            <span className={`px-2 py-1 rounded-lg text-xs font-bold border ${style}`}>
                {label}
            </span>
        )
    }

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 pb-12 space-y-4 sm:space-y-6 overflow-x-hidden">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2">
                <div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Inventory</h1>
                    <p className="text-[10px] sm:text-xs md:text-sm text-gray-500 mt-0.5 font-medium uppercase tracking-wide">Manage your studio equipment</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => {
                            setEditingItem(null)
                            setShowAddModal(true)
                        }}
                        className="w-full sm:w-auto px-4 py-2 bg-[#F39C12] text-white rounded-lg hover:bg-[#E67E22] transition-all shadow-md text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Item</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards - Responsive Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                <div className="bg-white p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div className="text-[8px] sm:text-[9px] font-black text-gray-400 uppercase tracking-wide mb-0.5 sm:mb-1">Items</div>
                    <div className="text-lg sm:text-xl md:text-2xl font-black text-gray-900">{items.length}</div>
                </div>

                <div className="bg-white p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div className="text-[8px] sm:text-[9px] font-black text-gray-400 uppercase tracking-wide mb-0.5 sm:mb-1">Value</div>
                    <div className="text-lg sm:text-xl md:text-2xl font-black text-gray-900">${totalValue.toLocaleString()}</div>
                </div>

                <div className="bg-white p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div className="text-[8px] sm:text-[9px] font-black text-gray-400 uppercase tracking-wide mb-0.5 sm:mb-1">Low Stock</div>
                    <div className="text-lg sm:text-xl md:text-2xl font-black text-orange-600">{lowStock}</div>
                </div>

                <div className="bg-white p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div className="text-[8px] sm:text-[9px] font-black text-gray-400 uppercase tracking-wide mb-0.5 sm:mb-1">Repairs</div>
                    <div className="text-lg sm:text-xl md:text-2xl font-black text-red-600">{needsRepair}</div>
                </div>
            </div>

            {/* Filters & Controls Container */}
            <div className="bg-white p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border border-gray-100 shadow-md space-y-2 sm:space-y-3">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">

                    {/* Category Filter Pills - Horizontal Scroll */}
                    <div className="w-full overflow-hidden">
                        <div className="flex p-1 bg-gray-50 rounded-xl border border-gray-100 overflow-x-auto w-full scrollbar-hide">
                            {categories.map(cat => {
                                const Icon = cat.icon
                                const isActive = filterCategory === cat.value
                                return (
                                    <button
                                        key={cat.value}
                                        onClick={() => setFilterCategory(cat.value)}
                                        className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 flex-shrink-0 ${isActive
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700'
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
                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                        <div className="relative w-full sm:w-auto flex-1">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full sm:w-64 pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#F39C12] outline-none font-medium transition-shadow shadow-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Items List */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {currentItems.length > 0 ? currentItems.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-[#F39C12] font-bold">
                                                {item.name[0]}
                                            </div>
                                            <div className="font-medium text-gray-900">{item.name}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-600 capitalize">{item.category.replace('-', ' ')}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                            <MapPin className="w-4 h-4" />
                                            {item.location}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <ConditionBadge condition={item.condition} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {item.quantity}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        ${item.value.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <button
                                            onClick={() => setEditingItem(item)}
                                            className="text-gray-400 hover:text-[#F39C12] transition-colors"
                                        >
                                            <Edit className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <Package className="w-12 h-12 text-gray-300" />
                                            <p className="text-gray-500 font-medium">No items found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-gray-200">
                    {currentItems.length > 0 ? currentItems.map((item) => (
                        <div key={item.id} className="p-4 space-y-3">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3 flex-1">
                                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-[#F39C12] font-bold text-lg shrink-0">
                                        {item.name[0]}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                                        <p className="text-sm text-gray-500 capitalize">{item.category.replace('-', ' ')}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setEditingItem(item)}
                                    className="text-gray-400 hover:text-[#F39C12] p-2 shrink-0"
                                >
                                    <Edit className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <p className="text-gray-500 text-xs">Location</p>
                                    <p className="text-gray-900 font-medium flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        {item.location}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs">Quantity</p>
                                    <p className="text-gray-900 font-medium">{item.quantity}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs">Value</p>
                                    <p className="text-gray-900 font-medium">${item.value.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs mb-1">Condition</p>
                                    <ConditionBadge condition={item.condition} />
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="p-12 text-center">
                            <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                            <p className="text-gray-500 font-medium">No items found</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                <div className="p-4 sm:p-6 border-t border-gray-100 bg-gray-50/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs sm:text-sm text-gray-600 font-semibold text-center sm:text-left">
                        <span className="font-black text-gray-900">{filteredItems.length > 0 ? startIndex + 1 : 0}</span> to <span className="font-black text-gray-900">{Math.min(startIndex + itemsPerPage, filteredItems.length)}</span> of <span className="font-black text-gray-900">{filteredItems.length}</span>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-2 sm:p-2.5 border border-gray-200 rounded-xl bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-90 shadow-sm"
                        >
                            <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                        <span className="px-3 sm:px-5 py-2 sm:py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-black text-gray-700 shadow-sm whitespace-nowrap">
                            {currentPage} / {totalPages || 1}
                        </span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
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
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => {
                            setShowAddModal(false)
                            setEditingItem(null)
                        }}
                    >
                        <div
                            className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="px-6 py-4 bg-gray-900 text-white flex justify-between items-center">
                                <h3 className="text-lg font-bold">
                                    {editingItem ? 'Edit Item' : 'Add New Item'}
                                </h3>
                                <button
                                    onClick={() => {
                                        setShowAddModal(false)
                                        setEditingItem(null)
                                    }}
                                    className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form className="p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                                    <input
                                        type="text"
                                        defaultValue={editingItem?.name}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F39C12] focus:border-transparent outline-none"
                                        placeholder="e.g. Yamaha Piano"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                        <select
                                            defaultValue={editingItem?.category || 'instrument'}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F39C12] focus:border-transparent outline-none"
                                        >
                                            <option value="instrument">Instrument</option>
                                            <option value="equipment">Equipment</option>
                                            <option value="sheet-music">Sheet Music</option>
                                            <option value="accessories">Accessories</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                                        <input
                                            type="number"
                                            defaultValue={editingItem?.quantity || 1}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F39C12] focus:border-transparent outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Value ($)</label>
                                        <input
                                            type="number"
                                            defaultValue={editingItem?.value}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F39C12] focus:border-transparent outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                                        <select
                                            defaultValue={editingItem?.condition || 'good'}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F39C12] focus:border-transparent outline-none"
                                        >
                                            <option value="excellent">Excellent</option>
                                            <option value="good">Good</option>
                                            <option value="fair">Fair</option>
                                            <option value="needs-repair">Needs Repair</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                    <input
                                        type="text"
                                        defaultValue={editingItem?.location}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F39C12] focus:border-transparent outline-none"
                                        placeholder="Room or shelf location"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                    <textarea
                                        defaultValue={editingItem?.notes}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F39C12] focus:border-transparent outline-none resize-none"
                                        placeholder="Additional notes..."
                                    />
                                </div>
                            </form>

                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddModal(false)
                                        setEditingItem(null)
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors"
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
                                    className="flex-1 px-4 py-2 bg-[#F39C12] text-white rounded-lg font-medium hover:bg-[#E67E22] transition-colors"
                                >
                                    {editingItem ? 'Update' : 'Add'} Item
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
