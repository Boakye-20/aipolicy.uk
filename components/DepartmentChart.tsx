'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DepartmentChartProps {
  data: Array<{
    dept: string;
    count: number;
    avgScore: number;
  }>;
}

export default function DepartmentChart({ data }: DepartmentChartProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents by Department</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="dept" angle={-45} textAnchor="end" height={100} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#0ea5e9" name="Document Count" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
