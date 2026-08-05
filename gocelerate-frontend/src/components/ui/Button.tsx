import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: string;
  children: ReactNode;
}

const variants = {
  primary: 'bg-sidebar text-white hover:bg-[#141627] active:bg-[#0e1020]',
  secondary: 'bg-accent text-white hover:bg-[#0599b3]',
  outline: 'bg-transparent border border-border text-ink hover:bg-ground',
  danger: 'bg-danger text-white hover:bg-[#dc2626]',
  ghost: 'bg-ground text-ink-secondary hover:bg-border',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-5 py-2.5 text-sm gap-2',
  lg: 'px-7 py-3 text-base gap-2',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center font-semibold rounded-full
        transition-colors duration-150 focus:outline-none focus-visible:ring-2
        focus-visible:ring-sidebar focus-visible:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
    >
      {loading ? (
        <i className="ri-loader-4-line animate-spin text-base" />
      ) : icon ? (
        <i className={`${icon} text-base`} />
      ) : null}
      {children}
    </button>
  );
}
