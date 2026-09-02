import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sidebar:       '#1B1D2F',
        ink:           '#111827',
        'ink-secondary': '#374151',
        muted:         '#6B7280',
        dim:           '#9CA3AF',
        surface:       '#FFFFFF',
        ground:        '#F5F6FA',
        'border-color':'#E5E7EB',
        accent:        '#06B6D4',
        success:       '#22C55E',
        danger:        '#EF4444',
        'card-dark':   '#0D1117',
      },
      borderColor: {
        DEFAULT: '#E5E7EB',
        border:  '#E5E7EB',
      },
      borderRadius: {
        sm:   '4px',
        DEFAULT: '8px',
        md:   '12px',
        lg:   '16px',
        full: '999px',
      },
      boxShadow: {
        card:    '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05)',
        elevated:'0 4px 24px rgba(0,0,0,0.10)',
        modal:   '0 8px 40px rgba(0,0,0,0.14)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
