import { Switch } from '@headlessui/react'
import { SetupWizardData, FeatureFlags, FEATURE_DESCRIPTIONS } from '@/types/setup'
import * as Icons from 'lucide-react'

interface StepProps {
    data: SetupWizardData
    updateFeatures: (features: Partial<FeatureFlags>) => void
    onNext: () => void
    onBack: () => void
}

export const FeatureSelectionStep = ({ data, updateFeatures, onNext, onBack }: StepProps) => {
    const { features } = data

    const toggleFeature = (key: keyof FeatureFlags) => {
        updateFeatures({ [key]: !features[key] })
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto py-4 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="border-b border-gray-200 pb-6 text-center">
                <h2 className="text-2xl font-bold leading-7 text-gray-900">Customize Your Studio</h2>
                <p className="mt-1 text-sm leading-6 text-gray-600">
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
                            className={`
                relative flex items-start space-x-4 p-4 rounded-xl border transition-all duration-200
                ${isEnabled ? 'border-indigo-200 bg-indigo-50/50' : 'border-gray-200 hover:border-gray-300 bg-white'}
              `}
                        >
                            <div className={`
                flex-shrink-0 p-2 rounded-lg
                ${isEnabled ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'}
              `}>
                                <Icon className="h-6 w-6" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <p className={`text-sm font-medium ${isEnabled ? 'text-indigo-900' : 'text-gray-900'}`}>
                                        {info.name}
                                    </p>
                                    <Switch
                                        checked={isEnabled}
                                        onChange={() => toggleFeature(key)}
                                        className={`
                      relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2
                      ${isEnabled ? 'bg-indigo-600' : 'bg-gray-200'}
                    `}
                                    >
                                        <span
                                            aria-hidden="true"
                                            className={`
                        pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                        ${isEnabled ? 'translate-x-5' : 'translate-x-0'}
                      `}
                                        />
                                    </Switch>
                                </div>
                                <p className="mt-1 text-xs text-gray-500 pr-10">
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
                    className="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-700"
                >
                    Back
                </button>
                <button
                    onClick={onNext}
                    className="rounded-md bg-indigo-600 px-8 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all"
                >
                    Continue
                </button>
            </div>
        </div>
    )
}
