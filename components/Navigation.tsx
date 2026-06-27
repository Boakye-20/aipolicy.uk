'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Search,
    TrendingUp,
    CheckSquare,
    Building2,
    Tag,
    Info,
    ExternalLink
} from 'lucide-react';

const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Policy Explorer', href: '/policy-explorer', icon: Search },
    { name: 'Analytics', href: '/analytics', icon: TrendingUp },
    { name: 'Regulations', href: '/regulations', icon: CheckSquare },
    { name: 'Departments', href: '/departments', icon: Building2 },
    { name: 'Topics', href: '/topics', icon: Tag },
    {
        name: 'Compliance Tool',
        href: 'https://ai-compliance-tool-cyan.vercel.app/',
        icon: ExternalLink,
        external: true,
    },
    { name: 'About', href: '/about', icon: Info },
];

export default function Navigation() {
    const pathname = usePathname();

    return (
        <nav className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
                <div className="flex flex-wrap justify-center gap-x-2 sm:gap-x-4 md:gap-x-6 -mb-px">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;

                        if ((item as any).external) {
                            return (
                                <a
                                    key={item.name}
                                    href={item.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`
                  flex items-center gap-1.5 px-2 sm:px-3 py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                  border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300
                `}
                                >
                                    <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span className="hidden sm:inline">{item.name}</span>
                                    <span className="sm:hidden">{item.name.split(' ')[0]}</span>
                                </a>
                            );
                        }

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`
                  flex items-center gap-1.5 px-2 sm:px-3 py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                  ${isActive
                                        ? 'border-primary-500 text-primary-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }
                `}
                            >
                                <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span className="hidden sm:inline">{item.name}</span>
                                <span className="sm:hidden">{item.name.split(' ')[0]}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
