import { Switch } from '@headlessui/react'
import { SetupWizardData, FeatureFlags, FEATURE_DESCRIPTIONS } from '@/types/setup'
import { ArrowRight, Loader2 } from 'lucide-react'
import * as Icons from 'lucide-react'

interface StepProps {
    data: SetupWizardData
    updateFeatures: (features: Partial<FeatureFlags>) => void
    onNext: () => void
    onBack: () => void
    isLoading?: boolean
}

const A = {
    border: '#e3d4bc',
    amber: '#c17c2e',
    amberDark: '#9e6020',
    amberLight: 'rgba(193,124,46,0.10)',
    amberBorder: 'rgba(193,124,46,0.25)',
    text: '#1c1309',
    muted: '#7a6145',
    faint: '#b09870',
    divider: '#ede4d6',
} as const

export const FeatureSelectionStep = ({ data, updateFeatures, onNext, onBack, isLoading = false }: StepProps) => {
    const { features } = data

    const toggleFeature = (key: keyof FeatureFlags) => {
        updateFeatures({ [key]: !features[key] })
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto py-4 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="pb-6 text-center" style={{ borderBottom: `1px solid ${A.divider}` }}>
                <h2 className="text-2xl font-bold" style={{ color: A.text, fontFamily: 'Outfit, sans-serif' }}>
                    Customize Your Studio
                </h2>
                <p className="mt-1 text-sm" style={{ color: A.muted }}>
                    Enable the features you need right now. You can always change this later in settings.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(Object.entries(FEATURE_DESCRIPTIONS) as [keyof FeatureFlags, typeof FEATURE_DESCRIPTIONS[keyof FeatureFlags]][]).map(([key, info]) => {
                    const Icon = (Icons as any)[info.icon] || Icons.HelpCircle
                    const isEnabled = features[key]

                    return (
                        <div
                            key={key}
                            className="relative flex items-start space-x-4 p-4 rounded-xl border transition-all duration-200 cursor-pointer"
                            style={{
                                borderColor: isEnabled ? A.amberBorder : A.border,
                                backgroundColor: isEnabled ? A.amberLight : '#fff',
                            }}
                            onClick={() => toggleFeature(key)}
                        >
                            <div
                                className="flex-shrink-0 p-2 rounded-lg"
                                style={{
                                    backgroundColor: isEnabled ? 'rgba(193,124,46,0.15)' : '#f5f0e8',
                                    color: isEnabled ? A.amber : A.faint,
                                }}
                            >
                                <Icon className="h-6 w-6" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold" style={{ color: isEnabled ? A.text : A.muted }}>
                                        {info.name}
                                    </p>
                                    <Switch
                                        checked={isEnabled}
                                        onChange={() => toggleFeature(key)}
                                        onClick={e => e.stopPropagation()}
                                        className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                                        style={{ backgroundColor: isEnabled ? A.amber : A.border }}
                                    >
                                        <span
                                            aria-hidden="true"
                                            className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                                            style={{ transform: isEnabled ? 'translateX(20px)' : 'translateX(0)' }}
                                        />
                                    </Switch>
                                </div>
                                <p className="mt-1 text-xs pr-10" style={{ color: A.faint }}>
                                    {info.description}
                                </p>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="pt-6 flex items-center justify-between">
                <button
                    onClick={onBack}
                    className="text-sm font-semibold transition-colors"
                    style={{ color: A.muted }}
                    onMouseEnter={e => (e.currentTarget.style.color = A.text)}
                    onMouseLeave={e => (e.currentTarget.style.color = A.muted)}
                >
                    ← Back
                </button>
                <button
                    onClick={onNext}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    style={{ backgroundColor: A.amber }}
                    onMouseEnter={e => { if (!isLoading) e.currentTarget.style.backgroundColor = A.amberDark }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = A.amber }}
                >
                    {isLoading
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Setting up…</>
                        : <>Complete Setup <ArrowRight className="w-4 h-4" /></>
                    }
                </button>
            </div>
        </div>
    )
}
