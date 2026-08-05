import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DataPoint { name: string; value: number; }
interface MilestoneDonutProps { data: DataPoint[]; loading?: boolean; }

const COLORS = ['#E5E7EB', '#06B6D4', '#22C55E'];

export default function MilestoneDonut({ data, loading }: MilestoneDonutProps) {
  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="w-40 h-40 rounded-full bg-ground animate-pulse" />
      </div>
    );
  }

  const hasData = data.some((d) => d.value > 0);
  if (!hasData) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-muted gap-2">
        <i className="ri-pie-chart-line text-4xl" />
        <p className="text-sm">No milestones yet</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={256}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(val: number) => [val, '']}
          contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
