'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/contexts/UserContext'
import { useInvoices } from '@/hooks/useDashboardData'
import api from '@/services/api'
import { toast } from 'react-hot-toast'
import {
    DollarSign,
    Plus,
    X,
    Loader2,
    AlertCircle,
    CheckCircle2,
    Clock,
    TrendingUp,
    Download,
    Send,
    Trash2,
    FileText,
    Printer,
    User
} from 'lucide-react'

interface Invoice {
    id: string
    invoice_number: string
    total_amount: number | string
    due_date: string
    status: 'paid' | 'pending' | 'overdue' | 'draft' | 'sent' | 'partial' | 'cancelled'
    line_items: Array<{
        id: string
        description: string
        quantity: number
        unit_price: number | string
        total_price: number | string
    }>
    student_name?: string
    band_name?: string
}

export default function BillingPage() {
    const { currentUser } = useUser()
    const { invoices, loading } = useInvoices()
    const [selectedInvoices, setSelectedInvoices] = useState<string[]>([])
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null)
    const [students, setStudents] = useState<any[]>([])
    const [newInvoice, setNewInvoice] = useState({
        student: '',
        dueDate: new Date().toISOString().split('T')[0],
        line_items: [{ description: '', quantity: 1, unit_price: '' }]
    })

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setShowCreateModal(false)
                setViewingInvoice(null)
            }
        }
        window.addEventListener('keydown', handleEsc)
        return () => window.removeEventListener('keydown', handleEsc)
    }, [])

    useEffect(() => {
        if (showCreateModal) {
            api.get('/core/students/')
                .then(res => setStudents(res.data.results || (Array.isArray(res.data) ? res.data : [])))
                .catch(err => console.error('Failed to fetch students', err))
        }
    }, [showCreateModal])

    const handleCreateInvoice = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await api.post('/billing/invoices/', {
                student: newInvoice.student,
                due_date: newInvoice.dueDate,
                status: 'sent',
                line_items: newInvoice.line_items.map(item => ({
                    ...item,
                    unit_price: Number(item.unit_price)
                }))
            })
            setShowCreateModal(false)
            setNewInvoice({
                student: '',
                dueDate: new Date().toISOString().split('T')[0],
                line_items: [{ description: '', quantity: 1, unit_price: '' }]
            })
            toast.success('Invoice created successfully!')
            window.location.reload()
        } catch (error) {
            console.error('Create invoice failed', error)
            toast.error('Failed to create invoice')
        }
    }

    const addLineItem = () => {
        if (newInvoice.line_items.length >= 10) {
            toast.error('Limit of 10 items per invoice reached')
            return
        }
        setNewInvoice(prev => ({
            ...prev,
            line_items: [...prev.line_items, { description: '', quantity: 1, unit_price: '' }]
        }))
    }

    const removeLineItem = (index: number) => {
        if (newInvoice.line_items.length <= 1) return
        setNewInvoice(prev => ({
            ...prev,
            line_items: prev.line_items.filter((_, i) => i !== index)
        }))
    }

    const updateLineItem = (index: number, field: string, value: any) => {
        setNewInvoice(prev => {
            const newItems = [...prev.line_items]
            newItems[index] = { ...newItems[index], [field]: value }
            return { ...prev, line_items: newItems }
        })
    }

    const modalTotal = newInvoice.line_items.reduce((sum, item) => {
        return sum + (Number(item.quantity) * Number(item.unit_price) || 0)
    }, 0)

    const handlePayInvoice = async (invoiceId: string) => {
        const toastId = toast.loading('Initializing secure checkout...')
        try {
            const res = await api.post(`/billing/create-checkout-session/${invoiceId}/`)
            if (res.data.url) {
                window.location.href = res.data.url
            } else {
                toast.error('Failed to start payment', { id: toastId })
            }
        } catch (error) {
            console.error(error)
            toast.error('Payment initialization failed', { id: toastId })
        }
    }

    const handleDownloadInvoice = (invoice: Invoice) => {
        // For now, we use browser print functionality for a clean PDF download
        setViewingInvoice(invoice)
        setTimeout(() => {
            window.print()
        }, 500)
    }

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            paid: 'bg-green-50 text-green-700 border-green-200',
            pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
            overdue: 'bg-red-50 text-red-700 border-red-200',
            draft: 'bg-gray-50 text-gray-700 border-gray-200',
            sent: 'bg-blue-50 text-blue-700 border-blue-200',
        }

        const style = styles[status] || 'bg-gray-50 text-gray-700 border-gray-200'

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${style}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        )
    }

    const toggleInvoice = (id: string) => {
        setSelectedInvoices(prev =>
            prev.includes(id) ? prev.filter(iid => iid !== id) : [...prev, id]
        )
    }

    const typedInvoices = invoices as Invoice[]

    // Calculate totals
    const totalRevenue = typedInvoices
        .filter(i => i.status === 'paid')
        .reduce((sum, i) => sum + Number(i.total_amount), 0)

    const pendingAmount = typedInvoices
        .filter(i => ['pending', 'sent'].includes(i.status))
        .reduce((sum, i) => sum + Number(i.total_amount), 0)

    const overdueAmount = typedInvoices
        .filter(i => i.status === 'overdue')
        .reduce((sum, i) => sum + Number(i.total_amount), 0)

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                <Loader2 className="w-10 h-10 text-[#1ABC9C] animate-spin mb-4" />
                <p className="text-gray-500 font-bold tracking-[0.2em] uppercase text-xs">Loading Billing...</p>
            </div>
        )
    }

    // Role Check for Manager View
    const isManager = currentUser && ['admin', 'teacher'].includes(currentUser.role)

    return (
        <>
            <div className="max-w-7xl mx-auto px-4 pb-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight">Billing & Invoices</h1>
                        <p className="text-sm md:text-lg text-gray-500 mt-1 md:mt-2 font-medium">
                            {isManager ? 'Manage invoices and track payments' : 'My Invoices & Payments'}
                        </p>
                    </div>
                    {isManager && (
                        <div className="flex flex-wrap gap-2 md:gap-3">
                            <button className="px-4 md:px-5 py-2.5 md:py-3 bg-[#2C3E50] text-white rounded-xl hover:bg-[#34495E] transition-all shadow-lg text-sm font-bold flex items-center gap-2 active:scale-95">
                                <Send className="w-4 h-4" />
                                <span className="hidden sm:inline">Send Reminders</span>
                                <span className="sm:hidden">Reminders</span>
                            </button>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="px-4 md:px-5 py-2.5 md:py-3 bg-[#1ABC9C] text-white rounded-xl hover:bg-[#16A085] transition-all shadow-lg text-sm font-bold flex items-center gap-2 hover:scale-105 active:scale-95"
                            >
                                <Plus className="w-4 h-4" />
                                <span className="hidden sm:inline">Create Invoice</span>
                                <span className="sm:hidden">Create</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl relative overflow-hidden group hover:-translate-y-1 transition-all">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100/30 to-transparent rounded-bl-[4rem] group-hover:scale-150 transition-transform duration-500" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-50 rounded-2xl flex items-center justify-center border border-green-200 shadow-inner">
                                    <CheckCircle2 className="w-7 h-7 text-green-600" />
                                </div>
                                <TrendingUp className="w-5 h-5 text-green-500" />
                            </div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Total Revenue</p>
                            <p className="text-3xl font-black text-green-600">${totalRevenue.toFixed(2)}</p>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl relative overflow-hidden group hover:-translate-y-1 transition-all">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-100/30 to-transparent rounded-bl-[4rem] group-hover:scale-150 transition-transform duration-500" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-2xl flex items-center justify-center border border-yellow-200 shadow-inner">
                                    <Clock className="w-7 h-7 text-yellow-600" />
                                </div>
                            </div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Pending</p>
                            <p className="text-3xl font-black text-yellow-600">${pendingAmount.toFixed(2)}</p>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl relative overflow-hidden group hover:-translate-y-1 transition-all">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-100/30 to-transparent rounded-bl-[4rem] group-hover:scale-150 transition-transform duration-500" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-red-100 to-red-50 rounded-2xl flex items-center justify-center border border-red-200 shadow-inner">
                                    <AlertCircle className="w-7 h-7 text-red-600" />
                                </div>
                            </div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Overdue</p>
                            <p className="text-3xl font-black text-red-600">${overdueAmount.toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                {/* Invoices Table - Desktop Only */}
                <div className="hidden md:block bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50/50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-5 text-left w-4">
                                        <input type="checkbox" className="rounded border-gray-300 text-[#1ABC9C] focus:ring-[#1ABC9C] w-4 h-4" />
                                    </th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                        Invoice #
                                    </th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                        Amount
                                    </th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                        Due Date
                                    </th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                        Status
                                    </th>
                                    <th className="px-6 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {typedInvoices.length > 0 ? typedInvoices.map((invoice) => (
                                    <tr key={invoice.id} className="hover:bg-gray-50/50 transition-all group">
                                        <td className="px-6 py-5">
                                            <input
                                                type="checkbox"
                                                checked={selectedInvoices.includes(invoice.id)}
                                                onChange={() => toggleInvoice(invoice.id)}
                                                className="rounded border-gray-300 text-[#1ABC9C] focus:ring-[#1ABC9C] w-4 h-4"
                                            />
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="text-sm font-black text-gray-900">{invoice.invoice_number}</div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="text-sm font-black text-gray-900">${Number(invoice.total_amount).toFixed(2)}</div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="text-sm text-gray-600 font-semibold">{invoice.due_date}</div>
                                        </td>
                                        <td className="px-6 py-5">
                                            {getStatusBadge(invoice.status)}
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                                                    <button
                                                        onClick={() => handlePayInvoice(invoice.id)}
                                                        className="px-4 py-2 text-sm bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all font-bold shadow-md hover:shadow-lg active:scale-90 flex items-center gap-2"
                                                    >
                                                        <DollarSign className="w-4 h-4" />
                                                        Pay
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setViewingInvoice(invoice)}
                                                    className="px-4 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-bold text-gray-700 active:scale-90"
                                                >
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => handleDownloadInvoice(invoice)}
                                                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all active:scale-90"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center justify-center gap-4">
                                                <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center border-2 border-dashed border-gray-200">
                                                    <DollarSign className="w-10 h-10 text-gray-200" />
                                                </div>
                                                <div>
                                                    <p className="text-xl font-black text-gray-900 mb-1">The Big Money!</p>
                                                    <p className="text-sm text-gray-400 font-medium">Create your first invoice to get started</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Invoices Cards - Mobile Only */}
                <div className="md:hidden space-y-4">
                    {typedInvoices.length > 0 ? typedInvoices.map((invoice) => (
                        <div key={invoice.id} className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
                            {/* Card Header */}
                            <div className="px-4 py-3 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={selectedInvoices.includes(invoice.id)}
                                        onChange={() => toggleInvoice(invoice.id)}
                                        className="rounded border-gray-300 text-[#1ABC9C] focus:ring-[#1ABC9C] w-4 h-4"
                                    />
                                    <div>
                                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Invoice</div>
                                        <div className="text-sm font-black text-gray-900">{invoice.invoice_number}</div>
                                    </div>
                                </div>
                                {getStatusBadge(invoice.status)}
                            </div>

                            {/* Card Body */}
                            <div className="px-4 py-4 space-y-3">
                                {/* Amount */}
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Amount</span>
                                    <span className="text-lg font-black text-gray-900">${Number(invoice.total_amount).toFixed(2)}</span>
                                </div>

                                {/* Due Date */}
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Due Date</span>
                                    <span className="text-sm text-gray-600 font-semibold">{invoice.due_date}</span>
                                </div>
                            </div>

                            {/* Card Actions */}
                            <div className="px-4 py-3 bg-gray-50/30 border-t border-gray-100 flex items-center gap-2">
                                {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                                    <button
                                        onClick={() => handlePayInvoice(invoice.id)}
                                        className="flex-1 px-4 py-2.5 text-sm bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all font-bold shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <DollarSign className="w-4 h-4" />
                                        Pay Now
                                    </button>
                                )}
                                <button
                                    onClick={() => setViewingInvoice(invoice)}
                                    className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-bold text-gray-700 active:scale-95"
                                >
                                    View
                                </button>
                                <button
                                    onClick={() => handleDownloadInvoice(invoice)}
                                    className="p-2.5 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 border border-gray-200 transition-all active:scale-95"
                                >
                                    <Download className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-8">
                            <div className="flex flex-col items-center justify-center gap-4">
                                <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-200">
                                    <DollarSign className="w-10 h-10 text-gray-200" />
                                </div>
                                <div className="text-center">
                                    <p className="text-xl font-black text-gray-900 mb-1">The Big Money!</p>
                                    <p className="text-sm text-gray-400 font-medium">Create your first invoice to get started</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Create Invoice Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-300 antialiased" onClick={() => setShowCreateModal(false)}>
                        <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in slide-in-from-top-4 duration-300 ring-1 ring-black/5" onClick={(e) => e.stopPropagation()}>
                            <div className="px-10 py-8 bg-[#2C3E50] text-white flex items-center justify-between ring-1 ring-white/10 shrink-0">
                                <div>
                                    <h2 className="text-3xl font-black tracking-tight">Create New Invoice</h2>
                                    <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Generate Billing Statement</p>
                                </div>
                                <button onClick={() => setShowCreateModal(false)} className="w-12 h-12 rounded-2xl hover:bg-white/10 flex items-center justify-center transition-colors">
                                    <X className="w-7 h-7" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                                <form onSubmit={handleCreateInvoice} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Student *</label>
                                            <select
                                                required
                                                value={newInvoice.student}
                                                onChange={(e) => setNewInvoice({ ...newInvoice, student: e.target.value })}
                                                className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#1ABC9C] outline-none font-bold text-gray-900 text-sm"
                                            >
                                                <option value="">Select student</option>
                                                {students.map(student => (
                                                    <option key={student.id} value={student.id}>
                                                        {student.user?.first_name} {student.user?.last_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Due Date *</label>
                                            <input
                                                type="date"
                                                required
                                                value={newInvoice.dueDate}
                                                onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
                                                className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#1ABC9C] outline-none font-bold text-gray-900 text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                Items & Services ({newInvoice.line_items.length}/10)
                                            </label>
                                            <button
                                                type="button"
                                                onClick={addLineItem}
                                                disabled={newInvoice.line_items.length >= 10}
                                                className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1 transition-all ${newInvoice.line_items.length >= 10
                                                    ? 'text-gray-300 cursor-not-allowed'
                                                    : 'text-[#1ABC9C] hover:text-[#16A085]'
                                                    }`}
                                            >
                                                <Plus className="w-3 h-3" />
                                                Add Item
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            {newInvoice.line_items.map((item, index) => (
                                                <div key={index} className="grid grid-cols-12 gap-3 items-end group animate-in slide-in-from-left-2 duration-200">
                                                    <div className="col-span-12 md:col-span-6 space-y-1">
                                                        <input
                                                            type="text"
                                                            required
                                                            value={item.description}
                                                            onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                                                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#1ABC9C] outline-none font-bold text-gray-900 text-sm shadow-sm"
                                                            placeholder="Description"
                                                        />
                                                    </div>
                                                    <div className="col-span-4 md:col-span-2 space-y-1">
                                                        <input
                                                            type="number"
                                                            required
                                                            value={item.quantity}
                                                            onChange={(e) => updateLineItem(index, 'quantity', e.target.value)}
                                                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#1ABC9C] outline-none font-bold text-gray-900 text-sm shadow-sm"
                                                            placeholder="Qty"
                                                            min="1"
                                                        />
                                                    </div>
                                                    <div className="col-span-5 md:col-span-3 space-y-1">
                                                        <input
                                                            type="number"
                                                            required
                                                            value={item.unit_price}
                                                            onChange={(e) => updateLineItem(index, 'unit_price', e.target.value)}
                                                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#1ABC9C] outline-none font-bold text-gray-900 text-sm shadow-sm"
                                                            placeholder="Price"
                                                            min="0"
                                                            step="0.01"
                                                        />
                                                    </div>
                                                    <div className="col-span-3 md:col-span-1 pb-3 flex justify-end">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeLineItem(index)}
                                                            disabled={newInvoice.line_items.length <= 1}
                                                            className="text-gray-300 hover:text-red-500 disabled:opacity-0 transition-colors"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-gray-100 flex flex-col items-end gap-2">
                                        <div className="flex items-center gap-10 text-gray-400">
                                            <span className="text-[10px] font-black uppercase tracking-widest">Total Amount</span>
                                            <span className="text-2xl font-black text-[#2C3E50]">${modalTotal.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-6">
                                        <button
                                            type="button"
                                            onClick={() => setShowCreateModal(false)}
                                            className="flex-1 px-8 py-4 border-2 border-gray-100 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all active:scale-95"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-[2] px-8 py-4 bg-[#1ABC9C] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#16A085] transition-all shadow-xl active:scale-95"
                                        >
                                            Create Invoice
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
                {/* View Invoice Modal */}
                {viewingInvoice && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-300 print:p-0 print:bg-white antialiased" onClick={() => setViewingInvoice(null)}>
                        <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 ring-1 ring-black/5 print:shadow-none print:rounded-none" onClick={(e) => e.stopPropagation()}>
                            <div className="bg-[#2C3E50] p-10 text-white flex justify-between items-start print:text-black print:bg-white print:border-b print:p-6 ring-1 ring-white/10 shrink-0">
                                <div>
                                    <h2 className="text-3xl font-black mb-1 text-white">Invoice</h2>
                                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] print:text-gray-500">
                                        Reference: {viewingInvoice.invoice_number}
                                    </p>
                                </div>
                                <div className="flex gap-2 print:hidden">
                                    <button
                                        onClick={() => window.print()}
                                        className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"
                                        title="Print Invoice"
                                    >
                                        <Printer className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => setViewingInvoice(null)}
                                        className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-10 space-y-10 print:p-6 custom-scrollbar">
                                <div className="grid grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Billed To</p>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                                                    <User className="w-5 h-5 text-gray-400" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-gray-900">{viewingInvoice.student_name || viewingInvoice.band_name || 'Valued Client'}</p>
                                                    <p className="text-sm text-gray-500 font-medium">Student / Band</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4 text-right">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Due Date</p>
                                            <p className="font-black text-gray-900">{viewingInvoice.due_date}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Status</p>
                                            {getStatusBadge(viewingInvoice.status)}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</p>
                                    <div className="border border-gray-100 rounded-[2rem] overflow-hidden">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50/50">
                                                <tr>
                                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Service</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Qty</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Unit</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {viewingInvoice.line_items?.map((item, idx) => (
                                                    <tr key={idx}>
                                                        <td className="px-6 py-4">
                                                            <p className="font-bold text-gray-900 text-sm">{item.description}</p>
                                                        </td>
                                                        <td className="px-6 py-4 text-center font-bold text-gray-600 text-sm">
                                                            {item.quantity}
                                                        </td>
                                                        <td className="px-6 py-4 text-right font-bold text-gray-600 text-sm">
                                                            ${Number(item.unit_price).toFixed(2)}
                                                        </td>
                                                        <td className="px-6 py-4 text-right font-black text-gray-900 text-sm">
                                                            ${Number(item.total_price || (item.quantity * Number(item.unit_price))).toFixed(2)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="pt-10 border-t border-gray-100 flex justify-between items-center">
                                    <div className="text-gray-400">
                                        <p className="text-[8px] font-bold uppercase tracking-widest">Payments are processed securely via Stripe</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Amount Due</p>
                                        <p className="text-4xl font-black text-[#2C3E50]">${Number(viewingInvoice.total_amount).toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 bg-gray-50 flex gap-4 print:hidden shrink-0">
                                <button
                                    onClick={() => setViewingInvoice(null)}
                                    className="flex-1 py-4 bg-white border border-gray-200 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-400 hover:bg-gray-100 transition-all active:scale-95"
                                >
                                    Close
                                </button>
                                {viewingInvoice.status !== 'paid' && (
                                    <button
                                        onClick={() => handlePayInvoice(viewingInvoice.id)}
                                        className="flex-[2] py-4 bg-[#1ABC9C] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#16A085] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <DollarSign className="w-4 h-4" />
                                        Pay Now
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}
