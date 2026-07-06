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

const STAGE_DOT: Record<string, string> = {
    Active: 'bg-emerald-500',
    Proposed: 'bg-amber-500',
    'Under Review': 'bg-blue-500',
    Historical: 'bg-slate-400',
};

export function PolicyTypeBadge({ type }: { type: string }) {
    const dot = POLICY_TYPE_DOT[type] || 'bg-slate-400';
    return (
        <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700">
            <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
            {type}
        </span>
    );
}

export function StageBadge({ stage }: { stage: string }) {
    const dot = STAGE_DOT[stage] || 'bg-slate-400';
    return (
        <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700">
            <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
            {stage}
        </span>
    );
}

// Plain neutral chip for department / sector / AI application / topics.
export function NeutralBadge({ children }: { children: React.ReactNode }) {
    return (
        <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-600">
            {children}
        </span>
    );
}
