'use client';

import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';
import {
    User,
    Building2,
    Palette,
    Bell,
    Mail,
    Server,
    Database,
    Key,
    ChevronRight,
    Layers,
    ShieldAlert,
    MapPin,
} from 'lucide-react';

const SECTIONS = [
    {
        title: 'Account',
        description: 'Profile photo, name, bio, and primary instrument',
        icon: User,
        href: '/dashboard/settings/general/?tab=profile',
        roles: ['admin', 'teacher', 'student', 'parent'],
    },
    {
        title: 'Security',
        description: 'Change your password and manage login settings',
        icon: ShieldAlert,
        href: '/dashboard/settings/general/?tab=security',
        roles: ['admin', 'teacher', 'student', 'parent'],
    },
    {
        title: 'Studio',
        description: 'Studio name, address, timezone, currency, and instruments',
        icon: Building2,
        href: '/dashboard/settings/general/?tab=studio',
        roles: ['admin'],
    },
    {
        title: 'Appearance',
        description: 'Theme, primary color, font size, and compact mode',
        icon: Palette,
        href: '/dashboard/settings/general/?tab=appearance',
        roles: ['admin', 'teacher', 'student', 'parent'],
    },
    {
        title: 'Notifications',
        description: 'Channels, alert types, and quiet hours',
        icon: Bell,
        href: '/dashboard/settings/general/?tab=notifications',
        roles: ['admin', 'teacher', 'student', 'parent'],
    },
    {
        title: 'Communication',
        description: 'Email and SMS notification preferences',
        icon: Mail,
        href: '/dashboard/settings/general/?tab=communication',
        roles: ['admin', 'teacher', 'student', 'parent'],
    },
    {
        title: 'Features',
        description: 'Enable or disable modules such as billing, messaging, and inventory',
        icon: Layers,
        href: '/dashboard/settings/features/',
        roles: ['admin'],
    },
    {
        title: 'API Keys',
        description: 'Generate keys for external integrations like 317booking',
        icon: Key,
        href: '/dashboard/settings/api-keys/',
        roles: ['admin'],
    },
    {
        title: 'Gig Venues',
        description: 'Manage venues and control who can post gigs for each',
        icon: MapPin,
        href: '/dashboard/settings/gig-venues/',
        roles: ['admin'],
    },
    {
        title: 'Technical',
        description: 'SMTP email server and SMS provider configuration',
        icon: Server,
        href: '/dashboard/settings/general/?tab=technical',
        roles: ['admin'],
    },
    {
        title: 'Maintenance',
        description: 'Export and import your full studio data for backup or migration',
        icon: Database,
        href: '/dashboard/settings/general/?tab=maintenance',
        roles: ['admin'],
    },
];

export default function SettingsHubPage() {
    const { currentUser } = useUser();

    const visible = SECTIONS.filter(
        s => !s.roles || (currentUser && s.roles.includes(currentUser.role as string))
    );

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="pt-8 pb-8">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Settings</h1>
                <p className="text-gray-500 mt-1 font-medium">Manage your account, studio, and integrations.</p>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {visible.map(section => {
                    const Icon = section.icon;
                    return (
                        <Link
                            key={section.href}
                            href={section.href}
                            className="group flex items-start gap-4 p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-150"
                        >
                            <div className="p-2.5 bg-primary/10 rounded-xl shrink-0 group-hover:bg-primary/15 transition-colors">
                                <Icon className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-gray-900 text-sm">{section.title}</p>
                                <p className="text-xs text-gray-500 mt-0.5 leading-snug">{section.description}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors mt-0.5 shrink-0" />
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
