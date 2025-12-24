import { StudioThemeProvider } from '@/contexts/StudioThemeContext';
import { notFound } from 'next/navigation';

async function getStudio(subdomain: string) {
    const baseUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL;
    const res = await fetch(`${baseUrl}/core/studios/by-subdomain/${subdomain}/`, {
        next: { revalidate: 60 }, // Cache for 1 minute
    });

    if (!res.ok) return null;
    return res.json();
}

export default async function StudioLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { studio: string };
}) {
    const studio = await getStudio(params.studio);

    if (!studio) {
        notFound();
    }

    const themeId = studio.settings?.theme || 'default';

    return (
        <StudioThemeProvider themeId={themeId} studioName={studio.name}>
            <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
                {children}
            </div>
        </StudioThemeProvider>
    );
}
