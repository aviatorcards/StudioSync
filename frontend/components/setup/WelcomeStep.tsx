import { motion } from 'framer-motion'
import { LANGUAGES, SetupWizardData } from '@/types/setup'

interface StepProps {
    data: SetupWizardData
    updateData: (section: keyof SetupWizardData, value: any) => void
    onNext: () => void
}

export const WelcomeStep = ({ data, updateData, onNext }: StepProps) => {
    return (
        <div className="flex flex-col items-center text-center space-y-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-4 max-w-lg">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                    Welcome to StudioSync
                </h1>
                <p className="text-lg text-gray-600">
                    Let's get your music studio set up in just a few minutes.
                    We'll configure your studio details, create your admin account, and customize your features.
                </p>
            </div>

            <div className="w-full max-w-md space-y-4">
                <label className="block text-sm font-medium text-gray-700 text-left">
                    Select Language
                </label>
                <div className="grid grid-cols-2 gap-3">
                    {LANGUAGES.map((lang) => (
                        <button
                            key={lang.value}
                            onClick={() => updateData('language', lang.value)}
                            className={`
                relative flex items-center justify-center px-4 py-3 border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500
                ${data.language === lang.value
                                    ? 'border-indigo-600 ring-2 ring-indigo-600 text-indigo-700 bg-indigo-50'
                                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'}
              `}
                        >
                            {lang.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="pt-8">
                <button
                    onClick={onNext}
                    className="rounded-full bg-indigo-600 px-8 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all hover:scale-105 active:scale-95"
                >
                    Get Started &rarr;
                </button>
            </div>
        </div>
    )
}
