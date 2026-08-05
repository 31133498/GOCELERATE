interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  showLabel?: boolean;
  className?: string;
}

const heights = { sm: 'h-1', md: 'h-2', lg: 'h-3' };

export default function ProgressBar({
  value,
  max = 100,
  size = 'sm',
  color = 'bg-sidebar',
  showLabel = false,
  className = '',
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`flex-1 bg-border rounded-full overflow-hidden ${heights[size]}`}>
        <div
          className={`${color} ${heights[size]} rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-semibold text-muted w-9 text-right tabular-nums">
          {Math.round(pct)}%
        </span>
      )}
    </div>
  );
}
