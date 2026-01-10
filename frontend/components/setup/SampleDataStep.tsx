import { Switch } from '@headlessui/react'
import { SetupWizardData } from '@/types/setup'
import { Database, Sparkles } from 'lucide-react'

interface StepProps {
    data: SetupWizardData
    updateData: (section: keyof SetupWizardData, value: any) => void
    onNext: () => void
    onBack: () => void
    isLoading: boolean
}

export const SampleDataStep = ({ data, updateData, onNext, onBack, isLoading }: StepProps) => {
    const { create_sample_data } = data

    const handleComplete = () => {
        onNext()
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto py-4 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="border-b border-gray-200 pb-6 text-center">
                <h2 className="text-2xl font-bold leading-7 text-gray-900">One Last Thing...</h2>
                <p className="mt-1 text-sm leading-6 text-gray-600">
                    Would you like to populate your studio with sample data to see how everything looks?
                </p>
            </div>

            <div
                onClick={() => updateData('create_sample_data', !create_sample_data)}
                className={`
          relative flex items-center space-x-4 p-6 rounded-xl border-2 cursor-pointer transition-all duration-200
          ${create_sample_data ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}
        `}
            >
                <div className={`p-3 rounded-full ${create_sample_data ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                    <Sparkles className="h-6 w-6" />
                </div>

                <div className="flex-1">
                    <h3 className={`font-semibold ${create_sample_data ? 'text-indigo-900' : 'text-gray-900'}`}>
                        Create Sample Data
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Includes a sample teacher, a few students, and some demo lessons. Great for testing!
                    </p>
                </div>

                <Switch
                    checked={create_sample_data}
                    onChange={(checked) => updateData('create_sample_data', checked)}
                    className={`
            relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2
            ${create_sample_data ? 'bg-indigo-600' : 'bg-gray-200'}
            `}
                >
                    <span
                        aria-hidden="true"
                        className={`
                pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                ${create_sample_data ? 'translate-x-5' : 'translate-x-0'}
            `}
                    />
                </Switch>
            </div>

            <div className="pt-6 flex items-center justify-between">
                <button
                    onClick={onBack}
                    disabled={isLoading}
                    className="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-700 disabled:opacity-50"
                >
                    Back
                </button>
                <button
                    onClick={handleComplete}
                    disabled={isLoading}
                    className="rounded-md bg-indigo-600 px-8 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center space-x-2"
                >
                    {isLoading && (
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    )}
                    <span>{isLoading ? 'Setting up...' : 'Complete Setup'}</span>
                </button>
            </div>
        </div>
    )
}
