import { SetupWizardData, TIMEZONES, CURRENCIES, StudioInfo } from '@/types/setup'

interface StepProps {
    data: SetupWizardData
    updateStudioInfo: (info: Partial<StudioInfo>) => void
    onNext: () => void
    onBack: () => void
}

export const StudioInfoStep = ({ data, updateStudioInfo, onNext, onBack }: StepProps) => {
    const { studio_info } = data

    const isValid = studio_info.studio_name && studio_info.studio_email && studio_info.timezone && studio_info.currency

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (isValid) onNext()
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl mx-auto py-6 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="border-b border-gray-200 pb-8">
                <h2 className="text-3xl font-bold leading-7 text-gray-900">Studio Information</h2>
                <p className="mt-2 text-base leading-6 text-gray-600">
                    Tell us about your organization. This will be displayed on invoices and emails.
                </p>
            </div>

            <div className="space-y-7">
                <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                        <label htmlFor="studio-name" className="block text-base font-medium leading-6 text-gray-900">
                            Studio Name *
                        </label>
                        <div className="mt-2.5">
                            <input
                                type="text"
                                id="studio-name"
                                required
                                value={studio_info.studio_name}
                                onChange={(e) => updateStudioInfo({ studio_name: e.target.value })}
                                className="block w-full rounded-md border-0 py-3 px-4 text-base text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
                                placeholder="e.g. Melody Music School"
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-2">
                        <label htmlFor="studio-email" className="block text-base font-medium leading-6 text-gray-900">
                            Business Email *
                        </label>
                        <div className="mt-2.5">
                            <input
                                type="email"
                                id="studio-email"
                                required
                                value={studio_info.studio_email}
                                onChange={(e) => updateStudioInfo({ studio_email: e.target.value })}
                                className="block w-full rounded-md border-0 py-3 px-4 text-base text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
                                placeholder="contact@myschool.com"
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-1">
                        <label htmlFor="timezone" className="block text-base font-medium leading-6 text-gray-900">
                            Timezone *
                        </label>
                        <div className="mt-2.5">
                            <select
                                id="timezone"
                                required
                                value={studio_info.timezone}
                                onChange={(e) => updateStudioInfo({ timezone: e.target.value })}
                                className="block w-full rounded-md border-0 py-3 px-4 text-base text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
                            >
                                {TIMEZONES.map((tz) => (
                                    <option key={tz.value} value={tz.value}>
                                        {tz.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="sm:col-span-1">
                        <label htmlFor="currency" className="block text-base font-medium leading-6 text-gray-900">
                            Currency *
                        </label>
                        <div className="mt-2.5">
                            <select
                                id="currency"
                                required
                                value={studio_info.currency}
                                onChange={(e) => updateStudioInfo({ currency: e.target.value })}
                                className="block w-full rounded-md border-0 py-3 px-4 text-base text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
                            >
                                {CURRENCIES.map((c) => (
                                    <option key={c.value} value={c.value}>
                                        {c.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-8 flex items-center justify-between">
                <button
                    type="button"
                    onClick={onBack}
                    className="text-base font-semibold leading-6 text-gray-900 hover:text-gray-700 px-2 py-2"
                >
                    Back
                </button>
                <button
                    type="submit"
                    disabled={!isValid}
                    className="rounded-md bg-indigo-600 px-10 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    Continue
                </button>
            </div>
        </form>
    )
}
