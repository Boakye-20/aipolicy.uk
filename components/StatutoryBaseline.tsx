import { ExternalLink } from 'lucide-react';

// Curated register of UK law that specifically regulates AI. Static editorial
// content, not ETL output: hard law changes rarely, and the feed below can't
// tell a statute from a press release. Verified October 2026; update when a
// new instrument is made or commenced.
const instruments = [
    {
        name: 'Data Protection Act 2018 (Code of Practice on AI and Automated Decision-Making) Regulations 2026',
        citation: 'SI 2026/425',
        date: 'In force 12 May 2026',
        effect: 'Puts the ICO code of practice on AI and automated decision-making on a statutory footing.',
        url: 'https://www.legislation.gov.uk/uksi/2026/425/made',
    },
    {
        name: 'Data (Use and Access) Act 2025',
        citation: '2025 c. 18',
        date: 'ADM rules in force 5 February 2026',
        effect: 'Replaces UK GDPR Article 22 with new automated decision-making rules and safeguards (Articles 22A to 22D).',
        url: 'https://www.legislation.gov.uk/ukpga/2025/18',
    },
    {
        name: 'Crime and Policing Act 2026',
        citation: '2026 c. 20',
        date: 'Royal Assent 29 April 2026',
        effect: 'Creates offences for making or supplying AI models built to generate child sexual abuse material, and nudification tools.',
        url: 'https://www.legislation.gov.uk/ukpga/2026/20',
    },
    {
        name: 'Automated Vehicles Act 2024',
        citation: '2024 c. 10',
        date: 'Royal Assent 20 May 2024',
        effect: 'Sets the legal framework for self-driving vehicles, including authorisation, operator licensing and who is liable when the vehicle drives itself.',
        url: 'https://www.legislation.gov.uk/ukpga/2024/10',
    },
    {
        name: 'Online Safety Act 2023',
        citation: '2023 c. 50',
        date: 'Royal Assent 26 October 2023',
        effect: 'Ofcom safety duties apply to generative AI chatbots and AI-generated content on regulated services.',
        url: 'https://www.legislation.gov.uk/ukpga/2023/50',
    },
];

export default function StatutoryBaseline() {
    return (
        <div className="mb-8 rounded-md border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-5 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Law in force
                </p>
                <p className="mt-1 text-xs text-slate-500">
                    The UK has no cross-sector AI Act. These are the statutes with AI-specific provisions;
                    the AI (Regulation) Bill is a Private Member&apos;s Bill, not law.
                </p>
            </div>
            <ul className="divide-y divide-slate-100">
                {instruments.map((i) => (
                    <li key={i.citation} className="px-5 py-3">
                        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                            <a
                                href={i.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-baseline gap-1 text-sm font-medium text-slate-900 hover:text-primary-700"
                            >
                                {i.name}
                                <ExternalLink className="h-3 w-3 flex-none self-center text-slate-400" />
                            </a>
                            <span className="whitespace-nowrap text-xs text-slate-500 nums-tabular">
                                {i.citation} · {i.date}
                            </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-600">{i.effect}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}
