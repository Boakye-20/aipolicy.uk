// TypeScript types for UK AI Policy data

export interface Policy {
  dept: string;
  dept_group: string;
  title: string;
  published_date: string;
  year: number;
  month: number;
  month_name: string;
  quarter: number;
  quarter_label: string;
  year_month: string;
  relevance_score: number;
  priority_category: string;
  requires_action: string;
  policy_type: string;
  business_impact: string;
  sector_focus: string;
  ai_application: string;
  stage: string;
  audience: string;
  ai_summary: string;
  primary_topic: string;
  key_topics: string;
  recency: string;
  days_since_published: number;
  summary_word_count: number;
  topics_count: number;
  description: string;
  url: string;
  format: string;
  display_type: string;
  collection_date: string;
  // "Show your work" trust fields, produced by the strict extractor + quote gate.
  core_obligations: string[];
  source_quote: string | null;
  status: string;

  // Optional fields for professional redesign
  citation?: string;
  regulator?: string;
  consultationCloseDate?: string;
  legislativeStage?: string;
  sourceFamily?: string;
  nationApplicability?: string;
  impact?: 'High' | 'Medium' | 'Low';
}

export interface FilterOptions {
  departments: string[];
  policyTypes: string[];
  priorityCategories: string[];
  sectors: string[];
  aiApplications: string[];
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  minRelevanceScore: number;
}

export interface DashboardStats {
  totalPolicies: number;
  avgRelevanceScore: number;
  highPriorityCount: number;
  recentPoliciesCount: number;
}
