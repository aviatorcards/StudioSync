import { SetupWizardData, AdminAccount } from '@/types/setup'
import { HelpTooltip } from '@/components/ui/help-tooltip'

interface StepProps {
    data: SetupWizardData
    updateAdminAccount: (info: Partial<AdminAccount>) => void
    onNext: () => void
    onBack: () => void
}

export const AdminAccountStep = ({ data, updateAdminAccount, onNext, onBack }: StepProps) => {
    const { admin_account } = data

    const isValid =
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
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto py-4 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="border-b border-gray-200 pb-6">
                <h2 className="text-2xl font-bold leading-7 text-gray-900">Complete Your Profile</h2>
                <p className="mt-1 text-sm leading-6 text-gray-600">
                    This will be your primary administrator account for logging into StudioSync.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
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
                            className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
                            className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                    </div>
                </div>

                <div className="sm:col-span-2">
                    <label htmlFor="email" className="block text-sm flex items-center font-medium leading-6 text-gray-900">
                        Email Address *
                        <HelpTooltip content="This email will be used to log into the StudioSync dashboard." />
                    </label>
                    <div className="mt-2">
                        <input
                            type="email"
                            id="email"
                            autoComplete="email"
                            required
                            value={admin_account.admin_email}
                            onChange={(e) => updateAdminAccount({ admin_email: e.target.value })}
                            className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                    </div>
                </div>

                <div className="sm:col-span-2">
                    <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                        Details Password *
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
                            className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                        <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters long.</p>
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
