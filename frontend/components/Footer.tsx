import Link from 'next/link'
import { Github } from 'lucide-react'
import { Logo } from '@/components/Logo'
import CurrentYear from './CurrentYear'

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center md:text-left">
                    {/* Brand */}
                    <div className="col-span-2">
                        <div className="flex items-center justify-center md:justify-start gap-2.5 mb-4">
                            <Logo className="w-8 h-8" />
                            <span className="text-lg font-bold text-gray-900">StudioSync</span>
                        </div>
                        <p className="text-gray-500 text-sm max-w-sm mx-auto md:mx-0 leading-relaxed">
                            Open-source studio management software designed for music teachers and schools.
                            Sync your students, billing, scheduling, and more.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                            Product
                        </h3>
                        <ul className="space-y-2.5">
                            <li>
                                <Link href="/login" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                                    Sign In
                                </Link>
                            </li>
                            <li>
                                <Link href="/signup" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                                    Get Started
                                </Link>
                            </li>
                            <li>
                                <Link href="/#features" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                                    Features
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                            Resources
                        </h3>
                        <ul className="space-y-2.5">
                            <li>
                                <a
                                    href="https://github.com/aviatorcards/StudioSync"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-gray-500 hover:text-gray-900 transition-colors flex items-center justify-center md:justify-start gap-1.5"
                                >
                                    <Github className="w-3.5 h-3.5" />
                                    GitHub
                                </a>
                            </li>
                            <li>
                                <Link href="/docs" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                                    Documentation
                                </Link>
                            </li>
                            <li>
                                <Link href="/support" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                                    Support
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-10 pt-6 border-t border-gray-100">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-gray-400 text-sm">
                            © <CurrentYear /> StudioSync. Open source software built with 💜
                        </p>
                        <div className="flex gap-6">
                            <Link href="/privacy" className="text-gray-400 hover:text-gray-600 text-sm transition-colors">
                                Privacy Policy
                            </Link>
                            <Link href="/terms" className="text-gray-400 hover:text-gray-600 text-sm transition-colors">
                                Terms of Service
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
