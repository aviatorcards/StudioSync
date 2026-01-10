'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSetupWizard } from '@/hooks/useSetupWizard'
import { WizardProgress } from '@/components/setup/WizardProgress'

// Steps
import { WelcomeStep } from '@/components/setup/WelcomeStep'
import { StudioInfoStep } from '@/components/setup/StudioInfoStep'
import { AdminAccountStep } from '@/components/setup/AdminAccountStep'
import { FeatureSelectionStep } from '@/components/setup/FeatureSelectionStep'
import { QuickSettingsStep } from '@/components/setup/QuickSettingsStep'
import EmailSettingsStep from '@/components/setup/EmailSettingsStep'
import { SampleDataStep } from '@/components/setup/SampleDataStep'
import { CompletionStep } from '@/components/setup/CompletionStep'

import { Music } from 'lucide-react'

export default function SetupPage() {
    const router = useRouter()
    const wizard = useSetupWizard()

    // Verify setup status on mount
    useEffect(() => {
        const checkStatus = async () => {
            try {
                const res = await fetch('/api/core/setup/status/')
                
                const contentType = res.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                   const text = await res.text();
                   console.error("Non-JSON response from setup status:", text);
                   return; // Exit if not JSON
                }

                const data = await res.json()
                if (data.is_completed && wizard.currentStep < 7) {
                    // If already setup, redirect to dashboard or login
                    router.replace('/dashboard') 
                }
            } catch (err) {
                console.error("Failed to check setup status", err)
            }
        }
        checkStatus()
    }, [router, wizard.currentStep])

    const renderStep = () => {
        switch (wizard.currentStep) {
            case 0:
                return <WelcomeStep
                    data={wizard.data}
                    updateData={wizard.updateData}
                    onNext={wizard.nextStep}
                />
            case 1:
                return <StudioInfoStep
                    data={wizard.data}
                    updateStudioInfo={wizard.updateStudioInfo}
                    onNext={wizard.nextStep}
                    onBack={wizard.prevStep}
                />
            case 2:
                return <AdminAccountStep
                    data={wizard.data}
                    updateAdminAccount={wizard.updateAdminAccount}
                    onNext={wizard.nextStep}
                    onBack={wizard.prevStep}
                />
            case 3:
                return <FeatureSelectionStep
                    data={wizard.data}
                    updateFeatures={wizard.updateFeatures}
                    onNext={wizard.nextStep}
                    onBack={wizard.prevStep}
                />
            case 4:
                return <QuickSettingsStep
                    data={wizard.data}
                    updateQuickSettings={wizard.updateQuickSettings}
                    onNext={wizard.nextStep}
                    onBack={wizard.prevStep}
                />
            case 5:
                return <EmailSettingsStep
                    data={wizard.data.email_settings}
                    updateData={wizard.updateEmailSettings}
                    onNext={wizard.nextStep}
                    onBack={wizard.prevStep}
                />
            case 6:
                return <SampleDataStep
                    data={wizard.data}
                    updateData={wizard.updateData}
                    onNext={wizard.completeSetup} // This triggers submission
                    onBack={wizard.prevStep}
                    isLoading={wizard.isLoading}
                />
            case 7:
                return <CompletionStep />
            default:
                return null
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden min-h-[600px] flex flex-col">
                {/* Header */}
                <div className="bg-white p-8 border-b border-gray-100 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <div className="bg-indigo-600 p-2 rounded-lg">
                            <Music className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                            StudioSync
                        </span>
                    </div>
                    <div className="text-sm font-medium text-gray-500">
                        Setup Wizard
                    </div>
                </div>

                {/* Progress Bar (Skipped on Welcome and Completion for cleanliness, or keep consistent) */}
                {wizard.currentStep > 0 && wizard.currentStep < 7 && (
                    <div className="px-12 pt-8">
                        <WizardProgress currentStep={wizard.currentStep} totalSteps={wizard.totalSteps} />
                    </div>
                )}

                {/* Content Area */}
                <div className="flex-1 px-12 py-10 overflow-y-auto">

                    {wizard.error && (
                        <div className="mb-6 rounded-md bg-red-50 p-4">
                            <div className="flex">
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">Something went wrong</h3>
                                    <div className="mt-2 text-sm text-red-700">
                                        <p>{wizard.error}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {renderStep()}

                </div>

                {/* Footer info (optional) */}
                <div className="bg-gray-50 p-4 border-t border-gray-100 text-center text-xs text-gray-400">
                    &copy; {new Date().getFullYear()} StudioSync. All rights reserved.
                </div>
            </div>
        </div>
    )
}
