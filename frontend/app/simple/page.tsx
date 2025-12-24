'use client'

import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function SimplePage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="text-center max-w-4xl px-4">
          <h1 className="text-6xl font-bold mb-6">
            <span className="block bg-gradient-to-r from-indigo-900 via-purple-800 to-indigo-900 bg-clip-text text-transparent">
              Orchestrate
            </span>
            <span className="block bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Your Studio
            </span>
          </h1>

          <p className="text-xl text-gray-700 mb-12">
            The all-in-one platform for music studio management
          </p>

          <div className="flex gap-4 justify-center">
            <Link
              href="/signup"
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-semibold text-lg shadow-xl"
            >
              Start Free Trial
            </Link>

            <Link
              href="/login"
              className="px-8 py-4 bg-white border border-gray-200 text-gray-900 rounded-2xl font-semibold text-lg"
            >
              Sign In
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
