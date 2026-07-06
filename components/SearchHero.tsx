'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

const QUICK_FILTERS: { label: string; href: string }[] = [
    { label: 'All policies', href: '/policy-explorer' },
    { label: 'Regulations', href: '/regulations' },
    { label: 'By department', href: '/departments' },
    { label: 'By topic', href: '/topics' },
    { label: 'Analytics', href: '/analytics' },
];

export default function SearchHero() {
    const [query, setQuery] = useState('');
    const router = useRouter();

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const q = query.trim();
        router.push(q ? `/policy-explorer?q=${encodeURIComponent(q)}` : '/policy-explorer');
    };

    return (
        <section className="border-b border-navy-950 bg-navy-900 py-14 sm:py-18 text-white">
            <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                    UK AI Policy Tracker
                </h1>
                <p className="mx-auto mt-3 max-w-xl text-base text-slate-400 leading-relaxed">
                    Track every UK AI regulation, strategy and guidance update in one verified baseline.
                    Sourced from government departments and regulators.
                </p>

                {/* White card search input */}
                <div className="mx-auto mt-8 max-w-2xl">
                    <form onSubmit={submit}>
                        <div className="relative rounded-xl bg-white shadow-xl ring-1 ring-black/5">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                <Search className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search regulations, strategies, guidance, departments…"
                                className="w-full rounded-xl border-0 bg-transparent py-4 pl-11 pr-28 text-slate-900 placeholder:text-slate-400 focus:ring-0 text-sm"
                            />
                            <div className="absolute inset-y-2 right-2 flex items-center">
                                <button
                                    type="submit"
                                    className="h-full rounded-lg bg-navy-800 px-4 text-sm font-semibold text-white shadow-sm hover:bg-navy-700 transition-colors"
                                >
                                    Search
                                </button>
                            </div>
                        </div>
                    </form>

                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                        {QUICK_FILTERS.map((f) => (
                            <a
                                key={f.label}
                                href={f.href}
                                className="rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-sm text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                            >
                                {f.label}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
