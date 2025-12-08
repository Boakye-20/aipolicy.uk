'use client';

import { Github, Linkedin, ExternalLink, Shield, TrendingUp, Database } from 'lucide-react';

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
                    UK businesses face a rapidly evolving AI regulatory landscape spread across multiple government
                    departments. Tracking policy developments, understanding compliance requirements, and identifying
                    strategic opportunities requires significant time and expertise.
                </p>
                <p className="text-gray-700">
                    With over 500 policy documents published across 9 departments, staying current with AI regulations
                    is increasingly challenging for compliance teams, legal advisors, and business strategists.
                </p>
            </section>

            {/* The Solution */}
            <section className="mb-12 bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg shadow-lg p-8 border border-primary-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">The Solution</h2>
                <p className="text-gray-700 mb-6">
                    This dashboard consolidates AI policy intelligence from across UK government into a single,
                    searchable platform. Automated categorization and filtering help users quickly identify relevant
                    regulations, strategic guidance, and emerging trends specific to their sector and business needs.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg p-4 border border-primary-200">
                        <Database className="w-10 h-10 text-primary-600 mb-3" />
                        <h3 className="font-semibold text-gray-900 mb-2">Comprehensive Coverage</h3>
                        <p className="text-sm text-gray-600">
                            500+ AI-specific policies from 9 government departments, automatically updated quarterly
                        </p>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-primary-200">
                        <Shield className="w-10 h-10 text-red-600 mb-3" />
                        <h3 className="font-semibold text-gray-900 mb-2">Regulation Tracking</h3>
                        <p className="text-sm text-gray-600">
                            Dedicated monitor for AI compliance requirements across sectors and departments
                        </p>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-primary-200">
                        <TrendingUp className="w-10 h-10 text-green-600 mb-3" />
                        <h3 className="font-semibold text-gray-900 mb-2">Trend Analysis</h3>
                        <p className="text-sm text-gray-600">
                            Track policy evolution, emerging themes, and department activity over time
                        </p>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="mb-12 bg-white rounded-lg shadow-lg p-8 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">How It Works</h2>

                <div className="space-y-6">
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                            1
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-1">Automated Data Collection</h3>
                            <p className="text-gray-600 text-sm">
                                Quarterly collection of AI policy documents from official GOV.UK APIs across 9 departments including
                                DSIT, DBT, Cabinet Office, Home Office, Treasury, CMA, ICO, DHSC, and DfE.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                            2
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-1">Intelligent Categorisation</h3>
                            <p className="text-gray-600 text-sm">
                                Each policy is automatically categorised by type (regulation, strategic guidance, research),
                                sector focus, AI application area, and key themes. Non-AI content is filtered out to maintain focus.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                            3
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-1">Interactive Analysis</h3>
                            <p className="text-gray-600 text-sm">
                                Users can filter and search across multiple dimensions - department, policy type, sector,
                                date range - to find policies relevant to their specific compliance and strategic requirements.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Use Cases */}
            <section className="mb-12 bg-white rounded-lg shadow-lg p-8 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Who This Helps</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Compliance Teams</h3>
                        <p className="text-gray-600 text-sm">
                            Quickly identify AI regulations applicable to your sector and track compliance requirements
                            across departments.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Strategy & Policy Teams</h3>
                        <p className="text-gray-600 text-sm">
                            Monitor emerging AI policy trends, understand government priorities, and inform strategic
                            planning decisions.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Legal & Risk Teams</h3>
                        <p className="text-gray-600 text-sm">
                            Track regulatory consultations, proposed legislation, and implementation guidance relevant
                            to AI governance.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Consultants & Researchers</h3>
                        <p className="text-gray-600 text-sm">
                            Analyse UK AI policy landscape, identify gaps, and provide evidence-based recommendations
                            to clients.
                        </p>
                    </div>
                </div>
            </section>

            {/* Data & Methodology */}
            <section className="mb-12 bg-white rounded-lg shadow-lg p-8 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Data & Methodology</h2>

                <div className="space-y-4 text-gray-700">
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Data Sources</h3>
                        <p className="text-sm">
                            All policy documents are sourced from official UK government publications via GOV.UK APIs.
                            The dashboard currently covers over 20 years of AI policy documents (2004-2025).
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Categorisation</h3>
                        <p className="text-sm">
                            Policies are categorised by type (regulation vs guidance vs research), sector focus,
                            AI application area, and department. Automated filtering removes non-AI content to maintain
                            dataset quality and relevance.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Update Frequency</h3>
                        <p className="text-sm">
                            The dashboard is updated quarterly with new policy publications, ensuring current coverage of
                            the UK AI regulatory landscape.
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

                    <p className="text-gray-700 mb-4">
                        Paul is a developer and AI implementation specialist focused on building data-driven applications that solve real business problems. His recent work includes enterprise AI systems for financial services, automation tools for business intelligence, and several portfolio projects demonstrating end-to-end product development.
                    </p>

                    <p className="text-gray-700 mb-6">
                        With a BSc in Politics from the London School of Economics and experience spanning financial services, consulting, and technical implementation, PK brings a unique blend of business acumen and technical expertise to every project. He specialises in taking complex datasets and regulatory landscapes and transforming them into actionable platforms and practical business intelligence tools.
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
                    <a
                        href="https://github.com/Boakye-20/aipolicy.uk"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                    >
                        <ExternalLink className="w-5 h-5" />
                        View Source Code
                    </a>
                </div >



                {/* Technical Note */}
                < div className="bg-blue-50 border border-blue-200 rounded-lg p-6" >
                    <h3 className="font-semibold text-blue-900 mb-2">Technical Implementation</h3>
                    <p className="text-blue-800 text-sm">
                        Built with Next.js, TypeScript, and automated data processing pipelines.
                        For technical details and implementation documentation, visit the{' '}
                        <a
                            href="https://github.com/Boakye-20"
                            className="underline hover:text-blue-900"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            GitHub repository
                        </a>.
                    </p>
                </div >
            </section >
        </div >
    );
}
