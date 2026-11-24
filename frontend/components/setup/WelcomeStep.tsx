'use client'

import { useTranslations } from 'next-intl'
import { SetupWizardData } from '@/types/setup'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

interface StepProps {
    data: SetupWizardData
    updateData: (section: keyof SetupWizardData, value: any) => void
    onNext: () => void
}

export const WelcomeStep = ({ onNext }: StepProps) => {
    const t = useTranslations('Setup')
    return (
        <div className="flex flex-col items-center text-center space-y-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-4 max-w-lg">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                    {t('welcomeTitle')}
                </h1>
                <p className="text-lg text-gray-600">
                    {t('welcomeBody')}
                </p>
            </div>

            <div className="w-full max-w-md space-y-4">
                <p className="text-sm text-gray-500">
                    {t('welcomeLanguage')}
                </p>
                <LanguageSwitcher />
            </div>

            <div className="pt-8">
                <button
                    onClick={onNext}
                    className="rounded-full bg-indigo-600 px-8 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all hover:scale-105 active:scale-95"
                >
                    {t('getStarted')} &rarr;
                </button>
            </div>
        </div>
    )
}
