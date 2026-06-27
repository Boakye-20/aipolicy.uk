import { Policy, DashboardStats } from '@/types/policy';

export function calculateDashboardStats(policies: Policy[]): DashboardStats {
  const totalPolicies = policies.length;
  
  const avgRelevanceScore = policies.reduce((sum, p) => sum + (p.relevance_score || 0), 0) / totalPolicies;
  
  const highPriorityCount = policies.filter(
    (p) => p.priority_category === '1-Critical' || p.priority_category === '2-High'
  ).length;
  
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  const recentPoliciesCount = policies.filter((p) => {
    const publishedDate = new Date(p.published_date);
    return publishedDate >= sixMonthsAgo;
  }).length;

  return {
    totalPolicies,
    avgRelevanceScore: Math.round(avgRelevanceScore * 10) / 10,
    highPriorityCount,
    recentPoliciesCount,
  };
}

export function groupByDepartment(policies: Policy[]) {
  const grouped = policies.reduce((acc, policy) => {
    const dept = policy.dept || 'Unknown';
    if (!acc[dept]) {
      acc[dept] = [];
    }
    acc[dept].push(policy);
    return acc;
  }, {} as Record<string, Policy[]>);

  return Object.entries(grouped).map(([dept, policies]) => ({
    dept,
    count: policies.length,
    avgScore: policies.reduce((sum, p) => sum + (p.relevance_score || 0), 0) / policies.length,
  }));
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}
