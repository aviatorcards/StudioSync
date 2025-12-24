import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function PrivacyPage() {
    return (
        <>
            <Navigation />
            <main className="min-h-screen bg-gradient-to-b from-background to-gray-50">
                {/* Header */}
                <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 py-20">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
                            <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Privacy</span>{' '}
                            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Policy</span>
                        </h1>
                        <p className="text-center text-muted-foreground">
                            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                        <p className="text-center text-sm text-green-600 font-medium mt-2">
                            ✓ GDPR Compliant | ✓ FERPA Compliant
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-8">

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <span className="text-primary">1.</span> Introduction
                            </h2>
                            <p className="text-gray-600 leading-relaxed">
                                StudioSync (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) respects your privacy and is committed to protecting your personal data.
                                This Privacy Policy explains how we collect, use, store, and protect your information in compliance with
                                the General Data Protection Regulation (GDPR) and the Family Educational Rights and Privacy Act (FERPA).
                            </p>
                            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                                <p className="text-sm text-blue-900">
                                    <strong>Your Rights:</strong> You have the right to access, export, correct, or delete your personal data at any time.
                                    See Section 11 for details.
                                </p>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <span className="text-primary">2.</span> Data Controller
                            </h2>
                            <p className="text-gray-600 leading-relaxed">
                                StudioSync LLC acts as the data controller for personal information processed through our platform.
                                For GDPR purposes, we can be contacted at:
                            </p>
                            <div className="bg-gray-50 p-4 rounded">
                                <p className="text-sm text-gray-700">
                                    <strong>Privacy Officer</strong><br />
                                    Email: <a href="mailto:privacy@studiosync.app" className="text-primary hover:underline">privacy@studiosync.app</a><br />
                                    Address: [Your Business Address]
                                </p>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <span className="text-primary">3.</span> Information We Collect
                            </h2>
                            <p className="text-gray-600 leading-relaxed">
                                We collect and process the following categories of personal data:
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold text-gray-800 mb-2">3.1 Account Information</h3>
                                    <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                                        <li>Name (first and last)</li>
                                        <li>Email address</li>
                                        <li>Phone number (optional)</li>
                                        <li>Password (encrypted)</li>
                                        <li>Profile photo (optional)</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-gray-800 mb-2">3.2 Educational Records (FERPA Protected)</h3>
                                    <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                                        <li>Student names and contact information</li>
                                        <li>Lesson attendance records</li>
                                        <li>Progress notes and assessments</li>
                                        <li>Homework and assignments</li>
                                        <li>Skill levels and learning goals</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-gray-800 mb-2">3.3 Payment Information</h3>
                                    <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                                        <li>Billing address</li>
                                        <li>Payment history and invoices</li>
                                        <li>Credit card information (processed by Stripe - we do not store full card numbers)</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-gray-800 mb-2">3.4 Usage Data</h3>
                                    <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                                        <li>IP address and device information</li>
                                        <li>Browser type and version</li>
                                        <li>Pages visited and features used</li>
                                        <li>Login timestamps</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <span className="text-primary">4.</span> Legal Basis for Processing (GDPR)
                            </h2>
                            <p className="text-gray-600 leading-relaxed">
                                We process your personal data under the following legal bases:
                            </p>
                            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                                <li><strong>Contract Performance:</strong> To provide our services as outlined in our Terms of Service</li>
                                <li><strong>Consent:</strong> When you explicitly agree to data processing (e.g., marketing communications)</li>
                                <li><strong>Legitimate Interests:</strong> To improve our services, prevent fraud, and ensure security</li>
                                <li><strong>Legal Obligations:</strong> To comply with tax, accounting, and legal requirements</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <span className="text-primary">5.</span> How We Use Your Information
                            </h2>
                            <div className="space-y-3">
                                <div>
                                    <h3 className="font-semibold text-gray-800">5.1 Service Delivery</h3>
                                    <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                                        <li>Schedule and manage lessons</li>
                                        <li>Track student attendance and progress</li>
                                        <li>Process payments and generate invoices</li>
                                        <li>Send lesson reminders and notifications</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-gray-800">5.2 Communication</h3>
                                    <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                                        <li>Send important service updates</li>
                                        <li>Respond to your inquiries</li>
                                        <li>Send marketing communications (only with your consent)</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-gray-800">5.3 Security and Compliance</h3>
                                    <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                                        <li>Detect and prevent fraud</li>
                                        <li>Ensure platform security</li>
                                        <li>Comply with legal obligations</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <span className="text-primary">6.</span> Data Sharing and Disclosure
                            </h2>
                            <p className="text-gray-600 leading-relaxed">
                                We do NOT sell your personal data. We only share data in the following circumstances:
                            </p>
                            <div className="space-y-3">
                                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                                    <p className="text-sm text-green-900">
                                        <strong>Student Privacy:</strong> Student names and educational records are NEVER shared publicly
                                        or with other students. Only authorized teachers and administrators can access student data.
                                    </p>
                                </div>
                                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                                    <li><strong>Service Providers:</strong> Payment processors (Stripe), email service (if applicable), cloud hosting (AWS/similar)</li>
                                    <li><strong>Legal Requirements:</strong> When required by law or to protect our legal rights</li>
                                    <li><strong>With Your Consent:</strong> When you explicitly authorize sharing</li>
                                </ul>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <span className="text-primary">7.</span> Data Retention
                            </h2>
                            <p className="text-gray-600 leading-relaxed">
                                We retain your data for the following periods:
                            </p>
                            <div className="bg-gray-50 p-4 rounded space-y-2">
                                <p className="text-sm text-gray-700"><strong>Active Accounts:</strong> Until you request deletion</p>
                                <p className="text-sm text-gray-700"><strong>Lesson Records:</strong> 7 years (for educational and tax purposes)</p>
                                <p className="text-sm text-gray-700"><strong>Payment Records:</strong> 7 years (for tax and legal compliance)</p>
                                <p className="text-sm text-gray-700"><strong>Messages:</strong> 2 years or until you delete them</p>
                                <p className="text-sm text-gray-700"><strong>Deleted Accounts:</strong> 30-day grace period, then permanently deleted</p>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <span className="text-primary">8.</span> Data Security
                            </h2>
                            <p className="text-gray-600 leading-relaxed">
                                We implement industry-standard security measures including:
                            </p>
                            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                                <li>SSL/TLS encryption for data in transit</li>
                                <li>Encrypted password storage using bcrypt</li>
                                <li>Role-based access controls</li>
                                <li>Regular security audits and penetration testing</li>
                                <li>Secure cloud infrastructure with automatic backups</li>
                                <li>Two-factor authentication (available)</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <span className="text-primary">9.</span> International Data Transfers
                            </h2>
                            <p className="text-gray-600 leading-relaxed">
                                Your data may be transferred to and processed in countries outside your country of residence.
                                We ensure appropriate safeguards are in place, including:
                            </p>
                            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                                <li>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
                                <li>Data processing agreements with all service providers</li>
                                <li>Compliance with GDPR requirements for international transfers</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <span className="text-primary">10.</span> Cookies and Tracking
                            </h2>
                            <p className="text-gray-600 leading-relaxed">
                                We use essential cookies for authentication and preferences. We do not use tracking cookies
                                or third-party analytics without your explicit consent.
                            </p>
                            <div className="bg-blue-50 p-4 rounded">
                                <p className="text-sm text-blue-900">
                                    You can manage cookie preferences in your browser settings or through our cookie consent banner.
                                </p>
                            </div>
                        </section>

                        <section className="space-y-4 bg-gradient-to-r from-primary/5 to-purple-500/5 p-6 rounded-lg">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <span className="text-primary">11.</span> Your Rights (GDPR)
                            </h2>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                Under GDPR, you have the following rights:
                            </p>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="bg-white p-4 rounded shadow-sm">
                                    <h3 className="font-semibold text-gray-800 mb-2">✓ Right to Access</h3>
                                    <p className="text-sm text-gray-600">View all data we hold about you</p>
                                    <Link href="/dashboard/settings" className="text-primary text-sm hover:underline">
                                        → Privacy Dashboard
                                    </Link>
                                </div>

                                <div className="bg-white p-4 rounded shadow-sm">
                                    <h3 className="font-semibold text-gray-800 mb-2">✓ Right to Data Portability</h3>
                                    <p className="text-sm text-gray-600">Export your data in JSON format</p>
                                    <Link href="/dashboard/settings" className="text-primary text-sm hover:underline">
                                        → Download My Data
                                    </Link>
                                </div>

                                <div className="bg-white p-4 rounded shadow-sm">
                                    <h3 className="font-semibold text-gray-800 mb-2">✓ Right to Erasure</h3>
                                    <p className="text-sm text-gray-600">Request deletion of your account</p>
                                    <Link href="/dashboard/settings" className="text-primary text-sm hover:underline">
                                        → Delete My Account
                                    </Link>
                                </div>

                                <div className="bg-white p-4 rounded shadow-sm">
                                    <h3 className="font-semibold text-gray-800 mb-2">✓ Right to Rectification</h3>
                                    <p className="text-sm text-gray-600">Correct inaccurate data</p>
                                    <Link href="/dashboard/settings" className="text-primary text-sm hover:underline">
                                        → Edit Profile
                                    </Link>
                                </div>

                                <div className="bg-white p-4 rounded shadow-sm">
                                    <h3 className="font-semibold text-gray-800 mb-2">✓ Right to Restrict Processing</h3>
                                    <p className="text-sm text-gray-600">Limit how we use your data</p>
                                    <a href="mailto:privacy@studiosync.app" className="text-primary text-sm hover:underline">
                                        → Contact Us
                                    </a>
                                </div>

                                <div className="bg-white p-4 rounded shadow-sm">
                                    <h3 className="font-semibold text-gray-800 mb-2">✓ Right to Object</h3>
                                    <p className="text-sm text-gray-600">Object to data processing</p>
                                    <a href="mailto:privacy@studiosync.app" className="text-primary text-sm hover:underline">
                                        → Contact Us
                                    </a>
                                </div>
                            </div>

                            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded mt-4">
                                <p className="text-sm text-yellow-900">
                                    <strong>Response Time:</strong> We will respond to all data requests within 30 days as required by GDPR.
                                </p>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <span className="text-primary">12.</span> Children&apos;s Privacy (FERPA)
                            </h2>
                            <p className="text-gray-600 leading-relaxed">
                                We comply with the Family Educational Rights and Privacy Act (FERPA) for all student data.
                                Student educational records are:
                            </p>
                            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                                <li>Never shared with other students</li>
                                <li>Only accessible to authorized teachers and administrators</li>
                                <li>Never used for marketing purposes</li>
                                <li>Protected with strict access controls</li>
                                <li>Available to parents/guardians upon request</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <span className="text-primary">13.</span> Data Breach Notification
                            </h2>
                            <p className="text-gray-600 leading-relaxed">
                                In the event of a data breach, we will:
                            </p>
                            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                                <li>Notify affected users within 72 hours (as required by GDPR)</li>
                                <li>Report the breach to relevant supervisory authorities</li>
                                <li>Provide detailed information about the breach and mitigation steps</li>
                                <li>Offer support and guidance to affected users</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <span className="text-primary">14.</span> Changes to This Policy
                            </h2>
                            <p className="text-gray-600 leading-relaxed">
                                We may update this Privacy Policy from time to time. We will notify you of any material changes by:
                            </p>
                            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                                <li>Email notification to your registered address</li>
                                <li>Prominent notice on our website</li>
                                <li>In-app notification</li>
                            </ul>
                            <p className="text-gray-600 leading-relaxed mt-2">
                                Your continued use of our services after changes constitutes acceptance of the updated policy.
                            </p>
                        </section>

                        <section className="space-y-4 bg-primary/5 p-6 rounded-lg">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <span className="text-primary">15.</span> Contact Us
                            </h2>
                            <p className="text-gray-600 leading-relaxed">
                                For any privacy-related questions, concerns, or to exercise your rights, please contact us at:
                            </p>
                            <div className="bg-white p-4 rounded shadow-sm">
                                <p className="text-gray-700">
                                    <strong>Privacy Officer</strong><br />
                                    Email: <a href="mailto:privacy@studiosync.app" className="text-primary hover:underline font-medium">
                                        privacy@studiosync.app
                                    </a><br />
                                    Support: <a href="mailto:support@studiosync.app" className="text-primary hover:underline font-medium">
                                        support@studiosync.app
                                    </a>
                                </p>
                            </div>
                            <p className="text-sm text-gray-500 mt-4">
                                If you are not satisfied with our response, you have the right to lodge a complaint with your
                                local data protection authority.
                            </p>
                        </section>

                        <div className="border-t pt-6 mt-8">
                            <p className="text-sm text-gray-500 text-center">
                                This Privacy Policy is effective as of {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} and complies with GDPR and FERPA requirements.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    )
}
