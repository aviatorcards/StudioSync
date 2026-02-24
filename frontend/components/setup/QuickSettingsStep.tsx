import React from 'react'
import { SetupWizardData, QuickSettings } from '@/types/setup'
import { HelpTooltip } from '@/components/ui/help-tooltip'

interface StepProps {
    data: SetupWizardData
    updateQuickSettings: (settings: Partial<QuickSettings>) => void
    onNext: () => void
    onBack: () => void
}

export const QuickSettingsStep = ({ data, updateQuickSettings, onNext, onBack }: StepProps) => {
    const { quick_settings } = data

    // Allow any time range, including overnight (e.g. 4 PM to 2 AM)
    const isValid = true

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

            <div className="space-y-6">
                
                {/* Section: Scheduling Rules */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                    <h3 className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-2">Scheduling Rules</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Business Start Hour</label>
                            <select
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
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Business End Hour</label>
                            <select
                                value={quick_settings.business_end_hour}
                                onChange={(e) => updateQuickSettings({ business_end_hour: parseInt(e.target.value) })}
                                className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            >
                                {Array.from({ length: 24 }).map((_, i) => (
                                    <option key={i} value={i}>
                                        {i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`}
                                    </option>
                                ))}
                            </select>
                            <p className="mt-1 text-xs text-gray-500">
                                {quick_settings.business_end_hour < quick_settings.business_start_hour 
                                    ? "Overnight schedule selected." 
                                    : "Standard daily schedule."}
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm flex items-center font-medium text-gray-700">
                                Default Lesson Duration (min)
                                <HelpTooltip content="The standard length for a new lesson booking." />
                            </label>
                            <input
                                type="range"
                                min="15"
                                max="120"
                                step="15"
                                value={quick_settings.default_lesson_duration}
                                onChange={(e) => updateQuickSettings({ default_lesson_duration: parseInt(e.target.value) })}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-2"
                            />
                            <div className="text-center text-sm font-medium text-indigo-600 mt-1">
                                {quick_settings.default_lesson_duration} minutes
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm flex items-center font-medium text-gray-700">
                                Cancellation Notice (Hours)
                                <HelpTooltip content="Minimum hours required to cancel without penalty." />
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={quick_settings.cancellation_notice_period ?? 24}
                                onChange={(e) => updateQuickSettings({ cancellation_notice_period: parseInt(e.target.value) })}
                                className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                        </div>
                    </div>
                </div>

                {/* Section: Billing Settings */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                    <h3 className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-2">Billing Settings</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Default Rate / Hour</label>
                            <div className="relative mt-1 rounded-md shadow-sm">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <span className="text-gray-500 sm:text-sm">$</span>
                                </div>
                                <input
                                    type="number"
                                    min="0"
                                    value={quick_settings.default_hourly_rate ?? 0}
                                    onChange={(e) => updateQuickSettings({ default_hourly_rate: parseFloat(e.target.value) })}
                                    className="block w-full rounded-md border-0 py-1.5 pl-7 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm flex items-center font-medium text-gray-700">
                                Tax Rate (%)
                                <HelpTooltip content="Percentage tax applied to taxable invoice items." />
                            </label>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    value={quick_settings.tax_rate ?? 0}
                                    onChange={(e) => updateQuickSettings({ tax_rate: parseFloat(e.target.value) })}
                                    className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                            <div className="mt-2 flex items-center space-x-2">
                                <input
                                    id="tax_lessons"
                                    type="checkbox"
                                    checked={quick_settings.charge_tax_on_lessons ?? false}
                                    onChange={(e) => updateQuickSettings({ charge_tax_on_lessons: e.target.checked })}
                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                />
                                <label htmlFor="tax_lessons" className="text-xs text-gray-500">Apply to Lessons</label>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Invoice Due (Days)</label>
                            <input
                                type="number"
                                min="0"
                                value={quick_settings.invoice_due_days ?? 14}
                                onChange={(e) => updateQuickSettings({ invoice_due_days: parseInt(e.target.value) })}
                                className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                        </div>
                        <div className="col-span-1 sm:col-span-3">
                            <label className="block text-sm font-medium text-gray-700">Invoice Footer Note</label>
                            <input
                                type="text"
                                placeholder="Thank you for your business!"
                                value={quick_settings.invoice_footer_text ?? ''}
                                onChange={(e) => updateQuickSettings({ invoice_footer_text: e.target.value })}
                                className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                        </div>
                    </div>
                </div>

                {/* Section: Event Settings */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                     <h3 className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-2">Event Settings</h3>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Default Event Duration (min)</label>
                            <input
                                type="number"
                                min="15"
                                step="15"
                                value={quick_settings.default_event_duration ?? 60}
                                onChange={(e) => updateQuickSettings({ default_event_duration: parseInt(e.target.value) })}
                                className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                        </div>
                        <div className="flex items-center space-x-3 pt-6">
                            <input
                                id="online_booking"
                                type="checkbox"
                                checked={quick_settings.enable_online_booking ?? false}
                                onChange={(e) => updateQuickSettings({ enable_online_booking: e.target.checked })}
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                            />
                            <label htmlFor="online_booking" className="text-sm font-medium text-gray-900">Enable Online Booking</label>
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
