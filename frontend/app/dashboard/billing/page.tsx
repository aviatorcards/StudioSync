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
    Download,
    Send,
    Trash2,
    FileText,
    Search,
    Filter,
    Calendar,
    Eye,
    Mail,
    Receipt,
    ChevronRight,
    ArrowUpRight,
    CreditCard
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogHeader, DialogContent, DialogFooter } from '@/components/ui/dialog'

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
    created_at?: string
}

export default function BillingPage() {
    const { currentUser } = useUser()
    const { invoices, loading, refetch } = useInvoices()
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null)
    const [students, setStudents] = useState<any[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [filterStatus, setFilterStatus] = useState<string>('all')
    const [creating, setCreating] = useState(false)

    const [newInvoice, setNewInvoice] = useState({
        student: '',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        line_items: [{ description: '', quantity: 1, unit_price: '' }]
    })

    useEffect(() => {
        if (showCreateModal) {
            api.get('/core/students/')
                .then(res => setStudents(res.data.results || (Array.isArray(res.data) ? res.data : [])))
                .catch(err => console.error('Failed to fetch students', err))
        }
    }, [showCreateModal])

    const handleCreateInvoice = async (e: React.FormEvent) => {
        e.preventDefault()
        setCreating(true)

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
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                line_items: [{ description: '', quantity: 1, unit_price: '' }]
            })
            toast.success('Invoice created successfully!')
            refetch()
        } catch (error) {
            console.error('Create invoice failed', error)
            toast.error('Failed to create invoice')
        } finally {
            setCreating(false)
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
        const toastId = toast.loading('Starting checkout...')
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

    const handleSendReminder = async (invoiceId: string) => {
        try {
            await api.post(`/billing/invoices/${invoiceId}/send_reminder/`)
            toast.success('Reminder sent successfully')
        } catch (error) {
            toast.error('Failed to send reminder')
        }
    }

    const handleDeleteInvoice = async (invoiceId: string) => {
        if (!confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
            return
        }

        try {
            await api.delete(`/billing/invoices/${invoiceId}/`)
            toast.success('Invoice deleted successfully')
            refetch()
        } catch (error) {
            console.error('Failed to delete invoice', error)
            toast.error('Failed to delete invoice')
        }
    }

    const handleDownloadInvoice = (invoice: Invoice) => {
        setViewingInvoice(invoice)
        setTimeout(() => window.print(), 500)
    }

    const getStatusColor = (status: string) => {
        const styles: Record<string, string> = {
            paid: 'bg-green-50 text-green-600 border-green-100',
            pending: 'bg-yellow-50 text-yellow-600 border-yellow-100',
            overdue: 'bg-red-50 text-red-600 border-red-100',
            draft: 'bg-gray-50 text-gray-500 border-gray-100',
            sent: 'bg-blue-50 text-blue-600 border-blue-100',
        }
        return styles[status] || 'bg-gray-50 text-gray-500 border-gray-100'
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'paid': return <CheckCircle2 className="w-3 h-3" />
            case 'overdue': return <AlertCircle className="w-3 h-3" />
            case 'pending':
            case 'sent': return <Clock className="w-3 h-3" />
            default: return <FileText className="w-3 h-3" />
        }
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

    // Filter invoices
    const filteredInvoices = typedInvoices.filter(invoice => {
        const matchesSearch = invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            invoice.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            invoice.band_name?.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus
        return matchesSearch && matchesStatus
    })

    const statusFilters = [
        { value: 'all', label: 'All' },
        { value: 'sent', label: 'Sent' },
        { value: 'pending', label: 'Pending' },
        { value: 'paid', label: 'Paid' },
        { value: 'overdue', label: 'Overdue' }
    ]

    const isManager = currentUser && ['admin', 'teacher'].includes(currentUser.role)

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-in fade-in duration-500">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading Billing...</p>
            </div>
        )
    }

    return (
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4">
                <div className="space-y-2">
                    <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight">Billing & Invoices</h1>
                    <p className="text-gray-500 font-medium max-w-lg">
                        {isManager ? 'Manage invoices and track studio revenue.' : 'View your invoices and manage your subscription.'}
                    </p>
                </div>
                {isManager && (
                    <Button
                        onClick={() => setShowCreateModal(true)}
                        className="gap-2 hover:scale-105"
                    >
                        <Plus className="w-4 h-4" />
                        Create Invoice
                    </Button>
                )}
            </header>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black text-green-500 uppercase tracking-widest bg-green-50 px-2 py-0.5 rounded-full">Paid</span>
                    </div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Total Revenue</p>
                    <div className="flex items-baseline gap-1">
                        <h3 className="text-3xl font-black text-gray-900 tracking-tight">${totalRevenue.toLocaleString()}</h3>
                        <span className="text-xs font-bold text-gray-400">USD</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center text-yellow-600 group-hover:scale-110 transition-transform">
                            <Clock className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest bg-yellow-50 px-2 py-0.5 rounded-full">Pending</span>
                    </div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Expected soon</p>
                    <div className="flex items-baseline gap-1">
                        <h3 className="text-3xl font-black text-gray-900 tracking-tight">${pendingAmount.toLocaleString()}</h3>
                        <span className="text-xs font-bold text-gray-400">USD</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black text-red-500 uppercase tracking-widest bg-red-50 px-2 py-0.5 rounded-full">Overdue</span>
                    </div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Past Due</p>
                    <div className="flex items-baseline gap-1">
                        <h3 className="text-3xl font-black text-red-600 tracking-tight">${overdueAmount.toLocaleString()}</h3>
                        <span className="text-xs font-bold text-gray-400">USD</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-600 group-hover:scale-110 transition-transform">
                            <Receipt className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded-full">Volume</span>
                    </div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Total Invoices</p>
                    <div className="flex items-baseline gap-1">
                        <h3 className="text-3xl font-black text-gray-900 tracking-tight">{typedInvoices.length}</h3>
                        <span className="text-xs font-bold text-gray-400">Count</span>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by client or invoice #..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-transparent focus:bg-white border-2 focus:border-primary rounded-2xl font-bold text-sm text-gray-700 outline-none transition-all"
                    />
                </div>
                <div className="flex p-1 bg-gray-50 rounded-2xl border border-gray-100 overflow-x-auto w-full md:w-auto no-scrollbar">
                    {statusFilters.map(filter => (
                        <button
                            key={filter.value}
                            onClick={() => setFilterStatus(filter.value)}
                            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                filterStatus === filter.value
                                    ? 'bg-white text-primary shadow-sm'
                                    : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Invoices List */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full border-separate border-spacing-0">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Invoice</th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Client</th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Due Date</th>
                                <th className="px-6 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredInvoices.length > 0 ? filteredInvoices.map((invoice) => (
                                <tr key={invoice.id} className="group hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary font-black text-xs">
                                                #{invoice.invoice_number.slice(-3)}
                                            </div>
                                            <span className="font-bold text-gray-900 text-sm tracking-tight">{invoice.invoice_number}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 font-bold text-gray-600 text-sm">
                                        {invoice.student_name || invoice.band_name || 'Generic Client'}
                                    </td>
                                    <td className="px-6 py-6 font-black text-gray-900 text-sm">
                                        ${Number(invoice.total_amount).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-6">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(invoice.status)}`}>
                                            {getStatusIcon(invoice.status)}
                                            {invoice.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-6 font-bold text-gray-500 text-xs">
                                        {new Date(invoice.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setViewingInvoice(invoice)}
                                                className="hover:scale-110 active:scale-95"
                                            >
                                                <Eye className="w-4 h-4 text-gray-400" />
                                            </Button>
                                            {isManager && invoice.status !== 'paid' && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleSendReminder(invoice.id)}
                                                    className="hover:scale-110 active:scale-95"
                                                >
                                                    <Mail className="w-4 h-4 text-gray-400" />
                                                </Button>
                                            )}
                                            {isManager && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeleteInvoice(invoice.id)}
                                                    className="hover:scale-110 active:scale-95 text-red-400 hover:text-red-500 hover:bg-red-50"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            )}
                                            {invoice.status !== 'paid' && invoice.status !== 'cancelled' ? (
                                                <Button
                                                    onClick={() => handlePayInvoice(invoice.id)}
                                                    className="gap-2 bg-green-600 hover:bg-green-700 h-9 px-4 active:scale-95"
                                                >
                                                    <CreditCard className="w-3.5 h-3.5" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Pay</span>
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => handleDownloadInvoice(invoice)}
                                                    className="hover:scale-110 active:scale-95"
                                                >
                                                    <Download className="w-4 h-4 text-gray-400" />
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-20 h-20 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mb-6">
                                                <Receipt className="w-10 h-10 text-gray-200" />
                                            </div>
                                            <p className="text-sm font-black text-gray-400 uppercase tracking-widest">No invoices found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Invoice Modal */}
            <Dialog
                open={showCreateModal}
                onOpenChange={setShowCreateModal}
                size="lg"
            >
                <DialogHeader title="New Invoice" />
                <DialogContent>
                    <form id="create-invoice-form" onSubmit={handleCreateInvoice} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Student / Client *</label>
                                <select
                                    required
                                    value={newInvoice.student}
                                    onChange={(e) => setNewInvoice({ ...newInvoice, student: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border-transparent focus:bg-white border-2 focus:border-primary rounded-2xl font-bold text-sm text-gray-700 outline-none transition-all appearance-none"
                                >
                                    <option value="">Select student...</option>
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
                                    className="w-full px-4 py-3 bg-gray-50 border-transparent focus:bg-white border-2 focus:border-primary rounded-2xl font-bold text-sm text-gray-700 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Line Items</label>
                                <button
                                    type="button"
                                    onClick={addLineItem}
                                    className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-3 py-1 rounded-full hover:bg-primary/10 transition-colors"
                                >
                                    + Add Item
                                </button>
                            </div>

                            <div className="space-y-3">
                                {newInvoice.line_items.map((item, index) => (
                                    <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                                        <div className="md:col-span-6 space-y-1">
                                            <input
                                                type="text"
                                                required
                                                value={item.description}
                                                onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                                                className="w-full px-4 py-3 bg-white border border-gray-200 focus:border-primary rounded-xl font-bold text-sm text-gray-700 outline-none transition-all"
                                                placeholder="Item description"
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-1">
                                            <input
                                                type="number"
                                                required
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => updateLineItem(index, 'quantity', e.target.value)}
                                                className="w-full px-4 py-3 bg-white border border-gray-200 focus:border-primary rounded-xl font-bold text-sm text-gray-700 outline-none transition-all"
                                                placeholder="Qty"
                                            />
                                        </div>
                                        <div className="md:col-span-3 space-y-1">
                                            <input
                                                type="number"
                                                required
                                                step="0.01"
                                                value={item.unit_price}
                                                onChange={(e) => updateLineItem(index, 'unit_price', e.target.value)}
                                                className="w-full px-4 py-3 bg-white border border-gray-200 focus:border-primary rounded-xl font-bold text-sm text-gray-700 outline-none transition-all"
                                                placeholder="Price"
                                            />
                                        </div>
                                        <div className="md:col-span-1">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                disabled={newInvoice.line_items.length <= 1}
                                                onClick={() => removeLineItem(index)}
                                                className="text-red-500 hover:text-red-600"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100 flex justify-between items-center">
                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Estimated Total</span>
                            <span className="text-3xl font-black text-gray-900 tracking-tight">${modalTotal.toFixed(2)}</span>
                        </div>
                    </form>
                </DialogContent>
                <DialogFooter>
                    <Button
                        variant="ghost"
                        onClick={() => setShowCreateModal(false)}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        form="create-invoice-form"
                        disabled={creating}
                        className="flex-[2] gap-2 active:scale-95 transition-transform"
                    >
                        {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUpRight className="w-4 h-4" />}
                        {creating ? 'Creating...' : 'Issue Invoice'}
                    </Button>
                </DialogFooter>
            </Dialog>

            {/* View Invoice Modal */}
            <Dialog
                open={!!viewingInvoice}
                onOpenChange={(open) => !open && setViewingInvoice(null)}
                size="lg"
            >
                {viewingInvoice && (
                    <>
                        <DialogHeader title={`Invoice ${viewingInvoice.invoice_number}`} />
                        <DialogContent>
                            <div className="space-y-8 print:p-0">
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Billed To</p>
                                        <p className="text-lg font-black text-gray-900 leading-tight">
                                            {viewingInvoice.student_name || viewingInvoice.band_name || 'Generic Client'}
                                        </p>
                                    </div>
                                    <div className="text-right space-y-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Dated</p>
                                        <p className="text-sm font-bold text-gray-900">
                                            {new Date(viewingInvoice.due_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>

                                <div className="border border-gray-100 rounded-[2rem] overflow-hidden shadow-sm">
                                    <table className="w-full text-left border-separate border-spacing-0">
                                        <thead className="bg-gray-50/50">
                                            <tr>
                                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Service Description</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Qty</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Unit Price</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {viewingInvoice.line_items?.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td className="px-6 py-4 text-sm font-bold text-gray-700">{item.description}</td>
                                                    <td className="px-6 py-4 text-sm font-bold text-gray-500 text-center">{item.quantity}</td>
                                                    <td className="px-6 py-4 text-sm font-bold text-gray-500 text-right">${Number(item.unit_price).toFixed(2)}</td>
                                                    <td className="px-6 py-4 text-sm font-black text-gray-900 text-right">
                                                        ${Number(item.total_price || (item.quantity * Number(item.unit_price))).toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex justify-between items-center py-6 px-4 bg-gray-900 rounded-3xl text-white shadow-xl shadow-gray-200">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Total Balance Due</p>
                                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/10 border border-white/20`}>
                                            <span className={viewingInvoice.status === 'paid' ? 'text-green-400' : 'text-yellow-400'}>
                                                {viewingInvoice.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-4xl font-black tracking-tight">${Number(viewingInvoice.total_amount).toFixed(2)}</span>
                                        <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">USD</p>
                                    </div>
                                </div>
                            </div>
                        </DialogContent>
                        <DialogFooter className="print:hidden">
                            <Button
                                variant="outline"
                                onClick={() => window.print()}
                                className="flex-1 gap-2"
                            >
                                <Download className="w-4 h-4" />
                                Download PDF
                            </Button>
                            {viewingInvoice.status !== 'paid' && viewingInvoice.status !== 'cancelled' && (
                                <Button
                                    onClick={() => handlePayInvoice(viewingInvoice.id)}
                                    className="flex-1 gap-2 bg-green-600 hover:bg-green-700 active:scale-95 transition-transform"
                                >
                                    <CreditCard className="w-4 h-4" />
                                    Secure Pay
                                </Button>
                            )}
                        </DialogFooter>
                    </>
                )}
            </Dialog>
        </div>
    )
}
