'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSetupWizard } from '@/hooks/useSetupWizard'
import { WizardProgress } from '@/components/setup/WizardProgress'
import { Logo } from '@/components/Logo'

// Steps
import { StudioAdminStep } from '@/components/setup/StudioAdminStep'
import { FeatureSelectionStep } from '@/components/setup/FeatureSelectionStep'
import { CompletionStep } from '@/components/setup/CompletionStep'

const A = {
    bg: '#faf7f2',
    card: '#ffffff',
    panel: '#1c1309',
    border: '#e3d4bc',
    amber: '#c17c2e',
    text: '#1c1309',
    muted: '#7a6145',
    faint: '#b09870',
    panelText: 'rgba(250,247,242,0.9)',
    panelMuted: 'rgba(250,247,242,0.55)',
} as const

const staffLines: React.CSSProperties = {
    backgroundImage: `repeating-linear-gradient(
        to bottom,
        transparent 0px,
        transparent 27px,
        rgba(193,124,46,0.07) 27px,
        rgba(193,124,46,0.07) 28px
    )`,
}

export default function SetupPage() {
    const router = useRouter()
    const wizard = useSetupWizard()

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const res = await fetch('/api/core/setup/status/')
                const contentType = res.headers.get('content-type')
                if (!contentType || !contentType.includes('application/json')) return
                const data = await res.json()
                if (data.is_completed && wizard.currentStep < wizard.totalSteps - 1) {
                    router.replace('/dashboard')
                }
            } catch (err) {
                console.error('Failed to check setup status', err)
            }
        }
        checkStatus()
    }, [router, wizard.currentStep, wizard.totalSteps])

    const renderStep = () => {
        switch (wizard.currentStep) {
            case 0:
                return (
                    <StudioAdminStep
                        data={wizard.data}
                        updateStudioInfo={wizard.updateStudioInfo}
                        updateAdminAccount={wizard.updateAdminAccount}
                        onNext={wizard.nextStep}
                    />
                )
            case 1:
                return (
                    <FeatureSelectionStep
                        data={wizard.data}
                        updateFeatures={wizard.updateFeatures}
                        onNext={wizard.completeSetup}
                        onBack={wizard.prevStep}
                        isLoading={wizard.isLoading}
                    />
                )
            case 2:
                return <CompletionStep />
            default:
                return null
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ backgroundColor: A.bg }}>
            <div
                className="w-full max-w-5xl rounded-2xl overflow-hidden flex flex-col"
                style={{
                    backgroundColor: A.card,
                    border: `1px solid ${A.border}`,
                    boxShadow: '0 8px 48px rgba(28,19,9,0.1)',
                    minHeight: '600px',
                }}
            >
                {/* Header — dark panel like the login left-side */}
                <div
                    className="p-7 flex justify-between items-center"
                    style={{ backgroundColor: A.panel, ...staffLines }}
                >
                    <div className="flex items-center gap-2.5">
                        <Logo className="w-8 h-8" />
                        <span
                            className="text-lg font-bold"
                            style={{ color: A.panelText, fontFamily: 'Outfit, sans-serif' }}
                        >
                            StudioSync
                        </span>
                    </div>
                    <span
                        className="text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full"
                        style={{
                            color: A.amber,
                            backgroundColor: 'rgba(193,124,46,0.12)',
                            border: '1px solid rgba(193,124,46,0.2)',
                        }}
                    >
                        Setup Wizard
                    </span>
                </div>

                {/* Progress Bar */}
                {wizard.currentStep > 0 && wizard.currentStep < wizard.totalSteps - 1 && (
                    <div className="px-12 pt-8">
                        <WizardProgress currentStep={wizard.currentStep} totalSteps={wizard.totalSteps} />
                    </div>
                )}

                {/* Content Area */}
                <div className="flex-1 px-12 py-10 overflow-y-auto">
                    {wizard.error && (
                        <div
                            className="mb-6 flex items-start gap-2.5 p-4 rounded-xl text-sm"
                            style={{
                                backgroundColor: 'rgba(181,64,64,0.06)',
                                border: '1px solid rgba(181,64,64,0.2)',
                                color: '#b54040',
                            }}
                        >
                            <p>{wizard.error}</p>
                        </div>
                    )}
                    {renderStep()}
                </div>

                {/* Footer */}
                <div
                    className="p-4 border-t text-center text-xs"
                    style={{ backgroundColor: A.bg, borderColor: A.border, color: A.faint }}
                >
                    &copy; {new Date().getFullYear()} StudioSync &middot; Open source &middot; GPL-3.0
                </div>
            </div>
        </div>
    )
}
