'use client';

// Route-level error boundary (Next.js App Router). Catches render-time errors in
// any page segment so one broken component shows a graceful fallback instead of
// crashing the whole app. Async fetch errors are handled in-page (the pages have
// their own "Error Loading Data / Retry" states); this is the safety net for
// unexpected render crashes.

import { useEffect } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Surface to the console for debugging; in production this is where a
        // logging/monitoring hook (e.g. Sentry) would go.
        console.error('Page render error:', error);
    }, [error]);

    return (
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-50 mb-5">
                <AlertTriangle className="w-7 h-7 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-6">
                This part of the page failed to load. The rest of the app is unaffected —
                you can try again, or navigate elsewhere using the menu above.
            </p>
            <button
                onClick={reset}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
                <RotateCcw className="w-4 h-4" />
                Try again
            </button>
        </div>
    );
}
