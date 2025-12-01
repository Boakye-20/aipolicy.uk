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
                    <li>Comprehensive coverage of AI policies across all government departments</li>
                    <li>Clear categorisation by policy type, department, and sector</li>
                    <li>Regular updates on new policies and regulatory changes</li>
                    <li>Actionable insights and analysis of policy implications</li>
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
                                <h4 className="font-medium text-gray-900">Data Integration</h4>
                                <p className="text-sm text-gray-600">Connect with your existing compliance systems</p>
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
                                We continuously monitor and collect AI policy documents from all UK government departments, agencies, and regulatory bodies. Our sources include official publications, parliamentary records, and regulatory announcements.
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
                                Each policy is analysed and categorised by our team of policy experts and AI systems. We identify key attributes such as policy type, affected sectors, implementation dates, and compliance requirements.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-bold">3</span>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Insight Generation</h3>
                            <p className="text-gray-700">
                                Our platform processes the structured data to generate actionable insights, highlight regulatory trends, and provide clear guidance on compliance requirements for different AI applications.
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
                            Our database includes policies from all major UK government departments and regulatory bodies, including but not limited to:
                        </p>
                        <ul className="list-disc pl-5 space-y-1 text-gray-700">
                            <li>Department for Science, Innovation and Technology (DSIT)</li>
                            <li>Competition and Markets Authority (CMA)</li>
                            <li>Information Commissioner's Office (ICO)</li>
                            <li>Centre for Data Ethics and Innovation (CDEI)</li>
                            <li>Office for Artificial Intelligence</li>
                            <li>And other relevant government agencies</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Update Frequency</h3>
                        <p className="text-gray-700">
                            Our database is updated weekly to ensure you have access to the latest policy developments. Major regulatory announcements are added within 24-48 hours of publication.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Analysis Framework</h3>
                        <p className="text-gray-700 mb-2">
                            Each policy is analysed using a consistent framework that evaluates:
                        </p>
                        <ul className="list-disc pl-5 space-y-1 text-gray-700">
                            <li>Regulatory requirements and compliance obligations</li>
                            <li>Impact on different sectors and business functions</li>
                            <li>Implementation timelines and transitional provisions</li>
                            <li>Interactions with other relevant regulations</li>
                        </ul>
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
                        Paul is a Data and AI Solutions specialist focused on building data-driven applications that solve real business problems. His recent work includes enterprise AI systems for financial services, automation tools for business intelligence, and several portfolio projects demonstrating end-to-end product development.
                    </p>

                    <p className="text-gray-700 mb-6">
                        With a BSc in Politics from the London School of Economics and experience spanning financial services, consulting, and technical implementation, Paul brings a unique blend of business acumen and technical expertise to every project. He specialises in taking complex datasets and regulatory landscapes and transforming them into actionable platforms and practical business intelligence tools.
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
                            This is a portfolio project built with Next.js, TypeScript, and Tailwind CSS. The application demonstrates modern web development practices and data visualization techniques.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
