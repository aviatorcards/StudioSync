'use client';

import React, { useEffect, useState } from 'react';
import { useStudioTheme } from '@/contexts/StudioThemeContext';
import { Music, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';

interface Teacher {
    id: string;
    first_name: string;
    last_name: string;
    bio: string;
    specialties: string[];
    instruments: string[];
    avatar: string | null;
}

export default function TeachersPage() {
    const { studioName } = useStudioTheme();
    const params = useParams();
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Determine subdomain from URL param
        // In nextjs app router [studio], params.studio is the subdomain
        const subdomain = params.studio as string;

        if (subdomain) {
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/core/studios/by-subdomain/${subdomain}/teachers/`)
                .then(res => res.json())
                .then(data => {
                    setTeachers(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });
        }
    }, [params]);

    return (
        <div className="flex flex-col min-h-screen">
            {/* Navigation */}
            <header className="px-4 lg:px-6 h-16 flex items-center border-b sticky top-0 bg-background/80 backdrop-blur-md z-50">
                <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
                    <Link href={`/${params.studio}`} className="flex items-center gap-2">
                        <div className="p-1.5 bg-primary rounded-lg text-primary-foreground">
                            <Music className="h-6 w-6" />
                        </div>
                        <span>{studioName}</span>
                    </Link>
                </div>
                <nav className="ml-auto flex gap-4 sm:gap-6">
                    <Link href={`/${params.studio}/teachers`} className="text-sm font-medium text-primary transition-colors">Teachers</Link>
                    <a className="text-sm font-medium hover:text-primary transition-colors cursor-pointer">Pricing</a>
                    <a className="text-sm font-medium hover:text-primary transition-colors px-4 py-2 bg-primary text-primary-foreground rounded-full cursor-pointer">Book Now</a>
                </nav>
            </header>

            <main className="flex-1">
                {/* Header Section */}
                <section className="w-full py-12 md:py-24 bg-secondary/30">
                    <div className="container px-4 md:px-6 mx-auto text-center space-y-4">
                        <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Meet Our Instructors</h1>
                        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                            Dedicated professionals committed to helping you discover your potential.
                        </p>
                    </div>
                </section>

                {/* Teachers Grid */}
                <section className="w-full py-12 md:py-16">
                    <div className="container px-4 md:px-6 mx-auto">
                        {loading ? (
                            <div className="flex justify-center p-12">
                                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                            </div>
                        ) : teachers.length === 0 ? (
                            <div className="text-center p-12 text-muted-foreground">
                                <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                <p>No teacher profiles available yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {teachers.map((teacher) => (
                                    <div key={teacher.id} className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm hover:shadow-lg transition-all duration-300">
                                        <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                                            {teacher.avatar ? (
                                                <img src={teacher.avatar} alt={teacher.first_name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-secondary">
                                                    <Users className="h-16 w-16 text-muted-foreground/30" />
                                                </div>
                                            )}
                                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent pt-12">
                                                <h3 className="text-white text-xl font-bold">{teacher.first_name} {teacher.last_name}</h3>
                                                <p className="text-white/80 text-sm font-medium">
                                                    {teacher.instruments.join(', ')}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="p-6 flex-1 flex flex-col">
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {teacher.specialties.slice(0, 3).map((spec, i) => (
                                                    <span key={i} className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                                                        {spec}
                                                    </span>
                                                ))}
                                            </div>
                                            <p className="text-muted-foreground text-sm line-clamp-4 mb-6 flex-1">
                                                {teacher.bio || "No bio available."}
                                            </p>
                                            <button className="w-full mt-auto h-10 rounded-lg border-2 border-primary text-primary font-semibold hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center gap-2">
                                                Book Lesson
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t py-12 bg-background">
                <div className="container px-4 md:px-6 mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2 font-bold text-foreground">
                        <span>{studioName}</span>
                    </div>
                    <p>© 2025 {studioName}. Powered by StudioSync.</p>
                </div>
            </footer>
        </div>
    );
}
