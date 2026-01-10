'use client'

import { useEffect, useRef } from 'react'

interface ConfettiProps {
    numberOfPieces?: number
    recycle?: boolean
}

export const Confetti = ({ numberOfPieces = 200, recycle = false }: ConfettiProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        canvas.width = window.innerWidth
        canvas.height = window.innerHeight

        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#a29bfe', '#fd79a8', '#fdcb6e']

        interface Particle {
            x: number
            y: number
            size: number
            color: string
            speedY: number
            speedX: number
            rotation: number
            rotationSpeed: number
        }

        const particles: Particle[] = []

        for (let i = 0; i < numberOfPieces; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height - canvas.height,
                size: Math.random() * 8 + 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                speedY: Math.random() * 3 + 2,
                speedX: Math.random() * 2 - 1,
                rotation: Math.random() * 360,
                rotationSpeed: Math.random() * 4 - 2,
            })
        }

        let animationId: number

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            particles.forEach((particle, index) => {
                ctx.save()
                ctx.translate(particle.x, particle.y)
                ctx.rotate((particle.rotation * Math.PI) / 180)
                ctx.fillStyle = particle.color
                ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size)
                ctx.restore()

                particle.y += particle.speedY
                particle.x += particle.speedX
                particle.rotation += particle.rotationSpeed

                if (particle.y > canvas.height) {
                    if (recycle) {
                        particle.y = -10
                        particle.x = Math.random() * canvas.width
                    } else {
                        particles.splice(index, 1)
                    }
                }
            })

            if (particles.length > 0 || recycle) {
                animationId = requestAnimationFrame(animate)
            }
        }

        animate()

        const handleResize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }

        window.addEventListener('resize', handleResize)

        return () => {
            cancelAnimationFrame(animationId)
            window.removeEventListener('resize', handleResize)
        }
    }, [numberOfPieces, recycle])

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-50"
            style={{ width: '100%', height: '100%' }}
        />
    )
}
