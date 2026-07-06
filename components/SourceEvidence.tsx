'use client';

import { useState } from 'react';
import { ShieldCheck, ChevronDown, ChevronUp, Quote } from 'lucide-react';
import { Policy } from '@/types/policy';

/**
 * "Show your work" evidence panel.
 *
 * Surfaces the trust data the extraction pipeline already produces but the UI
 * never displayed: the specific obligations pulled from a policy, and the
 * single sentence copied verbatim from the source document that backs them.
 * Every live policy that claims obligations is guaranteed (by the pipeline's
 * quote gate) to have a real quote here — so this turns the invisible
 * anti-hallucination check into something a user can actually verify.
 */
export default function SourceEvidence({ policy }: { policy: Policy }) {
    const [open, setOpen] = useState(false);

    const obligations = policy.core_obligations ?? [];
    const quote = policy.source_quote?.trim();

    // Nothing to show for documents with no extracted obligations/quote
    // (e.g. background news with no compliance ask).
    if (obligations.length === 0 && !quote) return null;

    return (
        <div className="mt-3 border-t border-slate-200 pt-3">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                className="w-full flex items-center justify-between gap-2 text-left"
            >
                <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <ShieldCheck className="w-4 h-4 text-slate-400" />
                    Source evidence
                    {obligations.length > 0 && (
                        <span className="text-xs font-normal text-slate-500">
                            ({obligations.length} obligation{obligations.length !== 1 ? 's' : ''})
                        </span>
                    )}
                </span>
                {open
                    ? <ChevronUp className="w-4 h-4 text-slate-500" />
                    : <ChevronDown className="w-4 h-4 text-slate-500" />}
            </button>

            {open && (
                <div className="pt-3 space-y-3">
                    {obligations.length > 0 && (
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                                Obligations identified
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                                {obligations.map((o, i) => (
                                    <li key={i}>{o}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {quote && (
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                                Verbatim quote from the source
                            </p>
                            <blockquote className="flex gap-2 text-sm text-slate-700 italic border-l-2 border-slate-300 pl-3">
                                <Quote className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                                <span>{quote}</span>
                            </blockquote>
                        </div>
                    )}

                    <p className="text-xs text-gray-500">
                        Summaries are AI-extracted, then verified against this quote before
                        publishing.{' '}
                        <a
                            href={policy.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-700 underline"
                        >
                            Check the original document
                        </a>
                        .
                    </p>
                </div>
            )}
        </div>
    );
}
