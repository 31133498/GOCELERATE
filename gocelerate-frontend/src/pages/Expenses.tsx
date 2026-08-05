import { useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import StatCard from '../components/ui/StatCard';
import Table from '../components/ui/Table';
import { getExpenses } from '../api/expenses';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import type { Expense } from '../types';
import { Link } from 'react-router-dom';

const CATEGORIES = ['All', 'TRAVEL', 'EQUIPMENT', 'PERSONNEL', 'OTHER'];

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading]   = useState(true);
  const [category, setCategory] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo]     = useState('');

  function load() {
    setLoading(true);
    getExpenses({
      category: category === 'All' ? undefined : category,
      from: dateFrom || undefined,
      to: dateTo || undefined,
    })
      .then(({ data }) => setExpenses(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [category, dateFrom, dateTo]);

  const totalThisMonth = expenses
    .filter((e) => new Date(e.date).getMonth() === new Date().getMonth())
    .reduce((s, e) => s + e.amount, 0);

  const largest = expenses.reduce((max, e) => (e.amount > max ? e.amount : max), 0);

  const columns = [
    {
      key: 'description', label: 'Description',
      render: (e: Expense) => <span className="font-medium text-ink">{e.description}</span>,
    },
    {
      key: 'category', label: 'Category',
      render: (e: Expense) => <Badge variant={e.category} />,
    },
    {
      key: 'amount', label: 'Amount',
      render: (e: Expense) => (
        <span className="font-bold text-ink tabular-nums">{formatCurrency(e.amount)}</span>
      ),
    },
    {
      key: 'milestone', label: 'Milestone',
      render: (e: Expense) => (
        <span className="text-sm text-muted">{e.milestoneTitle ?? `#${e.milestoneId}`}</span>
      ),
    },
    {
      key: 'project', label: 'Project',
      render: (e: Expense) => (
        e.projectId
          ? <Link to={`/projects/${e.projectId}`} className="text-accent text-sm hover:underline">
              {e.projectTitle ?? `#${e.projectId}`}
            </Link>
          : <span className="text-muted text-sm">—</span>
      ),
    },
    {
      key: 'date', label: 'Date',
      render: (e: Expense) => (
        <span className="text-sm text-ink-secondary">{formatDate(e.date)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-5">
        <StatCard
          title="Total This Month"
          value={formatCurrency(totalThisMonth)}
          icon="ri-money-dollar-circle-line"
          iconColor="text-accent"
          loading={loading}
        />
        <StatCard
          title="Largest Expense"
          value={formatCurrency(largest)}
          icon="ri-arrow-up-circle-line"
          iconColor="text-danger"
          loading={loading}
        />
        <StatCard
          title="Total Entries"
          value={expenses.length}
          icon="ri-file-list-3-line"
          iconColor="text-sidebar"
          loading={loading}
        />
      </div>

      {/* Filters */}
      <Card padding="none">
        <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 px-4 sm:px-6 py-4 border-b border-border">
          {/* Category */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <label className="text-sm text-muted whitespace-nowrap">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="text-sm border border-border rounded-lg px-3 py-2 bg-surface text-ink focus:outline-none focus:border-sidebar"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c === 'All' ? 'All Categories' : c.charAt(0) + c.slice(1).toLowerCase()}</option>
              ))}
            </select>
          </div>

          {/* Date range */}
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-sm text-muted">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="text-sm border border-border rounded-lg px-3 py-2 bg-surface text-ink focus:outline-none focus:border-sidebar"
            />
            <label className="text-sm text-muted">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="text-sm border border-border rounded-lg px-3 py-2 bg-surface text-ink focus:outline-none focus:border-sidebar"
            />
            {(dateFrom || dateTo || category !== 'All') && (
              <button
                onClick={() => { setCategory('All'); setDateFrom(''); setDateTo(''); }}
                className="text-sm text-muted hover:text-ink underline"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <Table
          columns={columns}
          data={expenses}
          loading={loading}
          emptyIcon="ri-receipt-line"
          emptyMessage="No expenses logged yet"
        />
      </Card>
    </div>
  );
}
