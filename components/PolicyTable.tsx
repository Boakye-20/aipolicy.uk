'use client';

import { Policy } from '@/types/policy';
import { cn, formatDate } from '@/lib/utils';
import { ExternalLink, ArrowUp, ArrowDown, Copy } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PolicyTableProps {
    policies: Policy[];
}

const SortableHeader = ({ children, field, sortField, sortDirection, setSort, setDirection }: {
    children: React.ReactNode;
    field: 'published_date' | 'title' | 'dept';
    sortField: string;
    sortDirection: string;
    setSort: (f: 'published_date' | 'title' | 'dept') => void;
    setDirection: (d: 'asc' | 'desc') => void;
}) => {
    const isActive = sortField === field;
    const isAsc = sortDirection === 'asc';

    return (
        <th
            scope="col"
            className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
            onClick={() => {
                if (isActive) {
                    setDirection(isAsc ? 'desc' : 'asc');
                } else {
                    setSort(field);
                    setDirection('desc');
                }
            }}
        >
            <div className="flex items-center">
                <span>{children}</span>
                {isActive && (
                    <span className="ml-2">
                        {isAsc ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                    </span>
                )}
            </div>
        </th>
    );
}

export default function PolicyTable({ policies }: PolicyTableProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState<'published_date' | 'title' | 'dept'>('published_date');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const itemsPerPage = 15;

    const sortedPolicies = [...policies].sort((a, b) => {
        const aValue = a[sortField] || '';
        const bValue = b[sortField] || '';

        if (sortField === 'published_date') {
            return (new Date(bValue).getTime() - new Date(aValue).getTime()) * (sortDirection === 'desc' ? 1 : -1);
        }
        
        return String(aValue).localeCompare(String(bValue)) * (sortDirection === 'desc' ? -1 : 1);
    });

    const totalPages = Math.ceil(sortedPolicies.length / itemsPerPage);
    const currentPolicies = sortedPolicies.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <SortableHeader field="title" {...{ sortField, sortDirection, setSort: setSortField, setDirection: setSortDirection }}>Title</SortableHeader>
                            <SortableHeader field="dept" {...{ sortField, sortDirection, setSort: setSortField, setDirection: setSortDirection }}>Department</SortableHeader>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                            <SortableHeader field="published_date" {...{ sortField, sortDirection, setSort: setSortField, setDirection: setSortDirection }}>Published</SortableHeader>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {currentPolicies.map((policy) => (
                            <tr key={policy.url} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 max-w-sm">
                                    <div className="text-sm font-semibold text-slate-800 truncate" title={policy.title}>
                                        {policy.title}
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{policy.ai_summary}</p>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-slate-600">{policy.dept}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <Badge variant="secondary">{policy.policy_type}</Badge>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                    {formatDate(policy.published_date)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex items-center gap-2">
                                        <a
                                            href={policy.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center h-9 rounded-md px-3 text-sm font-medium border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 transition-colors"
                                        >
                                            <ExternalLink className="h-4 w-4 mr-2" /> Source
                                        </a>
                                        {policy.citation && (
                                            <button
                                                onClick={() => navigator.clipboard.writeText(policy.citation!)}
                                                className="inline-flex items-center h-9 w-9 justify-center rounded-md text-sm hover:bg-slate-100 hover:text-slate-900 transition-colors"
                                            >
                                                <Copy className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {/* Pagination */}
            <div className="flex items-center justify-between py-4 px-6 border-t border-slate-200">
                <p className="text-sm text-slate-600">
                    Page {currentPage} of {totalPages}
                </p>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>First</Button>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>Previous</Button>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}>Next</Button>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>Last</Button>
                </div>
            </div>
        </div>
    );
}
