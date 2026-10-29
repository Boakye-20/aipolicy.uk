import Link from 'next/link';
import { Github, Linkedin, Search, Shield, Building2, TrendingUp, FileSearch } from 'lucide-react';

export const metadata = {
    title: 'About | UK AI Policy Tracker',
    description:
        'What the UK AI Policy Tracker is, what it covers, its limits, and who built it.',
};

const SECTIONS = [
    { name: 'Explorer', href: '/policy-explorer', icon: Search, detail: 'Search and filter every tracked document by type, department, sector and date.' },
    { name: 'Regulations', href: '/regulations', icon: Shield, detail: 'Regulator guidance and compliance material, plus a hand-maintained list of AI-relevant law in force.' },
    { name: 'Departments', href: '/departments', icon: Building2, detail: 'What each department and regulator has published on AI.' },
    { name: 'Analytics', href: '/analytics', icon: TrendingUp, detail: 'Trends in publishing activity over time.' },
];

export default function About() {
    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">About</h1>
            <p className="mt-3 text-gray-600">
                The UK AI Policy Tracker collects what the UK government and its regulators
                publish about artificial intelligence and puts it in one searchable place, with a
                short summary of each document and a link back to the original.
            </p>
            <p className="mt-3 text-gray-600">
                UK AI policy has no single home. It is spread across departments such as DSIT,
                the Treasury and the Home Office, and regulators such as the ICO, the CMA, the FCA
                and Ofcom. This site is for anyone who needs to keep up with it, including
                compliance and legal teams, policy analysts and business leaders.
            </p>

            {/* What's on the site */}
            <section className="mt-10">
                <h2 className="text-xl font-semibold text-gray-900">What you can do here</h2>
                <div className="mt-4 grid sm:grid-cols-2 gap-3">
                    {SECTIONS.map((s) => (
                        <Link key={s.name} href={s.href} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                            <h3 className="flex items-center gap-2 font-semibold text-gray-900">
                                <s.icon className="w-4 h-4 text-blue-600" /> {s.name}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">{s.detail}</p>
                        </Link>
                    ))}
                </div>
            </section>

            {/* How it works, in brief */}
            <section className="mt-10">
                <h2 className="text-xl font-semibold text-gray-900">How it works, in brief</h2>
                <ol className="mt-3 list-decimal pl-5 space-y-2 text-gray-700">
                    <li>
                        Every Monday at 06:00 UTC an automated job collects new publications from
                        GOV.UK, the ICO and the FCA. Ofcom blocks automated access, so its documents
                        are added by hand.
                    </li>
                    <li>Only documents that genuinely mention AI are kept.</li>
                    <li>
                        A language model (gpt-4o-mini) labels each one with its type and sector,
                        writes a two-sentence summary, and quotes the exact text behind any
                        obligation it reports.
                    </li>
                    <li>
                        A summary that claims an obligation without a supporting quote is hidden
                        until a person has checked it. Documents that turn out not to be about AI
                        are left out.
                    </li>
                </ol>
                <p className="mt-3 text-sm text-gray-600">
                    The full detail is on the{' '}
                    <Link href="/how-it-works" className="text-blue-600 hover:underline">How it works</Link>{' '}
                    page.
                </p>
            </section>

            {/* Limits */}
            <section className="mt-10">
                <h2 className="text-xl font-semibold text-gray-900">What to bear in mind</h2>
                <ul className="mt-3 list-disc pl-5 space-y-2 text-gray-700">
                    <li>Labels and summaries come from a model, so some will be wrong. Check the linked source before relying on anything.</li>
                    <li>Ofcom coverage is partial, because it depends on documents being added by hand.</li>
                    <li>New publications appear after the next weekly run, not the day they are published.</li>
                    <li>The &ldquo;Law in force&rdquo; list on the Regulations page is written by hand and updated when new AI law is made or commenced.</li>
                </ul>
            </section>

            {/* About Developer */}
            <section className="mt-10 bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Who built it</h2>
                <h3 className="mt-3 font-semibold text-gray-900">Paul K.</h3>
                <p className="text-sm text-gray-500 mb-3">Data &amp; AI Solutions</p>
                <p className="text-gray-700 mb-3">
                    Paul is a Data and AI Solutions specialist focused on building data-driven applications that solve real business problems. His recent work includes enterprise AI systems for financial services, automation tools for business intelligence, and several portfolio projects demonstrating end-to-end product development.
                </p>
                <p className="text-gray-700 mb-5">
                    With a BSc in Politics from the London School of Economics and experience spanning financial services, consulting, and technical implementation, Paul brings a unique blend of business acumen and technical expertise to every project. He specialises in taking complex datasets and regulatory landscapes and transforming them into actionable platforms and practical business intelligence tools.
                </p>
                <div className="flex flex-wrap gap-3">
                    <a
                        href="https://github.com/Boakye-20"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                    >
                        <Github className="w-5 h-5" />
                        GitHub
                    </a>
                    <a
                        href="https://www.linkedin.com/in/paul-kwarteng-22a71b196/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        <Linkedin className="w-5 h-5" />
                        LinkedIn
                    </a>
                </div>
            </section>

            <section className="mt-10 flex items-start gap-3 text-sm text-gray-500 border-t border-gray-200 pt-6">
                <FileSearch className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p>
                    This is an independent portfolio project, built with Next.js, TypeScript,
                    Tailwind CSS and Postgres. It summarises and links to official sources but is
                    not a substitute for them or for professional legal advice.
                </p>
            </section>
        </div>
    );
}
