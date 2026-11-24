'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useUser } from '@/contexts/UserContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
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
        titleKey: 'account' as const,
        descriptionKey: 'accountHelp' as const,
        icon: User,
        href: '/dashboard/settings/general/?tab=profile',
        roles: ['admin', 'teacher', 'student', 'parent'],
    },
    {
        titleKey: 'security' as const,
        descriptionKey: 'securityHelp' as const,
        icon: ShieldAlert,
        href: '/dashboard/settings/general/?tab=security',
        roles: ['admin', 'teacher', 'student', 'parent'],
    },
    {
        titleKey: 'studio' as const,
        descriptionKey: 'studioHelp' as const,
        icon: Building2,
        href: '/dashboard/settings/general/?tab=studio',
        roles: ['admin'],
    },
    {
        titleKey: 'appearance' as const,
        descriptionKey: 'appearanceHelp' as const,
        icon: Palette,
        href: '/dashboard/settings/general/?tab=appearance',
        roles: ['admin', 'teacher', 'student', 'parent'],
    },
    {
        titleKey: 'notifications' as const,
        descriptionKey: 'notificationsHelp' as const,
        icon: Bell,
        href: '/dashboard/settings/general/?tab=notifications',
        roles: ['admin', 'teacher', 'student', 'parent'],
    },
    {
        titleKey: 'communication' as const,
        descriptionKey: 'communicationHelp' as const,
        icon: Mail,
        href: '/dashboard/settings/general/?tab=communication',
        roles: ['admin', 'teacher', 'student', 'parent'],
    },
    {
        titleKey: 'features' as const,
        descriptionKey: 'featuresHelp' as const,
        icon: Layers,
        href: '/dashboard/settings/features/',
        roles: ['admin'],
    },
    {
        titleKey: 'apiKeys' as const,
        descriptionKey: 'apiKeysHelp' as const,
        icon: Key,
        href: '/dashboard/settings/api-keys/',
        roles: ['admin'],
    },
    {
        titleKey: 'venues' as const,
        descriptionKey: 'venuesHelp' as const,
        icon: MapPin,
        href: '/dashboard/settings/gig-venues/',
        roles: ['admin'],
    },
    {
        titleKey: 'technical' as const,
        descriptionKey: 'technicalHelp' as const,
        icon: Server,
        href: '/dashboard/settings/general/?tab=technical',
        roles: ['admin'],
    },
    {
        titleKey: 'maintenance' as const,
        descriptionKey: 'maintenanceHelp' as const,
        icon: Database,
        href: '/dashboard/settings/general/?tab=maintenance',
        roles: ['admin'],
    },
];

export default function SettingsHubPage() {
    const t = useTranslations('Settings');
    const { currentUser } = useUser();

    const visible = SECTIONS.filter(
        s => !s.roles || (currentUser && s.roles.includes(currentUser.role as string))
    );

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="pt-8 pb-8">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">{t('title')}</h1>
                <p className="text-gray-500 mt-1 font-medium">{t('subtitle')}</p>
            </header>

            <section className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
                <div>
                    <p className="font-bold text-gray-900 text-sm">{t('language')}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-snug max-w-xl">{t('languageHelp')}</p>
                </div>
                <LanguageSwitcher />
            </section>

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
                                <p className="font-bold text-gray-900 text-sm">{t(section.titleKey)}</p>
                                <p className="text-xs text-gray-500 mt-0.5 leading-snug">{t(section.descriptionKey)}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors mt-0.5 shrink-0" />
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
