import Link from 'next/link'
import { Github } from 'lucide-react'
import { Logo } from '@/components/Logo'

export default function Footer() {
    return (
        <>
            {/* Gradient Transition - fades from page background to footer */}
            <div className="h-32 bg-gradient-to-b from-transparent via-white/50 to-white" />

            <footer className="bg-white border-t border-gray-200">
                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center md:text-left">
                        {/* Brand */}
                        <div className="col-span-2">
                            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                                <Logo className="w-10 h-10" />
                                <span className="text-xl font-bold text-gray-900">StudioSync</span>
                            </div>
                            <p className="text-gray-600 max-w-md mx-auto md:mx-0">
                                Open-source studio management software designed for music teachers and schools.
                                Sync your studio, students, billing, scheduling, and more.
                            </p>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                                Product
                            </h3>
                            <ul className="space-y-3">
                                <li>
                                    <Link href="/login" className="text-gray-600 hover:text-[#F39C12] transition-colors">
                                        Sign In
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/signup" className="text-gray-600 hover:text-purple-600 transition-colors">
                                        Get Started
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/#features" className="text-gray-600 hover:text-[#F39C12] transition-colors">
                                        Features
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Resources */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                                Resources
                            </h3>
                            <ul className="space-y-3">
                                <li>
                                    <a
                                        href="https://github.com/fddl-dev/studiosync"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-600 hover:text-[#F39C12] transition-colors flex items-center justify-center md:justify-start gap-2"
                                    >
                                        <Github className="w-4 h-4" />
                                        GitHub
                                    </a>
                                </li>
                                <li>
                                    <Link href="/docs" className="text-gray-600 hover:text-[#F39C12] transition-colors">
                                        Documentation
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/support" className="text-gray-600 hover:text-[#F39C12] transition-colors">
                                        Support
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-200">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <p className="text-gray-500 text-sm">
                                © {new Date().getFullYear()} StudioSync. Open source software built with 💜
                            </p>
                            <div className="flex gap-6">
                                <Link href="/privacy" className="text-gray-500 hover:text-[#F39C12] text-sm transition-colors">
                                    Privacy Policy
                                </Link>
                                <Link href="/terms" className="text-gray-500 hover:text-[#F39C12] text-sm transition-colors">
                                    Terms of Service
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    )
}
