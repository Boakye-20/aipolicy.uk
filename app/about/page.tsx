'use client';

import { Github, Linkedin, ExternalLink, Shield, TrendingUp, Database, Search } from 'lucide-react';

export default function About() {
    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Header */}
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">About This Project</h1>
                <p className="text-xl text-gray-600">
                    Making UK AI policy accessible and actionable
                </p>
            </div>

            {/* The Problem */}
            <section className="mb-12 bg-white rounded-lg shadow-lg p-8 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">The Challenge</h2>
                <p className="text-gray-700 mb-4">
                    UK businesses face a rapidly evolving AI regulatory landscape spread across multiple government departments and agencies. This makes it challenging to:
                </p>
                <ul className="list-disc pl-5 mb-4 space-y-2 text-gray-700">
                    <li>Stay compliant with the latest AI regulations and guidelines</li>
                    <li>Understand which policies apply to specific AI use cases</li>
                    <li>Track updates and changes across different regulatory bodies</li>
                    <li>Access clear, actionable insights from complex policy documents</li>
                </ul>
            </section>

            {/* The Solution */}
            <section className="mb-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-lg p-8 border border-blue-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">The Solution</h2>
                <p className="text-gray-700 mb-4">
                    This platform provides a centralised, searchable database of UK AI policies with:
                </p>
                <ul className="list-disc pl-5 mb-6 space-y-2 text-gray-700">
                    <li>AI-related publications from GOV.UK departments, the ICO and the CMA, plus the FCA and Ofcom where available</li>
                    <li>Clear categorisation by policy type, department, and sector</li>
                    <li>Weekly updates, with open consultations marked closed once their deadline passes</li>
                    <li>Short summaries, with any obligations backed by a verbatim quote from the source</li>
                </ul>
                <div className="bg-white p-4 rounded-lg border border-blue-100">
                    <h3 className="font-semibold text-gray-800 mb-2">Key Features:</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex items-start">
                            <Search className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                            <div>
                                <h4 className="font-medium text-gray-900">Policy Explorer</h4>
                                <p className="text-sm text-gray-600">Search and filter through all UK AI policies</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                            <div>
                                <h4 className="font-medium text-gray-900">Analytics Dashboard</h4>
                                <p className="text-sm text-gray-600">Track policy trends and department activity</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <Shield className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                            <div>
                                <h4 className="font-medium text-gray-900">Regulatory Watch</h4>
                                <p className="text-sm text-gray-600">Stay updated on compliance requirements</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <Database className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                            <div>
                                <h4 className="font-medium text-gray-900">Review Gate</h4>
                                <p className="text-sm text-gray-600">Unverified claims are held back until a human checks them</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="mb-12 bg-white rounded-lg shadow-lg p-8 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>

                <div className="space-y-8">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-bold">1</span>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Collection</h3>
                            <p className="text-gray-700">
                                Every Monday an automated job collects documents published since its last run from GOV.UK departments, the ICO and the CMA, with the FCA read from its own site. Ofcom blocks automated access, so its documents are added by hand. Only documents that genuinely mention AI are kept.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-bold">2</span>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Analysis & Categorisation</h3>
                            <p className="text-gray-700">
                                The full text of each document goes to a language model (gpt-4o-mini), which fills in a fixed form: policy type, sector, a two-sentence summary, any obligations with the exact quote they came from, and a score for how much the document is about AI.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-bold">3</span>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Review & Publication</h3>
                            <p className="text-gray-700">
                                Summaries whose obligations cannot be backed by a quote are hidden until a human reads them, and documents that are not really about AI are excluded. The Regulations page also carries a hand-written "Law in force" list of statutes, which is updated manually.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Who This Helps */}
            <section className="mb-12 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg shadow-lg p-8 border border-indigo-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Who This Helps</h2>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Business Leaders</h3>
                        <p className="text-gray-700">
                            Make informed decisions about AI adoption while ensuring compliance with evolving regulations. Identify opportunities and risks in the UK's AI policy landscape.
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Compliance Teams</h3>
                        <p className="text-gray-700">
                            Stay ahead of regulatory changes and streamline compliance processes with our comprehensive policy database and analysis tools.
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Policy Analysts</h3>
                        <p className="text-gray-700">
                            Access a centralised repository of UK AI policies with advanced search and analysis capabilities to support your research and reporting.
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Legal Professionals</h3>
                        <p className="text-gray-700">
                            Quickly identify relevant AI regulations and track policy developments that may impact your clients' operations and compliance requirements.
                        </p>
                    </div>
                </div>
            </section>

            {/* Data & Methodology */}
            <section className="mb-12 bg-white rounded-lg shadow-lg p-8 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Data & Methodology</h2>

                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Sources</h3>
                        <p className="text-gray-700 mb-4">
                            Documents are collected from:
                        </p>
                        <ul className="list-disc pl-5 space-y-1 text-gray-700">
                            <li>GOV.UK: DSIT, DBT, Cabinet Office, Home Office, Treasury, DHSC, DfE, CMA and FCA publications, plus their consultations</li>
                            <li>Information Commissioner's Office (ICO): news and consultations</li>
                            <li>Financial Conduct Authority (FCA): read from its own site</li>
                            <li>Ofcom: added by hand, so coverage is partial</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Update Frequency</h3>
                        <p className="text-gray-700">
                            The collection job runs every Monday at 06:00 UTC, and pages refresh from the database at most once an hour. Items published between runs appear after the next run.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Accuracy</h3>
                        <p className="text-gray-700 mb-2">
                            Labels and summaries are generated by a model, so some will be wrong. Always check the linked source document before relying on anything here. This site is not legal advice.
                        </p>
                    </div>
                </div>
            </section>

            {/* About Developer */}
            <section className="mb-12 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg shadow-lg p-8 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About the Developer</h2>

                <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Paul K.</h3>
                    <p className="text-gray-600 mb-4">
                        Data & AI Solutions
                    </p>

                    <p className="text-gray-700 mb-6">
                        Paul works in data and AI, with experience across the public and private sectors, from audit and risk in local government to financial services and consulting. He holds a BSc in Politics from the London School of Economics and is studying for an MSc in Big Data &amp; Digital Futures at the University of Warwick. He built this tracker to turn a scattered regulatory landscape into something searchable and checkable.
                    </p>
                </div>

                {/* Contact Links */}
                <div className="flex flex-wrap gap-4">
                    <a
                        href="https://github.com/Boakye-20"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                    >
                        <Github className="w-5 h-5" />
                        GitHub
                    </a>
                    <a
                        href="https://www.linkedin.com/in/paul-kwarteng-22a71b196/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        <Linkedin className="w-5 h-5" />
                        LinkedIn
                    </a>
                </div>
            </section>

            {/* Technical Note */}
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h2a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-blue-700">
                            This is a portfolio project built with Next.js, TypeScript, and Tailwind CSS. The application demonstrates modern web development practices and data visualization techniques. Automated categorisation uses gpt-4o-mini.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
