interface MetricCardProps {
    title: string
    value: string | number
    subtitle?: string
    trend?: {
        value: string
        positive: boolean
    }
    color: 'green' | 'yellow' | 'red' | 'blue'
    icon?: string
    onClick?: () => void
    className?: string
}

export default function MetricCard({ title, value, subtitle, trend, color, icon, onClick, className }: MetricCardProps) {
    const colorClasses = {
        green: 'border-l-4 border-[#27AE60] bg-gradient-to-br from-green-50 to-white',
        yellow: 'border-l-4 border-[#F1C40F] bg-gradient-to-br from-yellow-50 to-white',
        red: 'border-l-4 border-[#E74C3C] bg-gradient-to-br from-red-50 to-white',
        blue: 'border-l-4 border-[#3498DB] bg-gradient-to-br from-blue-50 to-white',
    }

    return (
        <div
            onClick={onClick}
            className={`p-6 rounded-lg border bg-white shadow-sm hover:shadow-md transition-shadow min-h-[170px] flex flex-col justify-between ${colorClasses[color]} ${onClick ? 'cursor-pointer hover:scale-[1.02] transition-transform' : ''} ${className || ''}`}
        >
            <div className="flex flex-col space-y-3">
                {/* Icon at top left */}
                {icon && (
                    <div className="text-3xl opacity-50 w-fit">
                        {icon}
                    </div>
                )}

                {/* Title */}
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">{title}</p>

                {/* Value row */}
                <div className="flex items-baseline space-x-2">
                    <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
                    {subtitle && <span className="text-sm text-gray-500">{subtitle}</span>}
                </div>
            </div>

            {/* Trend row at bottom */}
            {trend && (
                <div className="flex items-center space-x-1 mt-auto">
                    <span className={trend.positive ? 'text-green-600' : 'text-red-600'}>
                        {trend.positive ? '↑' : '↓'}
                    </span>
                    <span className={`text-sm font-medium ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
                        {trend.value}
                    </span>
                </div>
            )}
        </div>
    )
}
