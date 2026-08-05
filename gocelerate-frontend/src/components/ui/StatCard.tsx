import Card from './Card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  iconColor?: string;
  loading?: boolean;
}

export default function StatCard({ title, value, icon, iconColor = 'text-accent', loading }: StatCardProps) {
  if (loading) {
    return (
      <Card className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-ground animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-ground rounded animate-pulse w-2/3" />
          <div className="h-6 bg-ground rounded animate-pulse w-1/2" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl bg-ground flex items-center justify-center ${iconColor}`}>
        <i className={`${icon} text-2xl`} />
      </div>
      <div>
        <p className="text-sm text-muted font-medium">{title}</p>
        <p className="text-2xl font-bold text-ink mt-0.5 tabular-nums">{value}</p>
      </div>
    </Card>
  );
}
