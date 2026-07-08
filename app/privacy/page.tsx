import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy — UK AI Policy Tracker',
    description: 'How the UK AI Policy Tracker handles data and privacy.',
};

export default function Privacy() {
    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Privacy policy</h1>
            <p className="text-sm text-slate-500 mb-10">Last updated: July 2026</p>

            <section className="mb-8">
                <h2 className="text-lg font-semibold text-slate-900 mb-2">What this site does</h2>
                <p className="text-sm leading-relaxed text-slate-700">
                    The UK AI Policy Tracker is a free, independent tool that summarises and links to
                    publicly available UK government AI policy documents. It has no user accounts and
                    does not ask you for any personal information.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-lg font-semibold text-slate-900 mb-2">Cookies</h2>
                <p className="text-sm leading-relaxed text-slate-700">
                    This site does not set analytics, advertising or tracking cookies. If that changes
                    in future, this policy will be updated first and consent requested where required.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-lg font-semibold text-slate-900 mb-2">Hosting and server logs</h2>
                <p className="text-sm leading-relaxed text-slate-700">
                    The site is hosted on Vercel. Like most web hosts, Vercel may process standard
                    technical request data (such as IP addresses) to serve and secure the site. See the{' '}
                    <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 underline">
                        Vercel privacy policy
                    </a>{' '}
                    for details. This data is not used by the UK AI Policy Tracker to identify visitors.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-lg font-semibold text-slate-900 mb-2">External links</h2>
                <p className="text-sm leading-relaxed text-slate-700">
                    Summaries link to official sources such as GOV.UK, the ICO and the FCA. Those sites
                    have their own privacy policies and this policy does not cover them.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-lg font-semibold text-slate-900 mb-2">Contact</h2>
                <p className="text-sm leading-relaxed text-slate-700">
                    Questions about this policy can be sent to{' '}
                    <a href="mailto:paulkwarteng12@gmail.com" className="text-primary-600 hover:text-primary-700 underline">
                        paulkwarteng12@gmail.com
                    </a>.
                </p>
            </section>
        </div>
    );
}
