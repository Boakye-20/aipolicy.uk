'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Search,
    TrendingUp,
    Shield,
    Building2,
    Tag,
    Menu,
    X,
} from 'lucide-react';

const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Explorer', href: '/policy-explorer', icon: Search },
    { name: 'Regulations', href: '/regulations', icon: Shield },
    { name: 'Departments', href: '/departments', icon: Building2 },
    { name: 'Analytics', href: '/analytics', icon: TrendingUp },
    { name: 'Topics', href: '/topics', icon: Tag },
];

export default function Navigation() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    return (
        <>
            {/* Desktop: inline links */}
            <nav className="hidden md:flex items-center gap-1">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                                isActive
                                    ? 'bg-slate-100 text-slate-900 font-semibold'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                        >
                            <item.icon className="w-3.5 h-3.5" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Mobile: hamburger + dropdown */}
            <div className="md:hidden">
                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    aria-label={open ? 'Close menu' : 'Open menu'}
                    aria-expanded={open}
                    className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-800 hover:bg-slate-50"
                >
                    {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>

                {open && (
                    <>
                        {/* Click-away backdrop */}
                        <button
                            type="button"
                            aria-hidden
                            tabIndex={-1}
                            onClick={() => setOpen(false)}
                            className="fixed inset-0 top-16 z-40 cursor-default bg-slate-900/20"
                        />
                        <nav className="absolute left-0 right-0 top-16 z-50 border-b border-slate-200 bg-white shadow-lg">
                            <div className="max-w-container mx-auto px-4 py-2 flex flex-col">
                                {navigation.map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            onClick={() => setOpen(false)}
                                            className={`flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                                                isActive
                                                    ? 'bg-slate-100 text-slate-900 font-semibold'
                                                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                                            }`}
                                        >
                                            <item.icon className="w-4 h-4" />
                                            {item.name}
                                        </Link>
                                    );
                                })}
                            </div>
                        </nav>
                    </>
                )}
            </div>
        </>
    );
}
