'use client'

import {
    CreditCard,
    Package,
    MessageSquare,
    FolderOpen,
    Target,
    Users,
    BarChart,
    Calendar,
    CheckCircle2
} from 'lucide-react'

const FEATURES = [
    {
        icon: CreditCard,
        name: 'Billing & Invoicing',
        description: 'Create and manage invoices, track payments, and handle billing for students and bands'
    },
    {
        icon: Package,
        name: 'Inventory Management',
        description: 'Track instruments, equipment, and supplies with checkout logs and low stock alerts'
    },
    {
        icon: MessageSquare,
        name: 'Internal Messaging',
        description: 'Communicate with students, parents, and teachers through the built-in messaging system'
    },
    {
        icon: FolderOpen,
        name: 'Resource Library',
        description: 'Share and manage sheet music, recordings, practice materials, and educational resources'
    },
    {
        icon: Target,
        name: 'Student Goals',
        description: 'Set and track progress on personalized learning goals for each student'
    },
    {
        icon: Users,
        name: 'Bands & Ensembles',
        description: 'Manage group lessons, band schedules, and ensemble performances'
    },
    {
        icon: BarChart,
        name: 'Analytics & Reports',
        description: 'View insights on attendance, revenue, student progress, and studio metrics'
    },
    {
        icon: Calendar,
        name: 'Practice Room Booking',
        description: 'Allow students to reserve practice rooms with availability management'
    }
]

export default function FeaturesPage() {
    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Feature Settings</h1>
                <p className="text-gray-600">
                    All features are now enabled by default for all studios.
                    The feature flags system has been removed to simplify the platform.
                </p>
            </div>

            <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start space-x-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                        <h3 className="text-lg font-semibold text-green-900 mb-1">
                            All Features Enabled
                        </h3>
                        <p className="text-sm text-green-700">
                            You have full access to all StudioSync features. No configuration needed!
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {FEATURES.map((feature, idx) => {
                    const Icon = feature.icon

                    return (
                        <div
                            key={idx}
                            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start space-x-4">
                                <div className="p-3 rounded-lg bg-indigo-100">
                                    <Icon className="w-6 h-6 text-indigo-600" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {feature.name}
                                        </h3>
                                        <span className="flex items-center text-sm font-medium text-green-600">
                                            <CheckCircle2 className="w-4 h-4 mr-1" />
                                            Enabled
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-600">
                    <strong>Note:</strong> Previously, features could be toggled on and off.
                    This system has been deprecated in favor of providing all functionality to every studio.
                </p>
            </div>
        </div>
    )
}
