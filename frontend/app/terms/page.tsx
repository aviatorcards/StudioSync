import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export default function TermsPage() {
    return (
        <>
            <Navigation />
            <main className="min-h-screen bg-gradient-to-b from-background to-gray-50">
                {/* Header */}
                <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 py-20">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
                            <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Terms of</span>{' '}
                            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Service</span>
                        </h1>
                        <p className="text-center text-muted-foreground">
                            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-8">
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <span className="text-primary">1.</span> Acceptance of Terms
                            </h2>
                            <p className="text-gray-600 leading-relaxed">
                                By accessing or using StudioSync, you agree to be bound by these Terms of Service.
                                If you do not agree to these terms, please do not use our services.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <span className="text-primary">2.</span> Description of Service
                            </h2>
                            <p className="text-gray-600 leading-relaxed">
                                StudioSync provides studio management software for music teachers and schools.
                                Our service includes:
                            </p>
                            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                                <li>Student and lesson management</li>
                                <li>Scheduling and calendar tools</li>
                                <li>Billing and invoicing features</li>
                                <li>Communication and messaging</li>
                            </ul>
                            <p className="text-gray-600 leading-relaxed">
                                We reserve the right to modify or discontinue the service at any time with reasonable notice.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <span className="text-primary">3.</span> User Accounts
                            </h2>
                            <p className="text-gray-600 leading-relaxed">
                                You are responsible for:
                            </p>
                            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                                <li>Maintaining the confidentiality of your account credentials</li>
                                <li>All activities that occur under your account</li>
                                <li>Promptly notifying us of any unauthorized use</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <span className="text-primary">4.</span> Acceptable Use
                            </h2>
                            <p className="text-gray-600 leading-relaxed">
                                You agree not to use StudioSync to:
                            </p>
                            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                                <li>Violate any laws or regulations</li>
                                <li>Infringe on intellectual property rights</li>
                                <li>Transmit harmful or malicious code</li>
                                <li>Interfere with the service or other users</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <span className="text-primary">5.</span> Termination
                            </h2>
                            <p className="text-gray-600 leading-relaxed">
                                We may terminate or suspend your account at any time for violations of these terms.
                                You may cancel your account at any time through your account settings.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <span className="text-primary">6.</span> Contact
                            </h2>
                            <p className="text-gray-600 leading-relaxed">
                                For any questions regarding these terms, please contact us at{' '}
                                <a href="mailto:support@studiosync.app" className="text-primary hover:underline font-medium">
                                    support@studiosync.app
                                </a>
                            </p>
                        </section>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    )
}
