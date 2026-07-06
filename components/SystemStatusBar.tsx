'use client';

import { useEffect, useState } from 'react';
import { Policy } from '@/types/policy';
import { Database, Clock, Building2, Activity } from 'lucide-react';

// Operational trust strip: data freshness + coverage, derived from real data.
// Degrades gracefully — if the feed can't be read, it shows a neutral fallback
// rather than fabricating a status.
export default function SystemStatusBar() {
    const [stats, setStats] = useState<{
        total: number;
        sources: number;
        lastUpdated: string;
    } | null>(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        let cancelled = false;
        fetch('/api/policies')
            .then((r) => {
                if (!r.ok) throw new Error('feed unavailable');
                return r.json();
            })
            .then((res) => {
                if (cancelled) return;
                const data: Policy[] = res.data ?? [];
                const sources = new Set(data.map((p) => p.dept).filter(Boolean)).size;
                const times = data
                    .map((p) => new Date(p.published_date).getTime())
                    .filter((t) => !isNaN(t));
                const last = times.length
                    ? new Date(Math.max(...times)).toLocaleDateString('en-GB', {
                          day: 'numeric', month: 'short', year: 'numeric',
                      })
                    : '—';
                setStats({ total: data.length, sources, lastUpdated: last });
            })
            .catch(() => !cancelled && setFailed(true));
        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <div className="bg-navy-950/60 border-t border-navy-700">
            <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-1 py-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                        <span className={`h-2 w-2 rounded-full ${failed ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                        <span className="text-slate-300 font-medium">
                            {failed ? 'Feed degraded' : 'Feed live'}
                        </span>
                    </span>
                    {stats && (
                        <>
                            <span className="flex items-center gap-1.5">
                                <Database className="h-3.5 w-3.5" />
                                <span className="nums-tabular">{stats.total.toLocaleString()}</span> policies tracked
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Building2 className="h-3.5 w-3.5" />
                                <span className="nums-tabular">{stats.sources}</span> sources
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5" />
                                Updated <span className="nums-tabular">{stats.lastUpdated}</span>
                            </span>
                        </>
                    )}
                    {!stats && !failed && (
                        <span className="flex items-center gap-1.5 text-slate-500">
                            <Activity className="h-3.5 w-3.5 animate-pulse" /> Loading feed status…
                        </span>
                    )}
                    <span className="ml-auto hidden sm:inline text-slate-500">
                        GOV.UK · ICO · FCA
                    </span>
                </div>
            </div>
        </div>
    );
}
