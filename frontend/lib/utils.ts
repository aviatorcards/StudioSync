import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}
export function formatPhoneNumber(value: string) {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, "");
    const phoneNumberLength = phoneNumber.length;
    
    if (phoneNumberLength <= 3) return phoneNumber;
    if (phoneNumberLength <= 6) {
        return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    if (phoneNumberLength <= 10) {
        return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6)}`;
    }
    return `+1 (${phoneNumber.slice(1, 4)}) ${phoneNumber.slice(4, 7)}-${phoneNumber.slice(7, 11)}`;
}
export function proxyFileUrl(url: string | null): string | null {
    if (!url) return null
    try {
        const parsed = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'http://localhost')
        // A dedicated media host should be loaded directly, not pulled back onto the app origin.
        if (typeof window !== 'undefined' && parsed.host && parsed.host !== window.location.host) {
            return url
        }
        if (parsed.pathname.startsWith('/media/')) {
            return parsed.pathname
        }
        return url
    } catch {
        return url
    }
}

const PUBLIC_MEDIA_PREFIXES = ['/media/avatars/', '/media/studio_logos/', '/media/studio_covers/', '/media/bands/']

export function isPublicMediaPath(url: string): boolean {
    return PUBLIC_MEDIA_PREFIXES.some((prefix) => url.startsWith(prefix))
}

/** Download a private upload with the session token. <img> tags cannot send it. */
export async function downloadAuthenticatedFile(url: string, filename?: string): Promise<void> {
    const path = proxyFileUrl(url)
    if (!path) throw new Error('Missing file URL')
    const response = await fetch(path, { credentials: 'include' })
    if (!response.ok) throw new Error('Download failed')
    const blob = await response.blob()
    const objectUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = objectUrl
    link.download = filename || path.split('/').pop() || 'download'
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(objectUrl)
}
