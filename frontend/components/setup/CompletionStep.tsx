import Link from 'next/link'
import { motion } from 'framer-motion'
import { CheckCircle, ArrowRight } from 'lucide-react'
import { Confetti } from '@/components/Confetti'

const A = {
    amber: '#c17c2e',
    amberDark: '#9e6020',
    text: '#1c1309',
    muted: '#7a6145',
} as const

export const CompletionStep = () => {
    return (
        <>
            <Confetti numberOfPieces={300} recycle={false} />
            <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in duration-500">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                    className="w-24 h-24 rounded-full flex items-center justify-center mb-8"
                    style={{ backgroundColor: 'rgba(193,124,46,0.12)', border: '2px solid rgba(193,124,46,0.25)' }}
                >
                    <CheckCircle className="w-12 h-12" style={{ color: A.amber }} />
                </motion.div>

                <h1 className="text-4xl font-bold tracking-tight mb-4" style={{ color: A.text, fontFamily: 'Outfit, sans-serif' }}>
                    All Set!
                </h1>
                <p className="text-lg max-w-md mb-8" style={{ color: A.muted }}>
                    Your studio has been configured. You&apos;re ready to start managing your music school.
                </p>

                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-base font-semibold text-white transition-all hover:scale-105 active:scale-95"
                    style={{ backgroundColor: A.amber }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = A.amberDark)}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = A.amber)}
                >
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5" />
                </Link>
            </div>
        </>
    )
}
