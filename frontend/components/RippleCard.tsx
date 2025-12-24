'use client'

import { useState, useRef, MouseEvent } from 'react'

interface RippleProps {
    children: React.ReactNode
    className?: string
}

interface Ripple {
    x: number
    y: number
    size: number
    key: number
}

export function RippleCard({ children, className = '' }: RippleProps) {
    const [ripples, setRipples] = useState<Ripple[]>([])
    const cardRef = useRef<HTMLDivElement>(null)

    const createRipple = (event: MouseEvent<HTMLDivElement>) => {
        const card = cardRef.current
        if (!card) return

        const rect = card.getBoundingClientRect()
        const size = Math.max(rect.width, rect.height)
        const x = event.clientX - rect.left - size / 2
        const y = event.clientY - rect.top - size / 2

        const newRipple = {
            x,
            y,
            size,
            key: Date.now()
        }

        setRipples([...ripples, newRipple])

        // Remove ripple after animation
        setTimeout(() => {
            setRipples(prev => prev.filter(r => r.key !== newRipple.key))
        }, 600)
    }

    return (
        <div
            ref={cardRef}
            className={`relative overflow-hidden ${className}`}
            onMouseEnter={createRipple}
        >
            {children}
            {ripples.map(ripple => (
                <span
                    key={ripple.key}
                    className="absolute rounded-full bg-primary/20 animate-ripple pointer-events-none"
                    style={{
                        left: ripple.x,
                        top: ripple.y,
                        width: ripple.size,
                        height: ripple.size,
                    }}
                />
            ))}
        </div>
    )
}
