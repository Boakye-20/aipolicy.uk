'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Search,
    TrendingUp,
    Shield,
    Building2,
    Tag,
    FileCheck,
    Info
} from 'lucide-react';

const navigation = [
    { name: 'Executive Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Policy Explorer', href: '/policy-explorer', icon: Search },
    { name: 'Analytics & Insights', href: '/analytics', icon: TrendingUp },
    { name: 'Regulations Monitor', href: '/regulations', icon: Shield },
    { name: 'Department Analysis', href: '/departments', icon: Building2 },
    { name: 'Topic Intelligence', href: '/topics', icon: Tag },
    { name: 'How It Works', href: '/how-it-works', icon: Info },
    { name: 'Compliance Tool', href: 'https://ai-compliance-tool-cyan.vercel.app/', icon: FileCheck, external: true },
];

export default function Navigation() {
    const pathname = usePathname();

    return (
        <nav className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex space-x-8 overflow-x-auto">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;

                        // Handle external links
                        if (item.external) {
                            return (
                                <a
                                    key={item.name}
                                    href={item.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`
                                flex items-center gap-2 px-3 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                                border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300
                              `}
                                >
                                    <item.icon className="w-5 h-5" />
                                    {item.name}
                                </a>
                            );
                        }

                        // Internal links
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`
                              flex items-center gap-2 px-3 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                              ${isActive
                                        ? 'border-primary-500 text-primary-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }
                            `}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.name}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
