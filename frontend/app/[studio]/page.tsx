'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useStudioTheme } from '@/contexts/StudioThemeContext';
import { Music, Calendar, Users, Star, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function StudioLandingPage() {
    const { studioName } = useStudioTheme();
    const params = useParams();

    return (
        <div className="flex flex-col min-h-screen">
            {/* Navigation */}
            <header className="px-4 lg:px-6 h-16 flex items-center border-b sticky top-0 bg-background/80 backdrop-blur-md z-50">
                <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
                    <div className="p-1.5 bg-primary rounded-lg text-primary-foreground">
                        <Music className="h-6 w-6" />
                    </div>
                    <span>{studioName}</span>
                </div>
                <nav className="ml-auto flex gap-4 sm:gap-6">
                    <a className="text-sm font-medium hover:text-primary transition-colors cursor-pointer">Lessons</a>
                    <Link href={`/${params.studio}/teachers`} className="text-sm font-medium hover:text-primary transition-colors cursor-pointer">Teachers</Link>
                    <a className="text-sm font-medium hover:text-primary transition-colors cursor-pointer">Pricing</a>
                    <a className="text-sm font-medium hover:text-primary transition-colors px-4 py-2 bg-primary text-primary-foreground rounded-full cursor-pointer">Book Now</a>
                </nav>
            </header>

            <main className="flex-1">
                {/* Hero Section */}
                <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 flex items-center justify-center overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 -z-10" />
                    <div className="px-4 md:px-6 text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        <div className="space-y-4">
                            <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                                Master Your Music at <br />
                                <span className="text-primary italic">{studioName}</span>
                            </h1>
                            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-2xl/relaxed">
                                Discover your potential with world-class instructors, personalized lesson plans, and a community that inspires.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button className="h-12 px-8 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 group">
                                Start Your Journey <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button className="h-12 px-8 rounded-full border-2 border-primary text-primary font-semibold hover:bg-primary/5 transition-all">
                                View Schedule
                            </button>
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary/30">
                    <div className="container px-4 md:px-6 mx-auto">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                            <div className="inline-block rounded-lg bg-primary/20 px-3 py-1 text-sm font-medium text-primary">Why Choose Us</div>
                            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Elevate Your Musical Experience</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { title: "Expert Instruction", icon: Star, desc: "Our teachers are professional musicians with years of stage and teaching experience." },
                                { title: "Smart Scheduling", icon: Calendar, desc: "Easy online booking and automated reminders so you never miss a beat." },
                                { title: "Vibrant Community", icon: Users, desc: "Join group masterclasses, recitals, and connect with fellow students." }
                            ].map((feature, i) => (
                                <div key={i} className="flex flex-col items-center p-8 bg-background rounded-3xl border shadow-sm hover:shadow-md transition-shadow">
                                    <div className="p-3 bg-primary/10 rounded-2xl mb-4">
                                        <feature.icon className="h-8 w-8 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                                    <p className="text-muted-foreground text-center">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Pricing/Enrollment */}
                <section className="w-full py-12 md:py-24 lg:py-32">
                    <div className="container px-4 md:px-6 mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div className="space-y-6">
                                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Ready to find your rhythm?</h2>
                                <p className="text-muted-foreground text-lg">
                                    Join hundreds of students who have found their passion through our structured yet flexible music programs.
                                </p>
                                <div className="space-y-4">
                                    {['Free 30-minute consultation', 'No registration fees', 'Flexible monthly billing', 'Access to digital resource library'].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <CheckCircle2 className="h-5 w-5 text-primary" />
                                            <span className="font-medium">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-primary p-8 md:p-12 rounded-[2rem] text-primary-foreground shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <Music className="h-48 w-48" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4">New Student Special</h3>
                                <div className="mb-6">
                                    <span className="text-5xl font-black italic">$99</span>
                                    <span className="text-lg opacity-80"> / first month</span>
                                </div>
                                <p className="mb-8 opacity-90 leading-relaxed">
                                    Includes 4 private 30-minute lessons, all learning materials, and your first recital entry fee.
                                </p>
                                <button className="w-full h-14 bg-background text-primary font-bold rounded-2xl hover:scale-[1.02] transition-transform">
                                    Claim Special Offer
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t py-12 bg-background">
                <div className="container px-4 md:px-6 mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2 font-bold text-foreground">
                        <Music className="h-5 w-5 text-primary" />
                        <span>{studioName}</span>
                    </div>
                    <p>© 2025 {studioName}. Powered by StudioSync.</p>
                    <div className="flex gap-4">
                        <a href="#" className="hover:text-primary transition-colors">Privacy</a>
                        <a href="#" className="hover:text-primary transition-colors">Terms</a>
                        <a href="#" className="hover:text-primary transition-colors">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
