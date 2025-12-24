import Image from 'next/image'

export const Logo = ({ className = "w-8 h-8" }: { className?: string }) => {
    const src = process.env.NODE_ENV === 'development' ? '/logo-dev.svg' : '/logo_final.png?v=2'

    return (
        <div className={`relative ${className}`}>
            <Image
                src={src}
                alt="StudioSync"
                fill
                className="object-contain"
                sizes="(max-width: 48px) 100vw, 48px"
            />
        </div>
    )
}
