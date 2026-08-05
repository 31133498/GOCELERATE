import { forwardRef, useState, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  prefixIcon?: string;
  suffixIcon?: string;
  onSuffixClick?: () => void;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, prefixIcon, suffixIcon, onSuffixClick, className = '', type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-semibold text-ink">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {prefixIcon && (
            <i className={`${prefixIcon} absolute left-3.5 text-muted text-base pointer-events-none`} />
          )}
          <input
            ref={ref}
            type={inputType}
            {...props}
            className={`
              w-full rounded-lg border border-border bg-surface
              px-4 py-[11px] text-sm text-ink placeholder:text-dim
              focus:outline-none focus:border-sidebar transition-colors
              disabled:bg-ground disabled:cursor-not-allowed
              ${prefixIcon ? 'pl-10' : ''}
              ${isPassword || suffixIcon ? 'pr-10' : ''}
              ${error ? 'border-danger focus:border-danger' : ''}
              ${className}
            `}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3.5 text-muted hover:text-ink transition-colors"
            >
              <i className={showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} />
            </button>
          )}
          {suffixIcon && !isPassword && (
            <button
              type="button"
              onClick={onSuffixClick}
              className="absolute right-3.5 text-muted hover:text-ink transition-colors"
            >
              <i className={suffixIcon} />
            </button>
          )}
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
