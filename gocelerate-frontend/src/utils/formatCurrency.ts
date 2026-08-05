export function formatCurrency(amount: number | null | undefined, currency = 'NGN'): string {
  const n = Number(amount);
  if (amount == null || isNaN(n)) return '₦0.00';
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

export function formatCompactCurrency(amount: number | null | undefined): string {
  const n = Number(amount);
  if (amount == null || isNaN(n)) return '₦0';
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(1)}K`;
  return formatCurrency(n);
}
