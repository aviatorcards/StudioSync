import { Info } from 'lucide-react'
import { ReactNode } from 'react'

interface HelpTooltipProps {
    content: string | ReactNode
}

export function HelpTooltip({ content }: HelpTooltipProps) {
    return (
        <div className="group relative inline-flex items-center justify-center ml-2">
            <Info className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors cursor-help" aria-hidden="true" />
            <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-max max-w-xs -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="rounded bg-gray-900 px-3 py-2 text-xs font-medium text-white shadow-sm">
                    {content}
                    <div className="absolute left-1/2 top-full -mt-px h-2 w-2 -translate-x-1/2 rotate-45 bg-gray-900" />
                </div>
            </div>
        </div>
    )
}
