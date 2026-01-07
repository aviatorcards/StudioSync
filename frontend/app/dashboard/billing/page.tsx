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
    Mail
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

    const handleSendReminder = async (invoiceId: string) => {
        try {
            await api.post(`/billing/invoices/${invoiceId}/send_reminder/`)
            toast.success('Reminder sent successfully')
        } catch (error) {
            toast.error('Failed to send reminder')
        }
    }

    const handleDownloadInvoice = (invoice: Invoice) => {
        setViewingInvoice(invoice)
        setTimeout(() => window.print(), 500)
    }

    const getStatusColor = (status: string) => {
        const styles: Record<string, string> = {
            paid: 'bg-green-100 text-green-700 border-green-200',
            pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            overdue: 'bg-red-100 text-red-700 border-red-200',
            draft: 'bg-gray-100 text-gray-700 border-gray-200',
            sent: 'bg-blue-100 text-blue-700 border-blue-200',
        }
        return styles[status] || 'bg-gray-100 text-gray-700 border-gray-200'
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'paid': return <CheckCircle2 className="w-4 h-4" />
            case 'overdue': return <AlertCircle className="w-4 h-4" />
            case 'pending':
            case 'sent': return <Clock className="w-4 h-4" />
            default: return <FileText className="w-4 h-4" />
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
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-[var(--color-primary)] animate-spin mb-4" />
                <p className="text-gray-500 font-bold tracking-wider uppercase text-xs">Loading Billing...</p>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl md:text-4xl font-bold text-gray-900">Billing & Invoices</h1>
                <p className="text-sm text-gray-600 mt-1">
                    {isManager ? 'Manage invoices and track payments' : 'View your invoices and payments'}
                </p>
            </div>

            {/* Create Button (Manager Only) */}
            {isManager && (
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors font-medium shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    Create Invoice
                </button>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-gray-600 uppercase">Total Revenue</p>
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-green-600">${totalRevenue.toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-gray-600 uppercase">Pending</p>
                        <Clock className="w-4 h-4 text-yellow-600" />
                    </div>
                    <p className="text-2xl font-bold text-yellow-600">${pendingAmount.toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-gray-600 uppercase">Overdue</p>
                        <AlertCircle className="w-4 h-4 text-red-600" />
                    </div>
                    <p className="text-2xl font-bold text-red-600">${overdueAmount.toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-gray-600 uppercase">Total Invoices</p>
                        <FileText className="w-4 h-4 text-gray-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{typedInvoices.length}</p>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search invoices..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                    {statusFilters.map(filter => (
                        <button
                            key={filter.value}
                            onClick={() => setFilterStatus(filter.value)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                                filterStatus === filter.value
                                    ? 'bg-[var(--color-primary)] text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Invoice #</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Client</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Due Date</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredInvoices.length > 0 ? filteredInvoices.map((invoice) => (
                                <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <span className="font-semibold text-gray-900 text-sm">{invoice.invoice_number}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-sm text-gray-700">{invoice.student_name || invoice.band_name || 'Client'}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="font-semibold text-gray-900 text-sm">${Number(invoice.total_amount).toFixed(2)}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {new Date(invoice.due_date).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold uppercase border ${getStatusColor(invoice.status)}`}>
                                            {getStatusIcon(invoice.status)}
                                            {invoice.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => setViewingInvoice(invoice)}
                                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                title="View Invoice"
                                            >
                                                <Eye className="w-4 h-4 text-gray-600" />
                                            </button>
                                            {isManager && invoice.status !== 'paid' && (
                                                <button
                                                    onClick={() => handleSendReminder(invoice.id)}
                                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                    title="Send Reminder"
                                                >
                                                    <Mail className="w-4 h-4 text-gray-600" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDownloadInvoice(invoice)}
                                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                title="Download PDF"
                                            >
                                                <Download className="w-4 h-4 text-gray-600" />
                                            </button>
                                            {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                                                <button
                                                    onClick={() => handlePayInvoice(invoice.id)}
                                                    className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                                                >
                                                    Pay Now
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="px-4 py-12 text-center">
                                        <div className="flex flex-col items-center">
                                            <FileText className="w-12 h-12 text-gray-300 mb-3" />
                                            <p className="text-gray-500 font-medium">No invoices found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
                {filteredInvoices.length > 0 ? filteredInvoices.map((invoice) => (
                    <div key={invoice.id} className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <span className="text-xs font-medium text-gray-500">Invoice</span>
                                <p className="font-semibold text-gray-900">{invoice.invoice_number}</p>
                            </div>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold uppercase border ${getStatusColor(invoice.status)}`}>
                                {getStatusIcon(invoice.status)}
                                {invoice.status}
                            </span>
                        </div>

                        <div className="space-y-2 mb-3 pb-3 border-b border-gray-100">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Client:</span>
                                <span className="font-medium text-gray-900">{invoice.student_name || invoice.band_name || 'Client'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Amount:</span>
                                <span className="font-semibold text-gray-900">${Number(invoice.total_amount).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Due:</span>
                                <span className="font-medium text-gray-900">{new Date(invoice.due_date).toLocaleDateString()}</span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setViewingInvoice(invoice)}
                                className="flex-1 px-3 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                            >
                                View
                            </button>
                            {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                                <button
                                    onClick={() => handlePayInvoice(invoice.id)}
                                    className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                                >
                                    Pay Now
                                </button>
                            )}
                        </div>
                    </div>
                )) : (
                    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">No invoices found</p>
                    </div>
                )}
            </div>

            {/* Create Invoice Modal */}
            {showCreateModal && (
                <Modal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    title="Create New Invoice"
                    footer={
                        <>
                            <button
                                type="button"
                                onClick={() => setShowCreateModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="create-invoice-form"
                                disabled={creating}
                                className="flex-1 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {creating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    'Create Invoice'
                                )}
                            </button>
                        </>
                    }
                >
                    <form id="create-invoice-form" onSubmit={handleCreateInvoice} className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Student *</label>
                                <select
                                    required
                                    value={newInvoice.student}
                                    onChange={(e) => setNewInvoice({ ...newInvoice, student: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
                                >
                                    <option value="">Select student</option>
                                    {students.map(student => (
                                        <option key={student.id} value={student.id}>
                                            {student.user?.first_name} {student.user?.last_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
                                <input
                                    type="date"
                                    required
                                    value={newInvoice.dueDate}
                                    onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-medium text-gray-700">Line Items ({newInvoice.line_items.length}/10)</label>
                                <button
                                    type="button"
                                    onClick={addLineItem}
                                    disabled={newInvoice.line_items.length >= 10}
                                    className="text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-medium disabled:opacity-50"
                                >
                                    + Add Item
                                </button>
                            </div>

                            <div className="space-y-3">
                                {newInvoice.line_items.map((item, index) => (
                                    <div key={index} className="grid grid-cols-12 gap-2">
                                        <input
                                            type="text"
                                            required
                                            value={item.description}
                                            onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                                            className="col-span-12 md:col-span-6 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] text-sm"
                                            placeholder="Description"
                                        />
                                        <input
                                            type="number"
                                            required
                                            value={item.quantity}
                                            onChange={(e) => updateLineItem(index, 'quantity', e.target.value)}
                                            className="col-span-4 md:col-span-2 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] text-sm"
                                            placeholder="Qty"
                                            min="1"
                                        />
                                        <input
                                            type="number"
                                            required
                                            value={item.unit_price}
                                            onChange={(e) => updateLineItem(index, 'unit_price', e.target.value)}
                                            className="col-span-5 md:col-span-3 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] text-sm"
                                            placeholder="Price"
                                            min="0"
                                            step="0.01"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeLineItem(index)}
                                            disabled={newInvoice.line_items.length <= 1}
                                            className="col-span-3 md:col-span-1 p-2 text-gray-400 hover:text-red-600 disabled:opacity-30 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-600">Total Amount</span>
                            <span className="text-2xl font-bold text-gray-900">${modalTotal.toFixed(2)}</span>
                        </div>
                    </form>
                </Modal>
            )}

            {/* View Invoice Modal */}
            {viewingInvoice && (
                <Modal
                    isOpen={!!viewingInvoice}
                    onClose={() => setViewingInvoice(null)}
                    title="Invoice"
                    footer={
                        <>
                            <button
                                onClick={() => window.print()}
                                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-white transition-colors font-medium print:hidden"
                            >
                                Print / Download
                            </button>
                            {viewingInvoice.status !== 'paid' && viewingInvoice.status !== 'cancelled' && (
                                <button
                                    onClick={() => handlePayInvoice(viewingInvoice.id)}
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium print:hidden"
                                >
                                    Pay Now
                                </button>
                            )}
                        </>
                    }
                >
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Billed To</p>
                                <p className="font-semibold text-gray-900">{viewingInvoice.student_name || viewingInvoice.band_name || 'Client'}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Due Date</p>
                                <p className="font-semibold text-gray-900">{new Date(viewingInvoice.due_date).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Description</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase text-center">Qty</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase text-right">Price</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {viewingInvoice.line_items?.map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700 text-center">{item.quantity}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700 text-right">${Number(item.unit_price).toFixed(2)}</td>
                                            <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                                                ${Number(item.total_price || (item.quantity * Number(item.unit_price))).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                            <span className="text-sm font-medium text-gray-600">Total Amount Due</span>
                            <span className="text-3xl font-bold text-gray-900">${Number(viewingInvoice.total_amount).toFixed(2)}</span>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    )
}
