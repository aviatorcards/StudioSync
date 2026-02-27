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
        const parsed = new URL(url)
        // Extract just the path (e.g. /media/resources/2026/02/file.pdf)
        // and serve it through Next.js which proxies /media/* → backend container
        if (parsed.pathname.startsWith('/media/')) {
            return parsed.pathname
        }
        return url
    } catch {
        // If it's already a relative path or unparseable, return as-is
        return url
    }
}
