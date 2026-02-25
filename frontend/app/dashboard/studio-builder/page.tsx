'use client'

import Link from 'next/link'
import { Building2, Grid3X3, Package, Calendar, Zap, Clock, ArrowRight, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'

const PLANNED_FEATURES = [
    {
        icon: Grid3X3,
        color: 'bg-indigo-50 text-indigo-600',
        title: 'Drag & Drop Canvas',
        description: 'Visually arrange rooms on an interactive grid. Position studios, waiting areas, and practice halls with precision.',
    },
    {
        icon: Building2,
        color: 'bg-purple-50 text-purple-600',
        title: 'Room Configuration',
        description: 'Define room capacity, hourly rates, and equipment. Create "Lesson Room A", "Performance Hall", and more.',
    },
    {
        icon: Package,
        color: 'bg-orange-50 text-orange-600',
        title: 'Inventory Integration',
        description: 'Link instruments and equipment to specific rooms. Know exactly where every piano and drum kit lives.',
    },
    {
        icon: Calendar,
        color: 'bg-green-50 text-green-600',
        title: 'Live Occupancy View',
        description: 'See which rooms are in use in real-time. Color-coded status overlays show bookings as they happen.',
    },
    {
        icon: Zap,
        color: 'bg-blue-50 text-blue-600',
        title: 'Smart Scheduling',
        description: 'Students and teachers can book specific rooms during lesson scheduling — no more double bookings.',
    },
    {
        icon: Layers,
        color: 'bg-pink-50 text-pink-600',
        title: 'Multi-Studio Support',
        description: 'Manage layouts for multiple studio locations from a single central dashboard.',
    },
]

export default function StudioBuilderPage() {
    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">

            {/* Hero */}
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-[2.5rem] p-12 md:p-16 text-white shadow-2xl">
                {/* Decorative circles */}
                <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/5 rounded-full" />
                <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/5 rounded-full" />

                <div className="relative z-10 flex flex-col items-start gap-8">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
                            <Building2 className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-3xl md:text-5xl font-black tracking-tight">Studio Builder</h1>
                                <span className="px-3 py-1 bg-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-full border border-white/30">
                                    Coming Soon
                                </span>
                            </div>
                            <p className="text-white/70 font-medium text-lg">Visual studio layout designer</p>
                        </div>
                    </div>

                    <p className="text-white/80 text-lg font-medium max-w-xl leading-relaxed">
                        Design your physical studio space visually — drag and drop rooms, link equipment, 
                        and see live occupancy in real-time. The Studio Builder is currently in development.
                    </p>

                    <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-2xl px-5 py-3.5">
                        <Clock className="w-5 h-5 text-white/70 flex-shrink-0" />
                        <p className="text-sm font-semibold text-white/90">
                            Rooms are currently managed from the <strong>Studios</strong> page. 
                            The visual builder is coming in a future update.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Link href="/dashboard/studios">
                            <Button className="bg-white text-indigo-600 hover:bg-white/90 font-black gap-2 px-6 py-5 rounded-xl shadow-xl">
                                Manage Studios Now
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </Link>
                        <Link href="/dashboard/inventory">
                            <Button variant="outline" className="border-white/40 text-white hover:bg-white/10 font-semibold gap-2 px-6 py-5 rounded-xl bg-white/5">
                                View Inventory
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Feature Preview */}
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">What's Being Built</h2>
                    <div className="flex-1 h-px bg-gray-100" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {PLANNED_FEATURES.map((feature, i) => (
                        <div
                            key={i}
                            className="bg-white rounded-[1.75rem] border border-gray-100 p-7 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group"
                        >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${feature.color} group-hover:scale-110 transition-transform`}>
                                <feature.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-base font-black text-gray-900 uppercase tracking-tight mb-2">{feature.title}</h3>
                            <p className="text-sm text-gray-500 font-medium leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Current Alternative */}
            <div className="bg-amber-50 border border-amber-100 rounded-[2rem] p-8 flex flex-col sm:flex-row gap-6 items-start">
                <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-6 h-6 text-amber-700" />
                </div>
                <div className="flex-1 space-y-3">
                    <h3 className="text-base font-black text-amber-900 uppercase tracking-tight">
                        Use Studios in the Meantime
                    </h3>
                    <p className="text-sm text-amber-800 font-medium leading-relaxed max-w-xl">
                        You can create and manage studio rooms today from the <strong>Studios</strong> page. 
                        Rooms can be assigned to bookings in the schedule, and inventory items can be linked to them.
                        The Studio Builder will add a visual drag-and-drop layer on top of this foundation.
                    </p>
                    <div className="pt-1">
                        <Link href="/dashboard/studios">
                            <Button className="bg-amber-500 hover:bg-amber-600 text-white font-black gap-2 rounded-xl px-5 py-4 text-xs uppercase tracking-widest shadow-md shadow-amber-200">
                                Go to Studios
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
