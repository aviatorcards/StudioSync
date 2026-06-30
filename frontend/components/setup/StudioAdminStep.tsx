import { useEffect, useState } from 'react'
import { SetupWizardData, TIMEZONES, CURRENCIES, StudioInfo, AdminAccount } from '@/types/setup'
import { HelpTooltip } from '@/components/ui/help-tooltip'
import { detectLocation, GeoLocation } from '@/lib/geolocate'
import { ArrowRight, Loader2, MapPin, X } from 'lucide-react'

interface StepProps {
    data: SetupWizardData
    updateStudioInfo: (info: Partial<StudioInfo>) => void
    updateAdminAccount: (info: Partial<AdminAccount>) => void
    onNext: () => void
}

type GeoStatus = 'idle' | 'loading' | 'detected' | 'error'

const A = {
    bg: '#faf7f2',
    border: '#e3d4bc',
    amber: '#c17c2e',
    amberDark: '#9e6020',
    amberLight: 'rgba(193,124,46,0.12)',
    text: '#1c1309',
    muted: '#7a6145',
    faint: '#b09870',
    divider: '#ede4d6',
} as const

const fieldFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = A.amber
    e.currentTarget.style.backgroundColor = '#fff'
    e.currentTarget.style.boxShadow = `0 0 0 3px ${A.amberLight}`
    e.currentTarget.style.outline = 'none'
}
const fieldBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>, bg = A.bg) => {
    e.currentTarget.style.borderColor = A.border
    e.currentTarget.style.backgroundColor = bg
    e.currentTarget.style.boxShadow = 'none'
}

const inputClass = 'block w-full py-2.5 px-3 rounded-xl border text-sm transition-all outline-none'
const inputStyle = { borderColor: A.border, backgroundColor: A.bg, color: A.text }

export const StudioAdminStep = ({ data, updateStudioInfo, updateAdminAccount, onNext }: StepProps) => {
    const { studio_info, admin_account } = data
    const [geoStatus, setGeoStatus] = useState<GeoStatus>('idle')
    const [geoLocation, setGeoLocation] = useState<GeoLocation | null>(null)

    useEffect(() => {
        try {
            const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
            if (studio_info.timezone === 'UTC' && userTimezone) {
                const isValid = TIMEZONES.some(t => t.value === userTimezone)
                if (isValid) updateStudioInfo({ timezone: userTimezone })
            }
            if (studio_info.currency === 'USD') {
                const locale = navigator.language
                let detectedCurrency = 'USD'
                if (locale.includes('GB')) detectedCurrency = 'GBP'
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

    const handleDetectLocation = async () => {
        setGeoStatus('loading')
        try {
            const geo = await detectLocation()
            setGeoLocation(geo)
            if (geo.timezone) updateStudioInfo({ timezone: geo.timezone })
            setGeoStatus('detected')
        } catch {
            setGeoStatus('error')
        }
    }

    const timezoneOptions = TIMEZONES.some(t => t.value === studio_info.timezone)
        ? TIMEZONES
        : [{ value: studio_info.timezone, label: studio_info.timezone }, ...TIMEZONES]

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

            {/* Studio Info */}
            <div className="space-y-6">
                <div className="pb-4" style={{ borderBottom: `1px solid ${A.divider}` }}>
                    <h2 className="text-2xl font-bold" style={{ color: A.text, fontFamily: 'Outfit, sans-serif' }}>
                        Studio Information
                    </h2>
                    <p className="mt-1 text-sm" style={{ color: A.muted }}>
                        Tell us about your organization. This will appear on invoices and emails.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                        <label htmlFor="studio-name" className="flex items-center text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: A.muted }}>
                            Studio Name *
                            <HelpTooltip content="The official name of your music school or studio. Used on invoices and emails." />
                        </label>
                        <input
                            type="text"
                            id="studio-name"
                            required
                            value={studio_info.studio_name}
                            onChange={e => updateStudioInfo({ studio_name: e.target.value })}
                            className={inputClass}
                            style={inputStyle}
                            placeholder="e.g. Melody Music School"
                            onFocus={fieldFocus}
                            onBlur={e => fieldBlur(e)}
                        />
                    </div>

                    <div className="sm:col-span-2">
                        <label htmlFor="studio-email" className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: A.muted }}>
                            Business Email *
                        </label>
                        <input
                            type="email"
                            id="studio-email"
                            required
                            value={studio_info.studio_email}
                            onChange={e => updateStudioInfo({ studio_email: e.target.value })}
                            className={inputClass}
                            style={inputStyle}
                            placeholder="contact@myschool.com"
                            onFocus={fieldFocus}
                            onBlur={e => fieldBlur(e)}
                        />
                    </div>

                    <div className="sm:col-span-1">
                        <label htmlFor="timezone" className="flex items-center text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: A.muted }}>
                            Timezone *
                            <HelpTooltip content="Affects all calendar events and notifications." />
                        </label>
                        <div className="space-y-2">
                            <select
                                id="timezone"
                                required
                                value={studio_info.timezone}
                                onChange={e => updateStudioInfo({ timezone: e.target.value })}
                                className={inputClass}
                                style={inputStyle}
                                onFocus={fieldFocus}
                                onBlur={e => fieldBlur(e)}
                            >
                                {timezoneOptions.map(tz => (
                                    <option key={tz.value} value={tz.value}>{tz.label}</option>
                                ))}
                            </select>

                            {geoStatus === 'idle' && (
                                <button
                                    type="button"
                                    onClick={handleDetectLocation}
                                    className="flex items-center gap-1.5 text-xs font-semibold transition-colors"
                                    style={{ color: A.amber }}
                                    onMouseEnter={e => (e.currentTarget.style.color = A.amberDark)}
                                    onMouseLeave={e => (e.currentTarget.style.color = A.amber)}
                                >
                                    <MapPin className="w-3 h-3" />
                                    Detect my location
                                </button>
                            )}
                            {geoStatus === 'loading' && (
                                <span className="flex items-center gap-1.5 text-xs" style={{ color: A.faint }}>
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    Detecting…
                                </span>
                            )}
                            {geoStatus === 'detected' && geoLocation && (
                                <span
                                    className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full"
                                    style={{ backgroundColor: 'rgba(193,124,46,0.1)', color: A.amber, border: `1px solid rgba(193,124,46,0.2)` }}
                                >
                                    <MapPin className="w-3 h-3" />
                                    {geoLocation.city && geoLocation.country
                                        ? `${geoLocation.city}, ${geoLocation.country}`
                                        : geoLocation.timezone}
                                    <button type="button" onClick={() => { setGeoStatus('idle'); setGeoLocation(null) }}>
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            )}
                            {geoStatus === 'error' && (
                                <span className="flex items-center gap-1.5 text-xs" style={{ color: '#b54040' }}>
                                    Could not detect location.{' '}
                                    <button type="button" onClick={() => setGeoStatus('idle')} className="underline">
                                        Try again
                                    </button>
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="sm:col-span-1">
                        <label htmlFor="currency" className="flex items-center text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: A.muted }}>
                            Currency *
                            <HelpTooltip content="The default currency for all invoicing and transactions." />
                        </label>
                        <select
                            id="currency"
                            required
                            value={studio_info.currency}
                            onChange={e => updateStudioInfo({ currency: e.target.value })}
                            className={inputClass}
                            style={inputStyle}
                            onFocus={fieldFocus}
                            onBlur={e => fieldBlur(e)}
                        >
                            {CURRENCIES.map(c => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Admin Account */}
            <div className="space-y-6">
                <div className="pb-4" style={{ borderBottom: `1px solid ${A.divider}` }}>
                    <h2 className="text-2xl font-bold" style={{ color: A.text, fontFamily: 'Outfit, sans-serif' }}>
                        Admin Account
                    </h2>
                    <p className="mt-1 text-sm" style={{ color: A.muted }}>
                        This will be your primary administrator account for logging into StudioSync.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                        <label htmlFor="first-name" className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: A.muted }}>
                            First Name *
                        </label>
                        <input
                            type="text"
                            id="first-name"
                            required
                            value={admin_account.admin_first_name}
                            onChange={e => updateAdminAccount({ admin_first_name: e.target.value })}
                            className={inputClass}
                            style={inputStyle}
                            onFocus={fieldFocus}
                            onBlur={e => fieldBlur(e)}
                        />
                    </div>

                    <div className="sm:col-span-1">
                        <label htmlFor="last-name" className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: A.muted }}>
                            Last Name *
                        </label>
                        <input
                            type="text"
                            id="last-name"
                            required
                            value={admin_account.admin_last_name}
                            onChange={e => updateAdminAccount({ admin_last_name: e.target.value })}
                            className={inputClass}
                            style={inputStyle}
                            onFocus={fieldFocus}
                            onBlur={e => fieldBlur(e)}
                        />
                    </div>

                    <div className="sm:col-span-2">
                        <label htmlFor="admin-email" className="flex items-center text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: A.muted }}>
                            Email Address *
                            <HelpTooltip content="This email will be used to log into the StudioSync dashboard." />
                        </label>
                        <input
                            type="email"
                            id="admin-email"
                            autoComplete="email"
                            required
                            value={admin_account.admin_email}
                            onChange={e => updateAdminAccount({ admin_email: e.target.value })}
                            className={inputClass}
                            style={inputStyle}
                            onFocus={fieldFocus}
                            onBlur={e => fieldBlur(e)}
                        />
                    </div>

                    <div className="sm:col-span-2">
                        <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: A.muted }}>
                            Password *
                        </label>
                        <input
                            type="password"
                            id="password"
                            autoComplete="new-password"
                            required
                            minLength={8}
                            value={admin_account.admin_password}
                            onChange={e => updateAdminAccount({ admin_password: e.target.value })}
                            className={inputClass}
                            style={inputStyle}
                            placeholder="••••••••"
                            onFocus={fieldFocus}
                            onBlur={e => fieldBlur(e)}
                        />
                        <p className="mt-1.5 text-xs" style={{ color: A.faint }}>Must be at least 8 characters.</p>
                    </div>
                </div>
            </div>

            <div className="pt-4 flex justify-end">
                <button
                    type="submit"
                    disabled={!isValid}
                    className="flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: A.amber }}
                    onMouseEnter={e => { if (isValid) e.currentTarget.style.backgroundColor = A.amberDark }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = A.amber }}
                >
                    Continue
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </form>
    )
}
