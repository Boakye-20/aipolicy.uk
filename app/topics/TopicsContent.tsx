'use client';

import { useState } from 'react';
import { Policy } from '@/types/policy';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Tag, TrendingUp, Search, ExternalLink } from 'lucide-react';

export default function TopicsContent({ initialPolicies }: { initialPolicies: Policy[] }) {
  const policies = initialPolicies;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Extract all topics and count frequencies
  const getTopicFrequencies = () => {
    const topicCount: Record<string, number> = {};
    policies.forEach(policy => {
      if (policy.key_topics) {
        const topics = policy.key_topics.split(',').map(t => t.trim().toLowerCase());
        topics.forEach(topic => {
          topicCount[topic] = (topicCount[topic] || 0) + 1;
        });
      }
    });
    return Object.entries(topicCount)
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count);
  };

  // Topic co-occurrence (topics that appear together)
  const getTopicCooccurrence = (mainTopic: string) => {
    const cooccurrence: Record<string, number> = {};
    policies.forEach(policy => {
      if (policy.key_topics && policy.key_topics.toLowerCase().includes(mainTopic.toLowerCase())) {
        const topics = policy.key_topics.split(',').map(t => t.trim().toLowerCase());
        topics.forEach(topic => {
          if (topic !== mainTopic.toLowerCase()) {
            cooccurrence[topic] = (cooccurrence[topic] || 0) + 1;
          }
        });
      }
    });
    return Object.entries(cooccurrence)
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  };

  // Topics by department
  const getTopicsByDepartment = () => {
    const deptTopics: Record<string, Record<string, number>> = {};
    policies.forEach(policy => {
      const dept = policy.dept;
      if (!deptTopics[dept]) deptTopics[dept] = {};
      if (policy.key_topics) {
        const topics = policy.key_topics.split(',').map(t => t.trim().toLowerCase());
        topics.forEach(topic => {
          deptTopics[dept][topic] = (deptTopics[dept][topic] || 0) + 1;
        });
      }
    });
    return Object.entries(deptTopics)
      .filter(([, topics]) => Object.keys(topics).length > 0)
      .map(([dept, topics]) => {
        const topTopic = Object.entries(topics).sort((a, b) => b[1] - a[1])[0];
        return { dept, topTopic: topTopic[0], count: topTopic[1], totalTopics: Object.keys(topics).length };
      });
  };

  // Topic trends over time
  const getTopicTrends = (topic: string) => {
    const timeline: Record<string, number> = {};
    policies.forEach(policy => {
      if (policy.key_topics && policy.key_topics.toLowerCase().includes(topic.toLowerCase())) {
        const period = policy.year_month;
        timeline[period] = (timeline[period] || 0) + 1;
      }
    });
    return Object.entries(timeline)
      .map(([period, count]) => ({ period, count }))
      .sort((a, b) => a.period.localeCompare(b.period))
      .slice(-12);
  };

  const getFilteredTopics = () => {
    const allTopics = getTopicFrequencies();
    if (!searchTerm) return allTopics.slice(0, 50);
    return allTopics.filter(t => t.topic.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 50);
  };

  const getTopicPolicies = (topic: string) => {
    if (!topic) return [];
    const needle = topic.toLowerCase();
    return policies.filter(p => {
      if (!p.key_topics) return false;
      const topics = p.key_topics.toLowerCase().split(',').map(t => t.trim());
      return topics.includes(needle);
    });
  };

  const getCurrentTopicPolicies = () => {
    const allPolicies = selectedTopic ? getTopicPolicies(selectedTopic) : [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    return allPolicies.slice(startIndex, startIndex + itemsPerPage);
  };

  const totalTopicPages = selectedTopic ? Math.ceil(getTopicPolicies(selectedTopic).length / itemsPerPage) : 0;

  const topicFrequencies = getFilteredTopics();
  const deptTopics = getTopicsByDepartment();
  const topicTrends = selectedTopic ? getTopicTrends(selectedTopic) : [];
  const cooccurrence = selectedTopic ? getTopicCooccurrence(selectedTopic) : [];
  const topicPolicies = selectedTopic ? getTopicPolicies(selectedTopic) : [];

  return (
    <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Topic intelligence</h1>
        <p className="mt-1 text-sm text-slate-600">Explore the themes and tags across every tracked AI policy.</p>
      </div>

      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total unique topics</p>
              <p className="text-3xl font-semibold text-slate-900 mt-2 nums-tabular">{getTopicFrequencies().length}</p>
            </div>
            <Tag className="w-8 h-8 text-slate-300" />
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Most common topic</p>
              <p className="text-xl font-semibold text-slate-900 mt-2">{topicFrequencies[0]?.topic || 'N/A'}</p>
              <p className="text-sm text-slate-500">{topicFrequencies[0]?.count || 0} mentions</p>
            </div>
            <TrendingUp className="w-8 h-8 text-slate-300" />
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Avg topics per policy</p>
              <p className="text-3xl font-semibold text-slate-900 mt-2 nums-tabular">
                {policies.length > 0
                  ? (policies.reduce((sum, p) => sum + (p.topics_count || 0), 0) / policies.length).toFixed(1)
                  : '0.0'}
              </p>
            </div>
            <Tag className="w-8 h-8 text-slate-300" />
          </div>
        </div>
      </div>

      {/* Search Topics */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm p-6 mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search topics…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-md text-sm focus:ring-1 focus:ring-primary-500 focus:border-primary-500 focus:outline-none"
            />
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="rounded-md border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Clear
            </button>
          )}
        </div>

        {/* Topic Cloud/Grid */}
        <div className="flex flex-wrap gap-2">
          {topicFrequencies.slice(0, 100).map(({ topic, count }) => (
            <button
              key={topic}
              onClick={() => { setSelectedTopic(topic); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded text-sm font-medium border transition-colors ${
                selectedTopic === topic
                  ? 'bg-slate-900 border-slate-900 text-white'
                  : 'bg-white border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50'
              }`}
            >
              {topic} <span className="nums-tabular opacity-70">({count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Top Topics Chart */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm p-6 mb-8">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Top 20 topics</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={topicFrequencies.slice(0, 20)} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} />
            <YAxis dataKey="topic" type="category" width={150} tick={{ fontSize: 12, fill: '#475569' }} />
            <Tooltip cursor={{ fill: '#f1f5f9' }} />
            <Bar dataKey="count" fill="#2563eb" name="Frequency" radius={[0, 3, 3, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Department Topic Focus */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm p-6 mb-8">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Top topic by department</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {deptTopics.map(({ dept, topTopic, count, totalTopics }) => (
            <div key={dept} className="rounded-md border border-slate-300 bg-white p-4">
              <h4 className="font-semibold text-slate-900 mb-2">{dept.replace(/_/g, ' ')}</h4>
              <p className="text-sm text-slate-600 mb-1">
                Top topic: <span className="font-medium text-primary-600">{topTopic}</span>
              </p>
              <p className="text-xs text-slate-500">{count} mentions · {totalTopics} unique topics</p>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Topic Analysis */}
      {selectedTopic && (
        <div className="space-y-8">
          <div className="rounded-lg border border-primary-200 bg-primary-50 p-6">
            <h2 className="text-2xl font-bold text-primary-900 mb-2">Analysing: “{selectedTopic}”</h2>
            <p className="text-primary-700">Found in {topicPolicies.length} policies</p>
          </div>

          {/* Topic Trend */}
          {topicTrends.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-white shadow-sm p-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Topic trend over time</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topicTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="period" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip cursor={{ fill: '#f1f5f9' }} />
                  <Bar dataKey="count" fill="#2563eb" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Related Topics */}
          {cooccurrence.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-white shadow-sm p-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Related topics (co-occurrence)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={cooccurrence} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis dataKey="topic" type="category" width={150} tick={{ fontSize: 12, fill: '#475569' }} />
                  <Tooltip cursor={{ fill: '#f1f5f9' }} />
                  <Bar dataKey="count" fill="#0891b2" radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Policies with this Topic */}
          <div className="rounded-lg border border-slate-200 bg-white shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-slate-900">
                Policies mentioning “{selectedTopic}” ({getTopicPolicies(selectedTopic).length})
              </h3>
              {totalTopicPages > 1 && (
                <div className="text-sm text-slate-500">Page {currentPage} of {totalTopicPages}</div>
              )}
            </div>

            <div className="space-y-3 mb-6">
              {getCurrentTopicPolicies().map((policy, index) => (
                <a
                  key={index}
                  href={policy.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block rounded-md border border-slate-300 p-4 hover:border-slate-400 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 mb-1 group-hover:text-primary-700">
                        {policy.title}
                        <ExternalLink className="inline-block w-4 h-4 ml-1 text-slate-400 group-hover:text-primary-600" />
                      </h4>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className="px-2 py-0.5 border border-slate-300 bg-white text-slate-700 text-xs font-medium rounded">{policy.dept?.replace(/_/g, ' ')}</span>
                        <span className="px-2 py-0.5 border border-slate-300 bg-white text-slate-700 text-xs font-medium rounded">{policy.policy_type}</span>
                      </div>
                      <p className="text-sm text-slate-600 line-clamp-2">{policy.ai_summary || policy.description}</p>
                    </div>
                    <div className="text-right text-sm text-slate-500 nums-tabular">
                      {policy.published_date ? new Date(policy.published_date).getFullYear() : 'N/A'}
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {/* Pagination */}
            {totalTopicPages > 1 && (
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-200">
                <div className="text-sm text-slate-600">
                  Showing {Math.min((currentPage - 1) * itemsPerPage + 1, getTopicPolicies(selectedTopic).length)} to{' '}
                  {Math.min(currentPage * itemsPerPage, getTopicPolicies(selectedTopic).length)} of{' '}
                  {getTopicPolicies(selectedTopic).length} policies
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalTopicPages))}
                    disabled={currentPage === totalTopicPages}
                    className="px-3 py-1.5 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
