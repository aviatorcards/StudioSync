'use client'

import Script from 'next/script'
import { useEffect } from 'react'

declare global {
    interface Window {
        __onGCastApiAvailable: (isAvailable: boolean) => void
    }
    const cast: any
    const chrome: any
}

export default function GoogleCastScript() {
    useEffect(() => {
        window.__onGCastApiAvailable = (isAvailable: boolean) => {
            if (isAvailable) {
                try {
                    cast.framework.CastContext.getInstance().setOptions({
                        receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
                        autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
                    })
                    console.log('Google Cast initialized')
                } catch (e) {
                    console.error('Error initializing Google Cast', e)
                }
            }
        }
    }, [])

    return (
        <Script
            src="https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1"
            strategy="afterInteractive"
        />
    )
}
