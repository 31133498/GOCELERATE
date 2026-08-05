import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts';
import { formatCompactCurrency } from '../../utils/formatCurrency';

interface DataPoint {
  name: string;
  budget: number;
  expenses: number;
}

interface BudgetBarChartProps {
  data: DataPoint[];
  loading?: boolean;
  label1?: string;
  label2?: string;
  color1?: string;
  color2?: string;
}

export default function BudgetBarChart({ data, loading, label1 = 'Budget', label2 = 'Expenses', color1 = '#1B1D2F', color2 = '#06B6D4' }: BudgetBarChartProps) {
  if (loading) {
    return (
      <div className="h-64 flex items-end gap-3 px-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex-1 flex gap-1 items-end">
            <div className="flex-1 bg-ground animate-pulse rounded-t" style={{ height: `${40 + i * 20}%` }} />
            <div className="flex-1 bg-ground animate-pulse rounded-t" style={{ height: `${20 + i * 15}%` }} />
          </div>
        ))}
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-muted gap-2">
        <i className="ri-bar-chart-line text-4xl" />
        <p className="text-sm">No project data yet</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={256}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: '#6B7280' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatCompactCurrency}
          tick={{ fontSize: 11, fill: '#6B7280' }}
          axisLine={false}
          tickLine={false}
          width={56}
        />
        <Tooltip
          formatter={(val) => formatCompactCurrency(val as number)}
          contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }}
        />
        <Legend
          iconType="square"
          iconSize={10}
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
        />
        <Bar dataKey="budget"   name={label1} fill={color1} radius={[4, 4, 0, 0]} />
        <Bar dataKey="expenses" name={label2} fill={color2} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
