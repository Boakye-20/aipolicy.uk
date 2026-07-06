'use client';

import { Filter } from 'lucide-react';

interface FilterBarProps {
  departments: string[];
  policyTypes: string[];
  selectedDept: string;
  selectedType: string;
  onDeptChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onReset: () => void;
}

const FilterBar = ({
  departments,
  policyTypes,
  selectedDept,
  selectedType,
  onDeptChange,
  onTypeChange,
  onReset,
}: FilterBarProps) => {
  const hasActiveFilters = selectedDept || selectedType;

  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200/80 shadow-sm mb-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center text-sm font-semibold text-slate-700">
          <Filter className="w-4 h-4 mr-2" />
          <span>Filters</span>
        </div>

        <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 md:flex-grow-0 md:w-auto md:grid-cols-none md:flex md:items-center gap-4">
          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => onDeptChange(e.target.value)}
            className="w-full md:w-48 rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          {/* Policy Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => onTypeChange(e.target.value)}
            className="w-full md:w-48 rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
          >
            <option value="">All Policy Types</option>
            {policyTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-sm text-blue-600 hover:underline"
          >
            Reset Filters
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
