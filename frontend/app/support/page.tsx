import Link from 'next/link'

export default function SupportPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Support
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Need help? We&apos;ve got you covered.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                Contact Information
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Email: <a href="mailto:tristan@fddl.dev" className="text-indigo-600 hover:text-indigo-500">support@studiosync.com</a>
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                                Phone: +1 (317) 457-2302
                            </p>
                            <p className="mt-4 text-xs text-gray-400">
                                Support Hours: Mon-Fri 9am - 5pm EST
                            </p>
                        </div>
                        <div className="border-t border-gray-200 pt-6">
                            <Link href="/dashboard" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none transition-colors">
                                Return to Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
