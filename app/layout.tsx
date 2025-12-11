import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "UK AI Policy Tracker",
    description: "Comprehensive dashboard for tracking and analyzing UK AI policies and publications",
};

// Header section with just the title
function Header() {
    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                <div className="text-center">
                    <h1 className="text-2xl font-semibold text-gray-900 tracking-tight sm:text-3xl">
                        AI Policy Intelligence Tracker
                    </h1>
                </div>
            </div>
        </div>
    );
}

// Footer component with minimal text
function Footer() {
    return (
        <footer className="bg-white border-t border-gray-200 mt-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="text-center text-sm text-gray-600">
                    <p className="text-sm text-gray-600 font-medium">
                        AI Governance Hub • Built by Paul Kwarteng
                    </p>
                </div>
            </div>
        </footer>
    );
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <div className="min-h-screen bg-white flex flex-col">
                    {/* Header with Title */}
                    <header>
                        <Header />

                        {/* Navigation */}
                        <div className="bg-white border-b border-gray-200 shadow-sm">
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                <Navigation />
                            </div>
                        </div>
                    </header>

                    {/* Page Content */}
                    <main className="flex-grow">
                        {children}
                    </main>

                    {/* Footer */}
                    <Footer />
                </div>
            </body>
        </html>
    );
}
