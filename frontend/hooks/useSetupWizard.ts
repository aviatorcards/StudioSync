import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    SetupWizardData,
    DEFAULT_FEATURES,
    SetupStatus,
    StudioInfo,
    AdminAccount,
    FeatureFlags,
    QuickSettings,
    EmailSettings
} from '@/types/setup'

// Initial state for the wizard
const INITIAL_DATA: SetupWizardData = {
    language: 'en',
    studio_info: {
        studio_name: '',
        studio_email: '',
        studio_phone: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'US',
        timezone: 'UTC',
        currency: 'USD',
    },
    admin_account: {
        admin_email: '',
        admin_first_name: '',
        admin_last_name: '',
        admin_password: '',
        admin_phone: '',
    },
    features: DEFAULT_FEATURES,
    quick_settings: {
        default_lesson_duration: 60,
        business_start_hour: 9,
        business_end_hour: 18,
        // Billing
        default_hourly_rate: 0,
        tax_rate: 0,
        charge_tax_on_lessons: false,
        invoice_due_days: 14,
        invoice_footer_text: '',
        // Scheduling
        cancellation_notice_period: 24,
        enable_online_booking: false,
        // Events
        default_event_duration: 60,
    },
    email_settings: {
        smtp_host: '',
        smtp_port: 587,
        smtp_username: '',
        smtp_password: '',
        smtp_from_email: '',
        smtp_use_tls: true,
    },
    create_sample_data: false,
}

export const useSetupWizard = () => {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(0)
    const [data, setData] = useState<SetupWizardData>(INITIAL_DATA)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const totalSteps = 3 // Studio & Admin, Features, Completion

    const updateData = (section: keyof SetupWizardData, value: any) => {
        setData((prev: SetupWizardData) => ({
            ...prev,
            [section]: value
        }))
    }

    const updateStudioInfo = (info: Partial<StudioInfo>) => {
        setData((prev: SetupWizardData) => ({
            ...prev,
            studio_info: { ...prev.studio_info, ...info }
        }))
    }

    const updateAdminAccount = (info: Partial<AdminAccount>) => {
        setData((prev: SetupWizardData) => ({
            ...prev,
            admin_account: { ...prev.admin_account, ...info }
        }))
    }

    const updateFeatures = (features: Partial<FeatureFlags>) => {
        setData((prev: SetupWizardData) => ({
            ...prev,
            features: { ...prev.features, ...features }
        }))
    }

    const updateQuickSettings = (settings: Partial<QuickSettings>) => {
        setData((prev: SetupWizardData) => ({
            ...prev,
            quick_settings: { ...prev.quick_settings, ...settings }
        }))
    }

    const updateEmailSettings = (settings: Partial<EmailSettings>) => {
        setData((prev: SetupWizardData) => ({
            ...prev,
            email_settings: { ...prev.email_settings, ...settings }
        }))
    }

    const nextStep = () => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep((prev: number) => prev + 1)
            window.scrollTo(0, 0)
        }
    }

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep((prev: number) => prev - 1)
            window.scrollTo(0, 0)
        }
    }

    const completeSetup = async () => {
        setIsLoading(true)
        setError(null)

        try {
            const payload = {
                language: data.language,

                // Studio Info
                ...data.studio_info,

                // Admin Account
                ...data.admin_account,

                // Features - Flattened for API
                ...data.features,

                // Quick Settings
                ...data.quick_settings,

                // Email Settings
                ...data.email_settings,

                // Sample Data
                create_sample_data: data.create_sample_data
            }

            const response = await fetch('/api/core/setup/complete/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            })

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const text = await response.text();
                throw new Error(`Unexpected non-JSON response from server: ${text.substring(0, 100)}...`);
            }

            const result = await response.json()

            if (!response.ok) {
                // DRF validation errors are usually an object with field names as keys
                if (typeof result === 'object' && !result.detail) {
                    const errorMessages = Object.entries(result)
                        .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
                        .join(' | ')
                    throw new Error(errorMessages || 'Setup failed. Please check your inputs.')
                }
                throw new Error(result.detail || 'Setup failed. Please check your inputs.')
            }

            // Store tokens
            if (typeof window !== 'undefined') {
                localStorage.setItem('access_token', result.tokens.access)
                localStorage.setItem('refresh_token', result.tokens.refresh)
            }

            // Move to completion step (last step)
            setCurrentStep(totalSteps - 1)

        } catch (err: any) {
            console.error('Setup error details:', err)
            setError(err.message || 'An unexpected error occurred during setup.')
        } finally {
            setIsLoading(false)
        }
    }

    return {
        currentStep,
        totalSteps,
        data,
        isLoading,
        error,
        updateData,
        updateStudioInfo,
        updateAdminAccount,
        updateFeatures,
        updateQuickSettings,
        updateEmailSettings,
        nextStep,
        prevStep,
        completeSetup
    }
}
