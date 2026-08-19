import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 60;

// Per-instance sliding window. Good enough for Vercel serverless;
// swap for @upstash/ratelimit if cross-instance coordination is needed.
const hits = new Map<string, { count: number; resetAt: number }>();

function checkLimit(ip: string): { ok: boolean; remaining: number } {
    const now = Date.now();
    const entry = hits.get(ip);

    if (!entry || now > entry.resetAt) {
        hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
        return { ok: true, remaining: MAX_REQUESTS - 1 };
    }

    entry.count++;
    return { ok: entry.count <= MAX_REQUESTS, remaining: Math.max(0, MAX_REQUESTS - entry.count) };
}

export function middleware(request: NextRequest) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    const { ok, remaining } = checkLimit(ip);

    if (!ok) {
        return new NextResponse('Too Many Requests', {
            status: 429,
            headers: {
                'Retry-After': '60',
                'X-RateLimit-Limit': String(MAX_REQUESTS),
                'X-RateLimit-Remaining': '0',
            },
        });
    }

    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Remaining', String(remaining));
    return response;
}

export const config = {
    matcher: ['/api/:path*'],
};
