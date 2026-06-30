import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

interface Props {
    currentStep: number
    totalSteps: number
}

const A = {
    amber: '#c17c2e',
    amberLight: 'rgba(193,124,46,0.12)',
    border: '#e3d4bc',
    muted: '#7a6145',
    faint: '#b09870',
} as const

const STEPS = [
    { name: 'Studio & Admin' },
    { name: 'Features' },
    { name: 'Done' },
]

export const WizardProgress = ({ currentStep, totalSteps }: Props) => {
    return (
        <div className="w-full max-w-4xl mx-auto mb-8 px-4">
            <div className="relative flex justify-between">
                {/* Track */}
                <div
                    className="absolute top-1/2 left-0 w-full h-0.5 -z-10 -translate-y-1/2 rounded-full"
                    style={{ backgroundColor: A.border }}
                />
                {/* Fill */}
                <div
                    className="absolute top-1/2 left-0 h-0.5 -z-10 -translate-y-1/2 rounded-full transition-all duration-500 ease-out"
                    style={{
                        width: `${(currentStep / (totalSteps - 1)) * 100}%`,
                        backgroundColor: A.amber,
                    }}
                />

                {STEPS.map((step, index) => {
                    const isCompleted = index < currentStep
                    const isCurrent = index === currentStep

                    return (
                        <div key={index} className="flex flex-col items-center">
                            <div
                                className="w-8 h-8 rounded-full flex items-center justify-center border-2 bg-white transition-all duration-300"
                                style={{
                                    borderColor: isCompleted || isCurrent ? A.amber : A.border,
                                    backgroundColor: isCompleted ? A.amber : '#fff',
                                    color: isCompleted ? '#fff' : isCurrent ? A.amber : A.faint,
                                    transform: isCurrent ? 'scale(1.25)' : 'scale(1)',
                                }}
                            >
                                {isCompleted
                                    ? <Check className="w-4 h-4" />
                                    : <span className="text-xs font-bold">{index + 1}</span>
                                }
                            </div>
                            <span
                                className="mt-2 text-xs font-medium transition-colors duration-300 hidden sm:block"
                                style={{ color: isCurrent ? A.amber : A.muted }}
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
