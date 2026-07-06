import { Landmark } from 'lucide-react';

// dept = the exact value stored in the database (used for filtering);
// name = the display label; fullName = tooltip.
const regulators = [
  { name: 'DSIT', dept: 'DSIT', fullName: 'Department for Science, Innovation and Technology' },
  { name: 'DBT', dept: 'DBT', fullName: 'Department for Business and Trade' },
  { name: 'Cabinet Office', dept: 'Cabinet_Office', fullName: 'Cabinet Office' },
  { name: 'Home Office', dept: 'Home_Office', fullName: 'Home Office' },
  { name: 'HM Treasury', dept: 'Treasury', fullName: 'HM Treasury' },
  { name: 'DHSC', dept: 'DHSC', fullName: 'Department of Health and Social Care' },
  { name: 'DfE', dept: 'DfE', fullName: 'Department for Education' },
  { name: 'CMA', dept: 'CMA', fullName: 'Competition and Markets Authority' },
  { name: 'FCA', dept: 'FCA', fullName: 'Financial Conduct Authority' },
  { name: 'ICO', dept: 'ICO', fullName: "Information Commissioner's Office" },
];

// Non-map, UK-governance-native navigation. Each card filters the explorer by
// that body. Counts are passed in from already-fetched data (no extra query).
export default function RegulatorMatrix({ counts = {} }: { counts?: Record<string, number> }) {
  return (
    <div className="border-t border-slate-200 bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">
          Tracked regulators &amp; departments
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Coverage across key UK government and regulatory bodies. Select a body to filter the explorer.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {regulators.map((r) => {
            const count = counts[r.dept];
            return (
              <a
                key={r.dept}
                href={`/policy-explorer?dept=${encodeURIComponent(r.dept)}`}
                title={r.fullName}
                className="group flex items-center gap-3 rounded-md border border-slate-200 bg-white p-3 transition-colors hover:border-primary-300 hover:bg-primary-50"
              >
                <div className="flex h-9 w-9 flex-none items-center justify-center rounded-md bg-navy-800 text-white transition-colors group-hover:bg-primary-600">
                  <Landmark className="h-4 w-4" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-slate-900">{r.name}</div>
                  {typeof count === 'number' && (
                    <div className="text-xs text-slate-500 nums-tabular">{count} items</div>
                  )}
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
