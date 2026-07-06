// One shared badge system, used identically on every page (Explorer, Regulations,
// homepage cards). "In between" bland-neutral and rainbow-pastel: a small colour
// dot + neutral chip, the way Linear/Notion tag statuses — not full pastel fills.
// Colour is reserved for the two fields that are genuinely meaningful to scan:
// policy type and stage. Department/sector/topics stay plain neutral chips.

const POLICY_TYPE_DOT: Record<string, string> = {
    'Regulation & Compliance': 'bg-rose-500',
    'Strategy & Frameworks': 'bg-blue-500',
    'Implementation Guidance': 'bg-violet-500',
    'Research & Analysis': 'bg-cyan-500',
    'Funding & Investment': 'bg-amber-500',
    'International Cooperation': 'bg-emerald-500',
};

export function PolicyTypeBadge({ type }: { type: string }) {
    const dot = POLICY_TYPE_DOT[type] || 'bg-slate-500';
    return (
        <span className="inline-flex items-center gap-1.5 rounded border border-slate-300 bg-white px-2 py-0.5 text-xs font-semibold text-slate-800">
            <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
            {type}
        </span>
    );
}

// Sharp, outlined chip for department / sector / topics — defined border and
// darker text so tags read as deliberate labels, government-page style.
export function NeutralBadge({ children }: { children: React.ReactNode }) {
    return (
        <span className="inline-flex items-center rounded border border-slate-300 bg-white px-2 py-0.5 text-xs font-medium text-slate-700">
            {children}
        </span>
    );
}
