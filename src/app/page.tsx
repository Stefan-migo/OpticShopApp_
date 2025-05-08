'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTheme } from 'next-themes';
import { Locale } from '@/lib/i18n/config';

const LandingPage = ({ params: { lang } }: { params: { lang: Locale } }) => {
    const { setTheme } = useTheme();

    return (
        <div className="min-h-screen bg-background text-foreground">
            <main className="flex flex-col items-center justify-center p-4 md:p-8">
                <div className="text-center space-y-6">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-blue-500 to-teal-500 text-transparent bg-clip-text">
                        OpticApp Management
                    </h1>
                    <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                        Streamline your optical shop operations with our intuitive SaaS solution.  Manage inventory,
                        customers, prescriptions, and appointments effortlessly.
                    </p>
                    <div className="flex justify-center space-x-4">
                        <Link href={`/login`} passHref>
                            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                                Login to Your Account
                            </Button>
                        </Link>
                        <Link href={`/signup`} passHref>
                            <Button
                                size="lg"
                                variant="outline"
                                className="border-secondary text-secondary hover:bg-secondary/10"
                            >
                                Get Started <span aria-hidden="true">→</span>
                            </Button>
                        </Link>
                    </div>
                    <div className="mt-8 flex justify-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => setTheme('light')}>Light</Button>
                        <Button size="sm" variant="outline" onClick={() => setTheme('dark')}>Dark</Button>
                        <Button size="sm" variant="outline" onClick={() => setTheme('ocean')}>Ocean</Button>
                        <Button size="sm" variant="outline" onClick={() => setTheme('forest')}>Forest</Button>
                        <Button size="sm" variant="outline" onClick={() => setTheme('earthy-teal')}>Earthy</Button>
                        <Button size="sm" variant="outline" onClick={() => setTheme('pastel-sky')}>Pastel</Button>
                         <Button size="sm" variant="outline" onClick={() => setTheme('cool-neutrals')}>Cool</Button>
                         <Button size="sm" variant="outline" onClick={() => setTheme('emerald-gold')}>Emerald</Button>
                         <Button size="sm" variant="outline" onClick={() => setTheme('vibrant-green')}>Vibrant</Button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default LandingPage;
