import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

interface Props {
    currentStep: number
    totalSteps: number
}

const STEPS = [
    { name: 'Studio & Admin' },
    { name: 'Features' },
    { name: 'Done' },
]

export const WizardProgress = ({ currentStep, totalSteps }: Props) => {
    // Only show relevant steps, exclude Welcome (step 0) and Done (last step) from detailed progress bars if needed,
    // but here we show a simple numbered progress or named steps.
    // Let's use a simpler visual for 7 steps.

    return (
        <div className="w-full max-w-4xl mx-auto mb-8 px-4">
            <div className="relative flex justify-between">
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 transform -translate-y-1/2 rounded-full"></div>

                <div
                    className="absolute top-1/2 left-0 h-1 bg-indigo-600 -z-10 transform -translate-y-1/2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${(currentStep / (totalSteps - 1)) * 100}%` }}
                ></div>

                {STEPS.map((step, index) => {
                    const isCompleted = index < currentStep
                    const isCurrent = index === currentStep

                    return (
                        <div key={index} className="flex flex-col items-center">
                            <div
                                className={`
                                    w-8 h-8 rounded-full flex items-center justify-center border-2 bg-white transition-all duration-300
                                    ${isCompleted ? 'border-indigo-600 bg-indigo-600 text-white' :
                                        isCurrent ? 'border-indigo-600 text-indigo-600 scale-125' : 'border-gray-300 text-gray-400'}
                                `}
                            >
                                {isCompleted ? <Check className="w-4 h-4" /> : <span className="text-xs font-bold">{index + 1}</span>}
                            </div>
                            <span
                                className={`
                                    mt-2 text-xs font-medium transition-colors duration-300 hidden sm:block
                                    ${isCurrent ? 'text-indigo-600' : 'text-gray-500'}
                                `}
                            >
                                {step.name}
                            </span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
