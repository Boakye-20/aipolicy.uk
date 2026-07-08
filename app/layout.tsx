import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Landmark, ArrowUpRight } from "lucide-react";
import Navigation from "@/components/navigation/Navigation";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
    title: "UK AI Policy Tracker",
    description:
        "An intelligence platform tracking UK AI law, regulation, strategy and guidance from government departments and regulators.",
};

function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-container items-center justify-between px-4 sm:px-6 lg:px-8">

                {/* Branding */}
                <Link href="/" className="flex items-center gap-3 shrink-0">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-900 text-white shadow-sm">
                        <Landmark className="h-5 w-5" />
                    </div>
                    <div>
                        <span className="text-base font-bold tracking-tight text-slate-950">
                            UK AI Policy Tracker
                        </span>
                        <span className="hidden text-xs text-slate-500 sm:block font-medium leading-none mt-0.5">
                            AI Governance &amp; Risk Intelligence
                        </span>
                    </div>
                </Link>

                {/* Primary navigation — hidden on mobile */}
                <Navigation />

                {/* Right-side tools */}
                <div className="flex items-center gap-3 shrink-0">
                    <div className="hidden lg:flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Feed live
                    </div>
                    <a
                        href="https://ai-compliance-tool-cyan.vercel.app/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-lg bg-navy-900 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-navy-700 transition-colors"
                    >
                        Compliance Tool
                        <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                    </a>
                </div>
            </div>
        </header>
    );
}

function Footer() {
    return (
        <footer className="border-t border-slate-200 bg-white mt-12">
            <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-slate-500">
                    <p>UK AI Policy Tracker · Built by Paul Kwarteng</p>
                    <p className="text-xs">
                        Summaries link to official sources and are not a substitute for legal advice.
                        {' '}·{' '}
                        <Link href="/privacy" className="underline hover:text-slate-700">Privacy policy</Link>
                    </p>
                </div>
            </div>
        </footer>
    );
}

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" suppressHydrationWarning className={inter.variable}>
            <body className="font-sans bg-slate-50 text-slate-900" suppressHydrationWarning>
                <div className="min-h-screen flex flex-col" suppressHydrationWarning>
                    <Header />
                    <main className="flex-grow">{children}</main>
                    <Footer />
                </div>
            </body>
        </html>
    );
}
