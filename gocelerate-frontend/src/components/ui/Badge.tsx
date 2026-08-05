type BadgeVariant = 'pending' | 'active' | 'completed' | 'not_started' | 'in_progress' |
  'travel' | 'equipment' | 'personnel' | 'other';

interface BadgeProps {
  variant: BadgeVariant | string;
  children?: string;
  className?: string;
}

const styles: Record<string, string> = {
  pending:     'bg-ground text-muted',
  not_started: 'bg-ground text-muted',
  active:      'bg-[#e0f9ff] text-accent',
  in_progress: 'bg-[#e0f9ff] text-accent',
  completed:   'bg-[#dcfce7] text-success',
  travel:      'bg-[#e0f9ff] text-accent',
  equipment:   'bg-[#e8eaf0] text-sidebar',
  personnel:   'bg-[#dcfce7] text-success',
  other:       'bg-ground text-muted',
};

const labels: Record<string, string> = {
  pending:     'Pending',
  not_started: 'Not Started',
  active:      'Active',
  in_progress: 'In Progress',
  completed:   'Completed',
  travel:      'Travel',
  equipment:   'Equipment',
  personnel:   'Personnel',
  other:       'Other',
};

export default function Badge({ variant, children, className = '' }: BadgeProps) {
  const key = variant.toLowerCase().replace(/ /g, '_');
  const style = styles[key] ?? 'bg-ground text-muted';
  const label = children ?? labels[key] ?? variant;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold ${style} ${className}`}>
      {label}
    </span>
  );
}
