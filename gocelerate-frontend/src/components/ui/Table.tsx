import type { ReactNode } from 'react';

interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyIcon?: string;
  emptyMessage?: string;
  rowClassName?: (row: T) => string;
}

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-ground rounded animate-pulse" />
        </td>
      ))}
    </tr>
  );
}

export default function Table<T extends { id: number }>({
  columns, data, loading, emptyIcon = 'ri-inbox-line', emptyMessage = 'No data found',
  rowClassName,
}: TableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted ${col.className ?? ''}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <SkeletonRow key={i} cols={columns.length} />
              ))
            : data.length === 0
            ? (
              <tr>
                <td colSpan={columns.length} className="py-16 text-center">
                  <i className={`${emptyIcon} text-4xl text-muted block mb-3`} />
                  <p className="text-muted text-sm">{emptyMessage}</p>
                </td>
              </tr>
            )
            : data.map((row) => (
              <tr
                key={row.id}
                className={`border-b border-border last:border-0 hover:bg-ground/50 transition-colors ${rowClassName?.(row) ?? ''}`}
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-4 py-3 text-ink-secondary ${col.className ?? ''}`}>
                    {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
