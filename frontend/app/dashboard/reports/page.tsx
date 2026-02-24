'use client'

import {
    BarChart3, TrendingUp, Users, Download, Calendar, DollarSign,
    Loader2, FileText, Info, FileSpreadsheet, FileDown, Braces
} from 'lucide-react'
import api from '@/services/api'
import { toast } from 'react-hot-toast'
import { useState } from 'react'
import * as ExcelJS from 'exceljs'

export default function ReportsPage() {
    const [downloading, setDownloading] = useState<string | null>(null)

    const reports = [
        {
            id: 'financial',
            title: 'Financial Summary',
            description: 'Income, expenses, and outstanding invoices overview.',
            icon: DollarSign,
            color: 'bg-green-50',
            iconColor: 'text-green-600',
            borderColor: 'border-green-200',
            lastGenerated: 'Today, 9:00 AM'
        },
        {
            id: 'attendance',
            title: 'Attendance Report',
            description: 'Student attendance rates, cancellations, and make-ups.',
            icon: Calendar,
            color: 'bg-blue-50',
            iconColor: 'text-blue-600',
            borderColor: 'border-blue-200',
            lastGenerated: 'Yesterday'
        },
        {
            id: 'student-progress',
            title: 'Student Progress',
            description: 'Goal completion rates and retention statistics.',
            icon: TrendingUp,
            color: 'bg-purple-50',
            iconColor: 'text-purple-600',
            borderColor: 'border-purple-200',
            lastGenerated: 'Last Week'
        },
        {
            id: 'students',
            title: 'Student Directory',
            description: 'Full list of students with contact info and status.',
            icon: Users,
            color: 'bg-orange-50',
            iconColor: 'text-orange-600',
            borderColor: 'border-orange-200',
            lastGenerated: 'Live Data'
        },
        {
            id: 'teachers',
            title: 'Instructor Directory',
            description: 'List of all instructors, rates, and specialties.',
            icon: Users,
            color: 'bg-pink-50',
            iconColor: 'text-pink-600',
            borderColor: 'border-pink-200',
            lastGenerated: 'Live Data'
        },
        {
            id: 'users',
            title: 'All Users',
            description: 'System-wide user export including roles and access.',
            icon: Users,
            color: 'bg-cyan-50',
            iconColor: 'text-cyan-600',
            borderColor: 'border-cyan-200',
            lastGenerated: 'Live Data'
        }
    ]

    const handleDownloadCSV = async (reportId: string) => {
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
            toast.success('CSV report downloaded')
        } catch (error) {
            console.error('Download failed', error)
            toast.error('Failed to download report')
        } finally {
            setDownloading(null)
        }
    }

    const handleDownloadJSON = async (reportId: string) => {
        setDownloading(`${reportId}-json`)
        try {
            const response = await api.get(`/core/reports/export/?type=${reportId}&format=json`)
            const data = response.data
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `${reportId}_report_${new Date().toISOString().split('T')[0]}.json`
            document.body.appendChild(link)
            link.click()
            link.parentNode?.removeChild(link)
            toast.success('JSON report downloaded')
        } catch (error) {
            console.error('JSON download failed', error)
            toast.error('Failed to download JSON report')
        } finally {
            setDownloading(null)
        }
    }

    const handleDownloadExcel = async (reportId: string) => {
        setDownloading(`${reportId}-excel`)
        try {
            // Fetch the data from API
            const response = await api.get(`/core/reports/export/?type=${reportId}`)
            const data = response.data

            // Create a new workbook
            const workbook = new ExcelJS.Workbook()
            workbook.creator = 'StudioSync'
            workbook.created = new Date()

            const worksheet = workbook.addWorksheet(reportId.replace(/-/g, ' ').toUpperCase())

            // Configure based on report type
            if (reportId === 'students') {
                worksheet.columns = [
                    { header: 'Name', key: 'name', width: 25 },
                    { header: 'Email', key: 'email', width: 30 },
                    { header: 'Instrument', key: 'instrument', width: 18 },
                    { header: 'Status', key: 'status', width: 12 },
                    { header: 'Phone', key: 'phone', width: 18 },
                    { header: 'Enrollment Date', key: 'enrollment_date', width: 18 },
                ]
                worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
                worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE67E22' } }
                worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' }
                worksheet.getRow(1).height = 25
                if (Array.isArray(data)) {
                    data.forEach((item: any) => worksheet.addRow(item))
                }
            } else if (reportId === 'teachers') {
                worksheet.columns = [
                    { header: 'Name', key: 'name', width: 25 },
                    { header: 'Email', key: 'email', width: 30 },
                    { header: 'Specialties', key: 'specialties', width: 25 },
                    { header: 'Hourly Rate', key: 'hourly_rate', width: 14 },
                    { header: 'Status', key: 'status', width: 12 },
                ]
                worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
                worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFAD1457' } }
                worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' }
                worksheet.getRow(1).height = 25
                if (Array.isArray(data)) {
                    data.forEach((item: any) => worksheet.addRow(item))
                }
            } else if (reportId === 'users') {
                worksheet.columns = [
                    { header: 'Name', key: 'name', width: 25 },
                    { header: 'Email', key: 'email', width: 30 },
                    { header: 'Role', key: 'role', width: 15 },
                    { header: 'Date Joined', key: 'date_joined', width: 15 },
                    { header: 'Last Login', key: 'last_login', width: 15 },
                ]
                worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
                worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00838F' } }
                worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' }
                worksheet.getRow(1).height = 25
                if (Array.isArray(data)) {
                    data.forEach((item: any) => worksheet.addRow(item))
                }
            } else if (reportId === 'financial') {
                worksheet.columns = [
                    { header: 'Date', key: 'date', width: 15 },
                    { header: 'Description', key: 'description', width: 35 },
                    { header: 'Category', key: 'category', width: 20 },
                    { header: 'Amount', key: 'amount', width: 15 },
                    { header: 'Status', key: 'status', width: 12 }
                ]

                worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
                worksheet.getRow(1).fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FF27AE60' }
                }
                worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' }
                worksheet.getRow(1).height = 25

                // Add financial data if available
                if (Array.isArray(data)) {
                    data.forEach((item: any) => {
                        worksheet.addRow(item)
                    })
                }
            } else if (reportId === 'attendance') {
                worksheet.columns = [
                    { header: 'Student', key: 'student', width: 25 },
                    { header: 'Total Lessons', key: 'total', width: 15 },
                    { header: 'Attended', key: 'attended', width: 15 },
                    { header: 'Cancelled', key: 'cancelled', width: 15 },
                    { header: 'Attendance %', key: 'percentage', width: 15 }
                ]

                worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
                worksheet.getRow(1).fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FF3498DB' }
                }
                worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' }
                worksheet.getRow(1).height = 25

                if (Array.isArray(data)) {
                    data.forEach((item: any) => {
                        worksheet.addRow(item)
                    })
                }
            } else if (reportId === 'student-progress') {
                worksheet.columns = [
                    { header: 'Student', key: 'student', width: 25 },
                    { header: 'Goal', key: 'goal', width: 35 },
                    { header: 'Status', key: 'status', width: 15 },
                    { header: 'Progress', key: 'progress', width: 15 },
                    { header: 'Target Date', key: 'target_date', width: 15 }
                ]

                worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
                worksheet.getRow(1).fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FF8E44AD' }
                }
                worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' }
                worksheet.getRow(1).height = 25

                if (Array.isArray(data)) {
                    data.forEach((item: any) => {
                        worksheet.addRow(item)
                    })
                }
            }

            // Add borders to all cells
            worksheet.eachRow((row, rowNumber) => {
                row.eachCell((cell) => {
                    cell.border = {
                        top: { style: 'thin', color: { argb: 'FFD3D3D3' } },
                        left: { style: 'thin', color: { argb: 'FFD3D3D3' } },
                        bottom: { style: 'thin', color: { argb: 'FFD3D3D3' } },
                        right: { style: 'thin', color: { argb: 'FFD3D3D3' } }
                    }
                })
            })

            // Generate Excel file
            const buffer = await workbook.xlsx.writeBuffer()
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `${reportId}_report_${new Date().toISOString().split('T')[0]}.xlsx`
            document.body.appendChild(link)
            link.click()
            link.parentNode?.removeChild(link)

            toast.success('Excel report downloaded')
        } catch (error) {
            console.error('Excel download failed', error)
            toast.error('Failed to download Excel report')
        } finally {
            setDownloading(null)
        }
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-4xl font-bold text-gray-900">Reports & Analytics</h1>
                    <p className="text-sm text-gray-600 mt-1">Export business insights and performance metrics</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">{reports.length} Reports Available</span>
                </div>
            </div>

            {/* Reports Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {reports.map((report) => (
                    <div
                        key={report.id}
                        className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start gap-4">
                            {/* Icon */}
                            <div className={`w-12 h-12 ${report.color} rounded-lg flex items-center justify-center border ${report.borderColor} shrink-0`}>
                                <report.icon className={`w-6 h-6 ${report.iconColor}`} />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 mb-1">{report.title}</h3>
                                <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                                    <span>{report.lastGenerated}</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-4 flex flex-wrap gap-2">
                            <button
                                onClick={() => handleDownloadCSV(report.id)}
                                disabled={downloading === report.id}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
                            >
                                {downloading === report.id ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span className="hidden sm:inline">Exporting...</span>
                                    </>
                                ) : (
                                    <>
                                        <FileDown className="w-4 h-4" />
                                        <span>CSV</span>
                                    </>
                                )}
                            </button>

                            <button
                                onClick={() => handleDownloadExcel(report.id)}
                                disabled={downloading === `${report.id}-excel`}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                            >
                                {downloading === `${report.id}-excel` ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span className="hidden sm:inline">Exporting...</span>
                                    </>
                                ) : (
                                    <>
                                        <FileSpreadsheet className="w-4 h-4" />
                                        <span>Excel</span>
                                    </>
                                )}
                            </button>

                            <button
                                onClick={() => handleDownloadJSON(report.id)}
                                disabled={downloading === `${report.id}-json`}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                            >
                                {downloading === `${report.id}-json` ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span className="hidden sm:inline">Exporting...</span>
                                    </>
                                ) : (
                                    <>
                                        <Braces className="w-4 h-4" />
                                        <span>JSON</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Info Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-5 flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center border border-blue-200 shrink-0">
                    <Info className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-blue-900 mb-1">Need custom reports?</h3>
                    <p className="text-sm text-blue-700 leading-relaxed">
                        We're building more advanced analytics. Contact support to request specific data points or custom report formats.
                    </p>
                </div>
            </div>

            {/* Export Info */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Export Formats</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-gray-600">
                    <div className="flex items-start gap-2">
                        <FileDown className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                        <div>
                            <strong className="text-gray-900">CSV:</strong> Simple text format, compatible with all spreadsheet apps
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                        <div>
                            <strong className="text-gray-900">Excel:</strong> Rich formatting with styled headers and borders
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <Braces className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                        <div>
                            <strong className="text-gray-900">JSON:</strong> Structured data for developers and integrations
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
