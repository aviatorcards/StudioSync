import { useEffect } from 'react'
import { SetupWizardData, TIMEZONES, CURRENCIES, StudioInfo, AdminAccount } from '@/types/setup'
import { HelpTooltip } from '@/components/ui/help-tooltip'

interface StepProps {
    data: SetupWizardData
    updateStudioInfo: (info: Partial<StudioInfo>) => void
    updateAdminAccount: (info: Partial<AdminAccount>) => void
    onNext: () => void
}

export const StudioAdminStep = ({ data, updateStudioInfo, updateAdminAccount, onNext }: StepProps) => {
    const { studio_info, admin_account } = data

    // Auto-detect timezone and currency on mount
    useEffect(() => {
        try {
            const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
            if (studio_info.timezone === 'UTC' && userTimezone) {
                const isValidTimezone = TIMEZONES.some(t => t.value === userTimezone)
                if (isValidTimezone) updateStudioInfo({ timezone: userTimezone })
            }

            if (studio_info.currency === 'USD') {
                const locale = navigator.language
                let detectedCurrency = 'USD'
                if (locale.includes('US')) detectedCurrency = 'USD'
                else if (locale.includes('GB')) detectedCurrency = 'GBP'
                else if (locale.match(/EU|FR|DE|IT|ES|NL|BE|AT|FI|IE|PT|GR|SK|EE|LV|LT|CY|MT/)) detectedCurrency = 'EUR'
                else if (locale.includes('CA')) detectedCurrency = 'CAD'
                else if (locale.includes('AU')) detectedCurrency = 'AUD'
                else if (locale.includes('JP')) detectedCurrency = 'JPY'

                const isValidCurrency = CURRENCIES.some(c => c.value === detectedCurrency)
                if (detectedCurrency !== 'USD' && isValidCurrency) updateStudioInfo({ currency: detectedCurrency })
            }
        } catch (e) {
            console.warn('Failed to auto-detect locale settings', e)
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const isValid =
        studio_info.studio_name &&
        studio_info.studio_email &&
        studio_info.timezone &&
        studio_info.currency &&
        admin_account.admin_first_name &&
        admin_account.admin_last_name &&
        admin_account.admin_email &&
        admin_account.admin_password &&
        admin_account.admin_password.length >= 8

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (isValid) onNext()
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-10 max-w-2xl mx-auto py-4 animate-in fade-in slide-in-from-right-8 duration-500">

            {/* Studio Info Section */}
            <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900">Studio Information</h2>
                    <p className="mt-1 text-sm leading-6 text-gray-600">
                        Tell us about your organization. This will appear on invoices and emails.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                        <label htmlFor="studio-name" className="block text-sm flex items-center font-medium leading-6 text-gray-900">
                            Studio Name *
                            <HelpTooltip content="The official name of your music school or studio. Used on invoices and emails." />
                        </label>
                        <div className="mt-2">
                            <input
                                type="text"
                                id="studio-name"
                                required
                                value={studio_info.studio_name}
                                onChange={(e) => updateStudioInfo({ studio_name: e.target.value })}
                                className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                placeholder="e.g. Melody Music School"
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-2">
                        <label htmlFor="studio-email" className="block text-sm font-medium leading-6 text-gray-900">
                            Business Email *
                        </label>
                        <div className="mt-2">
                            <input
                                type="email"
                                id="studio-email"
                                required
                                value={studio_info.studio_email}
                                onChange={(e) => updateStudioInfo({ studio_email: e.target.value })}
                                className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                placeholder="contact@myschool.com"
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-1">
                        <label htmlFor="timezone" className="block text-sm flex items-center font-medium leading-6 text-gray-900">
                            Timezone *
                            <HelpTooltip content="Affects all calendar events and notifications." />
                        </label>
                        <div className="mt-2">
                            <select
                                id="timezone"
                                required
                                value={studio_info.timezone}
                                onChange={(e) => updateStudioInfo({ timezone: e.target.value })}
                                className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            >
                                {TIMEZONES.map((tz) => (
                                    <option key={tz.value} value={tz.value}>{tz.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="sm:col-span-1">
                        <label htmlFor="currency" className="block text-sm flex items-center font-medium leading-6 text-gray-900">
                            Currency *
                            <HelpTooltip content="The default currency for all invoicing and transactions." />
                        </label>
                        <div className="mt-2">
                            <select
                                id="currency"
                                required
                                value={studio_info.currency}
                                onChange={(e) => updateStudioInfo({ currency: e.target.value })}
                                className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            >
                                {CURRENCIES.map((c) => (
                                    <option key={c.value} value={c.value}>{c.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Admin Account Section */}
            <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900">Admin Account</h2>
                    <p className="mt-1 text-sm leading-6 text-gray-600">
                        This will be your primary administrator account for logging into StudioSync.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                        <label htmlFor="first-name" className="block text-sm font-medium leading-6 text-gray-900">
                            First Name *
                        </label>
                        <div className="mt-2">
                            <input
                                type="text"
                                id="first-name"
                                required
                                value={admin_account.admin_first_name}
                                onChange={(e) => updateAdminAccount({ admin_first_name: e.target.value })}
                                className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-1">
                        <label htmlFor="last-name" className="block text-sm font-medium leading-6 text-gray-900">
                            Last Name *
                        </label>
                        <div className="mt-2">
                            <input
                                type="text"
                                id="last-name"
                                required
                                value={admin_account.admin_last_name}
                                onChange={(e) => updateAdminAccount({ admin_last_name: e.target.value })}
                                className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-2">
                        <label htmlFor="admin-email" className="block text-sm flex items-center font-medium leading-6 text-gray-900">
                            Email Address *
                            <HelpTooltip content="This email will be used to log into the StudioSync dashboard." />
                        </label>
                        <div className="mt-2">
                            <input
                                type="email"
                                id="admin-email"
                                autoComplete="email"
                                required
                                value={admin_account.admin_email}
                                onChange={(e) => updateAdminAccount({ admin_email: e.target.value })}
                                className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-2">
                        <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                            Password *
                        </label>
                        <div className="mt-2">
                            <input
                                type="password"
                                id="password"
                                autoComplete="new-password"
                                required
                                minLength={8}
                                value={admin_account.admin_password}
                                onChange={(e) => updateAdminAccount({ admin_password: e.target.value })}
                                className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                            <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters long.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-4 flex items-center justify-end">
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
