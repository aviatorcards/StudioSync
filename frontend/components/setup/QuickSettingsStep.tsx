import { SetupWizardData, QuickSettings } from '@/types/setup'

interface StepProps {
    data: SetupWizardData
    updateQuickSettings: (settings: Partial<QuickSettings>) => void
    onNext: () => void
    onBack: () => void
}

export const QuickSettingsStep = ({ data, updateQuickSettings, onNext, onBack }: StepProps) => {
    const { quick_settings } = data

    const isValid = quick_settings.business_end_hour > quick_settings.business_start_hour

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (isValid) onNext()
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto py-4 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="border-b border-gray-200 pb-6">
                <h2 className="text-2xl font-bold leading-7 text-gray-900">Quick Configuration</h2>
                <p className="mt-1 text-sm leading-6 text-gray-600">
                    Set up some basics to get your schedule ready.
                </p>
            </div>

            <div className="space-y-8">
                <div>
                    <label htmlFor="duration" className="block text-sm font-medium leading-6 text-gray-900">
                        Default Lesson Duration
                    </label>
                    <div className="mt-2 relative">
                        <div className="flex items-center space-x-4">
                            <input
                                type="range"
                                min="15"
                                max="120"
                                step="15"
                                value={quick_settings.default_lesson_duration}
                                onChange={(e) => updateQuickSettings({ default_lesson_duration: parseInt(e.target.value) })}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                            <span className="text-lg font-semibold text-gray-900 min-w-[5rem] text-right">
                                {quick_settings.default_lesson_duration} <span className="text-sm font-normal text-gray-500">min</span>
                            </span>
                        </div>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">Typical length for a standard lesson.</p>
                </div>

                <div className="grid grid-cols-2 gap-8">
                    <div>
                        <label htmlFor="start-hour" className="block text-sm font-medium leading-6 text-gray-900">
                            Business Start Hour
                        </label>
                        <div className="mt-2">
                            <select
                                id="start-hour"
                                value={quick_settings.business_start_hour}
                                onChange={(e) => updateQuickSettings({ business_start_hour: parseInt(e.target.value) })}
                                className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            >
                                {Array.from({ length: 24 }).map((_, i) => (
                                    <option key={i} value={i}>
                                        {i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="end-hour" className="block text-sm font-medium leading-6 text-gray-900">
                            Business End Hour
                        </label>
                        <div className="mt-2">
                            <select
                                id="end-hour"
                                value={quick_settings.business_end_hour}
                                onChange={(e) => updateQuickSettings({ business_end_hour: parseInt(e.target.value) })}
                                className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            >
                                {Array.from({ length: 24 }).map((_, i) => (
                                    <option key={i} value={i} disabled={i <= quick_settings.business_start_hour}>
                                        {i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-6 flex items-center justify-between">
                <button
                    type="button"
                    onClick={onBack}
                    className="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-700"
                >
                    Back
                </button>
                <button
                    type="submit"
                    disabled={!isValid}
                    className="rounded-md bg-indigo-600 px-8 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    Continue
                </button>
            </div>
        </form>
    )
}
