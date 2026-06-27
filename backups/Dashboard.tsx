'use client';

import { useEffect, useState } from 'react';
import { Policy } from '@/types/policy';
import { calculateDashboardStats, groupByDepartment } from '@/lib/utils';
import StatCard from './StatCard';
import DepartmentChart from './DepartmentChart';
import PriorityChart from './PriorityChart';
import PolicyTable from './PolicyTable';
import { FileText, TrendingUp, AlertCircle, CheckCircle, Calendar, Info } from 'lucide-react';

export default function Dashboard() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('');

  useEffect(() => {
    fetchPolicies();
  }, [selectedDept, selectedPriority]);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedDept) params.append('dept', selectedDept);
      if (selectedPriority) params.append('priority', selectedPriority);

      const response = await fetch(`/api/policies?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch policies');
      }
      const result = await response.json();
      setPolicies(result.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading policies...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-red-800 font-semibold mb-2">Error Loading Data</h3>
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchPolicies}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const stats = calculateDashboardStats(policies);
  const deptData = groupByDepartment(policies);
  
  const priorityData = policies.reduce((acc, policy) => {
    const priority = policy.priority_category.replace(/^\d+-/, '');
    const existing = acc.find((item) => item.name === priority);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: priority, value: 1 });
    }
    return acc;
  }, [] as Array<{ name: string; value: number }>);

  const departments = ['', ...Array.from(new Set(policies.map((p) => p.dept)))];
  const priorities = ['', '1-Critical', '2-High', '3-Medium', '4-Low', '5-Minimal'];

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Department
              </label>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Departments</option>
                {departments.slice(1).map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Priority
              </label>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Priorities</option>
                {priorities.slice(1).map((priority) => (
                  <option key={priority} value={priority}>
                    {priority.replace(/^\d+-/, '')}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="flex justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 w-full max-w-4xl">
          <StatCard
            title="Total Policies"
            value={stats.totalPolicies}
            icon={FileText}
          />
          <StatCard
            title={
              <div className="flex items-center">
                <span>Avg Relevance Score</span>
                <div className="relative group ml-1">
                  <Info className="w-4 h-4 text-gray-400 cursor-help" />
                  <div className="absolute z-10 hidden group-hover:block w-64 p-2 text-sm text-gray-700 bg-white border border-gray-200 rounded shadow-lg">
                    <p className="font-semibold mb-1">Relevance Score (0-10):</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>9-10: Critical AI policy documents</li>
                      <li>7-8: Significant AI policy content</li>
                      <li>5-6: Moderate AI relevance</li>
                      <li>3-4: Limited AI content</li>
                      <li>0-2: Minimal or no AI relevance</li>
                    </ul>
                  </div>
                </div>
              </div>
            }
            value={`${stats.avgRelevanceScore}/10`}
            icon={TrendingUp}
          />
          <StatCard
            title="High Priority"
            value={stats.highPriorityCount}
            icon={AlertCircle}
          />
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <DepartmentChart data={deptData} />
          <PriorityChart data={priorityData} />
        </div>

        {/* Policy Table */}
        <PolicyTable policies={policies} />
      </main>
    </div>
  );
}
