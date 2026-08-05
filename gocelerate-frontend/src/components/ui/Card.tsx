import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddings = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-10',
};

export default function Card({ children, className = '', padding = 'md' }: CardProps) {
  return (
    <div
      className={`
        bg-surface border border-border rounded-xl shadow-card
        ${paddings[padding]} ${className}
      `}
    >
      {children}
    </div>
  );
}
