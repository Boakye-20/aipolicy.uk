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

// Normalise GOV.UK's raw document_type values (snake_case + a few scraped
// labels) into clean display labels, preserving the open/closed consultation
// distinction. Returns { open: true } only for consultations still taking input.
export function documentTypeLabel(raw?: string | null): { label: string; open: boolean } | null {
    if (!raw || !raw.trim()) return null;
    const f = raw.trim().toLowerCase().replace(/\s+/g, '_');

    // Consultations — keep open vs closed vs outcome distinct.
    if (f === 'open_consultation') return { label: 'Open consultation', open: true };
    if (f === 'call_for_evidence') return { label: 'Call for evidence', open: true };
    if (f === 'closed_consultation') return { label: 'Closed consultation', open: false };
    if (f === 'closed_call_for_evidence') return { label: 'Closed call for evidence', open: false };
    if (f === 'consultation_outcome' || f === 'call_for_evidence_outcome') return { label: 'Consultation outcome', open: false };
    if (f.includes('consultation')) return { label: 'Consultation', open: false };

    const map: Record<string, string> = {
        policy_paper: 'Policy paper',
        policy_statement: 'Policy statement',
        guidance: 'Guidance',
        finalised_guidance: 'Guidance',
        detailed_guide: 'Guidance',
        guide: 'Guidance',
        statutory_guidance: 'Statutory guidance',
        research: 'Research',
        drcf_digital_markets_research: 'Research',
        independent_report: 'Independent report',
        impact_assessment: 'Impact assessment',
        press_release: 'Press release',
        press_releases: 'Press release',
        news_story: 'News',
        news_stories: 'News',
        news_article: 'News',
        news: 'News',
        speech: 'Speech',
        speeches: 'Speech',
        oral_statement: 'Statement',
        written_statement: 'Statement',
        statement: 'Statement',
        statements: 'Statement',
        corporate_report: 'Corporate report',
        transparency: 'Transparency',
        algorithmic_transparency_record: 'Transparency',
        ai_assurance_portfolio_technique: 'AI assurance technique',
        decision: 'Decision',
        notice: 'Notice',
        correspondence: 'Correspondence',
        document_collection: 'Collection',
        case_study: 'Case study',
        international_treaty: 'International treaty',
        national_statistics: 'Statistics',
        official_statistics: 'Statistics',
        cma_case: 'CMA case',
        blog: 'Blog',
        form: 'Form',
        standard: 'Standard',
    };
    if (map[f]) return { label: map[f], open: false };

    // Fallback: title-case the raw value so unknown types still read cleanly.
    const label = f.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    return { label, open: false };
}

// The document/instrument type from GOV.UK metadata — a hard fact. Open
// consultations get a stronger, dotted treatment to flag they're still live.
export function DocumentTypeBadge({ format }: { format?: string | null }) {
    const dt = documentTypeLabel(format);
    if (!dt) return null;
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-xs ${
                dt.open
                    ? 'border-slate-900 text-slate-900 font-semibold'
                    : 'border-slate-300 text-slate-700 font-medium'
            }`}
        >
            {dt.open && <span className="h-1.5 w-1.5 rounded-full bg-slate-900" />}
            {dt.label}
        </span>
    );
}

// Coarse category for the document-type FILTER — groups the ~40 raw GOV.UK
// types into a tidy set with an "Other" catch-all. The card badge still shows
// the specific type (documentTypeLabel); this is only used to drive the filter.
export const DOCUMENT_TYPE_CATEGORIES = [
    'Open consultation',
    'Closed consultation',
    'Policy paper',
    'Guidance',
    'Research & reports',
    'News & press releases',
    'Speeches & statements',
    'Transparency',
    'Notices & decisions',
    'Other',
] as const;

export function documentTypeCategory(raw?: string | null): string {
    if (!raw || !raw.trim()) return 'Other';
    const f = raw.trim().toLowerCase().replace(/\s+/g, '_');

    if (f === 'open_consultation' || f === 'call_for_evidence') return 'Open consultation';
    if (f.includes('consultation') || f.includes('call_for_evidence')) return 'Closed consultation';
    if (f === 'policy_paper' || f === 'policy_statement') return 'Policy paper';
    if (['guidance', 'finalised_guidance', 'detailed_guide', 'guide', 'statutory_guidance'].includes(f)) return 'Guidance';
    if (['research', 'drcf_digital_markets_research', 'independent_report', 'national_statistics', 'official_statistics', 'impact_assessment', 'corporate_report'].includes(f)) return 'Research & reports';
    if (['press_release', 'press_releases', 'news', 'news_story', 'news_stories', 'news_article'].includes(f)) return 'News & press releases';
    if (['speech', 'speeches', 'oral_statement', 'written_statement', 'statement', 'statements'].includes(f)) return 'Speeches & statements';
    if (['transparency', 'algorithmic_transparency_record', 'ai_assurance_portfolio_technique'].includes(f)) return 'Transparency';
    if (['notice', 'decision', 'correspondence'].includes(f)) return 'Notices & decisions';
    return 'Other';
}
