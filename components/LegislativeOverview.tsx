// Static editorial cards summarising the current UK AI legislative landscape.
// Content reflects the position as of mid-2026; update when major bills pass.

const cards = [
    {
        category: 'Statutory Legislation',
        badge: 'No Specific AI Bill',
        badgeClass: 'badge-proposed',
        heading: 'Incremental Adaptations',
        body: 'No dedicated cross-sector AI bill is before Parliament. Regulation proceeds via targeted modifications to existing regimes — e.g. updates to the Crime and Policing Bill regarding CSAM detection obligations.',
    },
    {
        category: 'Regulatory Oversight',
        badge: 'Active Sector-Remits',
        badgeClass: 'badge-guideline',
        heading: 'Decentralised Enforcement',
        body: 'The non-binding, principles-based structure remains in place. The AI Opportunities Action Plan weights priority toward market scaling, with sector regulators (ICO, FCA, CMA) exercising their own AI remits independently.',
    },
    {
        category: 'IP & Data Assets',
        badge: 'Under Review',
        badgeClass: 'badge-enacted',
        heading: 'Copyright & TDM Exceptions',
        body: "Government's March 2026 report signals intent to repeal CDPA s.9(3) computer-generated protections and has stepped back from a broad commercial text-and-data-mining exemption scheme.",
    },
];

const milestones = [
    {
        label: 'Summer 2026',
        active: true,
        title: 'Digital Replicas Consultation',
        detail: 'Forthcoming formal consultation on synthetic media, generative cloning, and personality-trait protections.',
    },
    {
        label: 'March 2026',
        active: false,
        title: 'Copyright Impact Assessment',
        detail: 'Formal economic baseline analysis tabled under the Data (Use and Access) Act provisions.',
    },
    {
        label: 'Feb 2026',
        active: false,
        title: 'AI Opportunities Action Plan',
        detail: '50-point plan published; government commits to compute expansion and sovereign AI infrastructure.',
    },
];

export default function LegislativeOverview() {
    return (
        <div className="bg-white border-t border-slate-200">
            <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8 py-12">

                {/* 3-column legislative summary */}
                <div className="grid gap-6 md:grid-cols-3">
                    {cards.map((c) => (
                        <div key={c.category} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="flex items-center justify-between gap-2">
                                <h3 className="text-xs font-bold tracking-wide uppercase text-slate-500">
                                    {c.category}
                                </h3>
                                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ${c.badgeClass}`}>
                                    {c.badge}
                                </span>
                            </div>
                            <p className="mt-4 text-xl font-bold text-slate-900">{c.heading}</p>
                            <p className="mt-2 text-sm text-slate-600 leading-relaxed">{c.body}</p>
                        </div>
                    ))}
                </div>

                {/* Map placeholder + milestones */}
                <div className="mt-8 grid gap-6 lg:grid-cols-3">

                    {/* Jurisdiction / department concentration — left 2 cols */}
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-base font-bold text-slate-900">
                                    Departmental &amp; Jurisdictional Concentration
                                </h2>
                                <p className="mt-0.5 text-sm text-slate-500">
                                    Activity weights across central departments (DSIT, CMA, FCA, ICO) and devolved nations.
                                </p>
                            </div>
                            <div className="mt-3 inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 sm:mt-0">
                                <a href="/departments" className="rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 shadow-sm">
                                    By Department
                                </a>
                                <a href="/analytics" className="rounded-md px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors">
                                    Analytics
                                </a>
                            </div>
                        </div>

                        <div className="mt-6 flex h-64 items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50">
                            <div className="text-center">
                                <svg className="mx-auto h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                                </svg>
                                <p className="mt-2 text-sm font-medium text-slate-700">
                                    Devolved Nation Overview
                                </p>
                                <p className="mt-1 text-xs text-slate-400">
                                    England · Scotland · Wales · Northern Ireland
                                </p>
                                <a
                                    href="/departments"
                                    className="mt-4 inline-flex items-center rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-700 transition-colors"
                                >
                                    View department breakdown →
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Milestones — right col */}
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-base font-bold text-slate-900">Key Milestones</h2>
                        <p className="mt-0.5 text-sm text-slate-500">Upcoming and recent pipeline events.</p>

                        <ul className="mt-6 space-y-5">
                            {milestones.map((m, i) => (
                                <li key={i} className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className={`h-2.5 w-2.5 rounded-full mt-1 ${m.active ? 'bg-navy-900 ring-4 ring-slate-100' : 'bg-slate-300'}`} />
                                        {i < milestones.length - 1 && (
                                            <div className="mt-1 w-px flex-1 bg-slate-200" />
                                        )}
                                    </div>
                                    <div className="pb-4">
                                        <p className={`text-xs font-semibold uppercase tracking-wider ${m.active ? 'text-navy-800' : 'text-slate-400'}`}>
                                            {m.label}
                                        </p>
                                        <p className={`text-sm font-semibold mt-0.5 ${m.active ? 'text-slate-900' : 'text-slate-700'}`}>
                                            {m.title}
                                        </p>
                                        <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">
                                            {m.detail}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
