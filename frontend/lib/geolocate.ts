export interface GeoLocation {
    timezone: string
    city: string
    region: string
    country: string       // ISO-2 code, e.g. "US"
    country_name: string  // e.g. "United States"
}

export async function detectLocation(): Promise<GeoLocation> {
    const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(8000) })
    if (!res.ok) throw new Error(`ipapi.co returned ${res.status}`)
    const d = await res.json()
    if (!d.timezone) throw new Error('No timezone in response')
    return {
        timezone:     d.timezone,
        city:         d.city        ?? '',
        region:       d.region      ?? '',
        country:      d.country     ?? '',
        country_name: d.country_name ?? '',
    }
}
