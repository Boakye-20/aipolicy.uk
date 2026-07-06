'use client';

import { Policy } from '@/types/policy';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PolicyTypeBadge } from '@/components/Badges';
import { Book, Copy, ExternalLink, Calendar, Landmark } from 'lucide-react';
import { format } from 'date-fns';

interface ProfessionalPolicyCardProps {
  policy: Policy;
}

const ProfessionalPolicyCard = ({ policy }: ProfessionalPolicyCardProps) => {
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    // Add a toast notification here in a real app
  };

  return (
    <Card className="flex flex-col h-full bg-white shadow-sm hover:shadow-md transition-shadow duration-200 border border-slate-200/80">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-x-2 text-sm text-slate-500 mb-2">
            <Landmark className="w-4 h-4" />
            <span className="font-semibold">{policy.dept}</span>
          </div>
          <PolicyTypeBadge type={policy.policy_type} />
        </div>
        <CardTitle className="text-lg font-semibold text-slate-800 leading-snug">
          <a href={policy.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
            {policy.title}
          </a>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-slate-600 text-sm line-clamp-3">{policy.ai_summary}</p>
        
        <div className="mt-4 space-y-2 text-xs text-slate-500">
          <div className="flex items-center gap-x-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>Published: {format(new Date(policy.published_date), 'dd MMM yyyy')}</span>
          </div>
          {policy.citation && (
            <div className="flex items-center gap-x-2">
              <Book className="w-3.5 h-3.5" />
              <span className="font-mono">{policy.citation}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center bg-slate-50/70 p-4">
        <div className='flex gap-x-2'>
            <Button variant="outline" size="sm" onClick={() => window.open(policy.url, '_blank')}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Source
            </Button>
            {policy.citation && (
            <Button variant="outline" size="sm" onClick={() => handleCopy(policy.citation!)}>
                <Copy className="w-4 h-4 mr-2" />
                Citation
            </Button>
            )}
        </div>
        {policy.sector_focus && (
          <span className="text-xs text-slate-500">{policy.sector_focus}</span>
        )}
      </CardFooter>
    </Card>
  );
};

export default ProfessionalPolicyCard;
