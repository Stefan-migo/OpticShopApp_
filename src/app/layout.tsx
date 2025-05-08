import React from 'react';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from 'next-themes';

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "OpticApp",
    description: "Optical Shop Management App",
};

const RootLayout = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    return (
        <html lang="es" suppressHydrationWarning>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <ThemeProvider
                    attribute="class"
                    enableSystem
                    defaultTheme="light" // Set default theme
                    themes={['light', 'dark', 'ocean', 'forest', 'earthy-teal', 'pastel-sky', 'cool-neutrals', 'emerald-gold', 'vibrant-green']}
                >
                    {children}
                </ThemeProvider>
                <Toaster />
            </body>
        </html>
    );
};

export default RootLayout;

