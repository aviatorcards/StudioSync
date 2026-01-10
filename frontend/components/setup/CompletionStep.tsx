import Link from 'next/link'
import { motion } from 'framer-motion'
import { CheckCircle, ArrowRight } from 'lucide-react'
import { Confetti } from '@/components/Confetti'

export const CompletionStep = () => {
    return (
        <>
            <Confetti numberOfPieces={300} recycle={false} />
            <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in duration-500">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8"
                >
                    <CheckCircle className="w-12 h-12 text-green-600" />
                </motion.div>

            <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-4">
                All Set!
            </h1>
            <p className="text-lg text-gray-600 max-w-md mb-8">
                Your studio has been successfully configured. You are now ready to start managing your music school like a pro.
            </p>

            <div className="flex space-x-4">
                <Link
                    href="/dashboard"
                    className="rounded-full bg-indigo-600 px-8 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all hover:scale-105 active:scale-95 flex items-center"
                >
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
            </div>
            </div>
        </>
    )
}
