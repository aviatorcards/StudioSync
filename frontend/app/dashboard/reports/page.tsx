'use client'

import { BarChart3, TrendingUp, Users, Download, Calendar, DollarSign, Loader2, FileText, Info } from 'lucide-react'
import api from '@/services/api'
import { toast } from 'react-hot-toast'
import { useState } from 'react'

export default function ReportsPage() {
    const [downloading, setDownloading] = useState<string | null>(null)

    const reports = [
        {
            id: 'financial',
            title: 'Financial Summary',
            description: 'Income, expenses, and outstanding invoices overview.',
            icon: DollarSign,
            color: 'from-green-100 to-green-50',
            iconColor: 'text-green-600',
            borderColor: 'border-green-200',
            lastGenerated: 'Today, 9:00 AM'
        },
        {
            id: 'attendance',
            title: 'Attendance Report',
            description: 'Student attendance rates, cancellations, and make-ups.',
            icon: Calendar,
            color: 'from-blue-100 to-blue-50',
            iconColor: 'text-blue-600',
            borderColor: 'border-blue-200',
            lastGenerated: 'Yesterday'
        },
        {
            id: 'student-progress',
            title: 'Student Progress',
            description: 'Goal completion rates and retention statistics.',
            icon: TrendingUp,
            color: 'from-purple-100 to-purple-50',
            iconColor: 'text-purple-600',
            borderColor: 'border-purple-200',
            lastGenerated: 'Last Week'
        },
        {
            id: 'students',
            title: 'Student Directory',
            description: 'Full list of students with contact info and status.',
            icon: Users,
            color: 'from-orange-100 to-orange-50',
            iconColor: 'text-orange-600',
            borderColor: 'border-orange-200',
            lastGenerated: 'Live Data'
        },
        {
            id: 'teachers',
            title: 'Instructor Directory',
            description: 'List of all instructors, rates, and specialties.',
            icon: Users,
            color: 'from-pink-100 to-pink-50',
            iconColor: 'text-pink-600',
            borderColor: 'border-pink-200',
            lastGenerated: 'Live Data'
        },
        {
            id: 'users',
            title: 'All Users',
            description: 'System-wide user export including roles and access.',
            icon: Users,
            color: 'from-cyan-100 to-cyan-50',
            iconColor: 'text-cyan-600',
            borderColor: 'border-cyan-200',
            lastGenerated: 'Live Data'
        }
    ]

    const handleDownload = async (reportId: string) => {
        setDownloading(reportId)
        try {
            const response = await api.get(`/core/reports/export/?type=${reportId}`, {
                responseType: 'blob',
            })

            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `${reportId}_report.csv`)
            document.body.appendChild(link)
            link.click()
            link.parentNode?.removeChild(link)
            toast.success('Report downloaded')
        } catch (error) {
            console.error('Download failed', error)
            toast.error('Failed to download report')
        } finally {
            setDownloading(null)
        }
    }

    return (
        <div className="max-w-7xl mx-auto px-4 pb-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Reports & Analytics</h1>
                    <p className="text-lg text-gray-500 mt-2 font-medium">Business insights and performance metrics.</p>
                </div>
            </div>

            {/* Reports Grid */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/30">
                    <h2 className="font-black text-gray-900 text-xl">Available Reports</h2>
                    <p className="text-sm text-gray-500 font-medium mt-1">Export data for analysis and record-keeping</p>
                </div>
                <div className="divide-y divide-gray-50">
                    {reports.map((report) => (
                        <div key={report.id} className="p-8 flex items-start justify-between hover:bg-gray-50/50 transition-all group">
                            <div className="flex items-start gap-6 flex-1">
                                <div className={`w-16 h-16 bg-gradient-to-br ${report.color} rounded-2xl flex items-center justify-center border ${report.borderColor} shadow-inner group-hover:rotate-12 transition-transform`}>
                                    <report.icon className={`w-8 h-8 ${report.iconColor}`} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-black text-gray-900 text-lg mb-2 group-hover:text-[#F39C12] transition-colors">{report.title}</h3>
                                    <p className="text-sm text-gray-600 mb-3 font-medium">{report.description}</p>
                                    <div className="flex items-center gap-2 text-xs text-gray-400 font-semibold">
                                        <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                                        <span>Last generated: {report.lastGenerated}</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDownload(report.id)}
                                disabled={downloading === report.id}
                                className="flex items-center gap-2 px-6 py-3 text-sm font-black text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-all shadow-sm active:scale-90 uppercase tracking-wider"
                            >
                                {downloading === report.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                {downloading === report.id ? 'Exporting...' : 'Export CSV'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Info Card */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-[2rem] p-8 flex items-start gap-6 shadow-lg">
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center border border-blue-200 flex-shrink-0">
                    <Info className="w-7 h-7 text-blue-600" />
                </div>
                <div>
                    <h3 className="text-lg font-black text-blue-900 mb-2">Need custom reports?</h3>
                    <p className="text-sm text-blue-700 font-semibold leading-relaxed">
                        We are building more advanced analytics. Contact support to request specific data points or custom report formats.
                    </p>
                </div>
            </div>
        </div>
    )
}
