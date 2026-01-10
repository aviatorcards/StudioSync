export const metadata = {
    title: 'Initial Setup - StudioSync',
    description: 'Set up your music studio',
}

export default function SetupLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-gray-50">
            {children}
        </div>
    )
}
