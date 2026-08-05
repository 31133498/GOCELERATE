import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../components/ui/StatCard';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';
import BudgetBarChart from '../components/charts/BudgetBarChart';
import MilestoneDonut from '../components/charts/MilestoneDonut';
import { getDashboardStats, getFunderDashboardStats } from '../api/projects';
import { formatCurrency, formatCompactCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import type { DashboardStats, FunderDashboardStats } from '../types';
import { useAuth } from '../context/AuthContext';

// ─── Implementer Dashboard ────────────────────────────────────────────────────

function ImplementerDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getDashboardStats()
      .then(({ data }) => setStats(data))
      .catch(() => setError('Failed to load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-[#fef2f2] border border-[#fecaca] rounded-xl text-sm text-danger">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
        <StatCard
          title="Total Projects"
          value={stats?.totalProjects ?? 0}
          icon="ri-folder-line"
          iconColor="text-accent"
          loading={loading}
        />
        <StatCard
          title="Active Projects"
          value={stats?.activeProjects ?? 0}
          icon="ri-flag-line"
          iconColor="text-success"
          loading={loading}
        />
        <StatCard
          title="Total Budget"
          value={stats ? formatCurrency(stats.totalBudget) : '₦0'}
          icon="ri-money-dollar-circle-line"
          iconColor="text-sidebar"
          loading={loading}
        />
        <StatCard
          title="Milestones Completed"
          value={stats?.milestonesCompleted ?? 0}
          icon="ri-checkbox-circle-line"
          iconColor="text-accent"
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-5">
        <Card className="lg:col-span-3">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-ink">Budget vs Expenses</h2>
          </div>
          <BudgetBarChart data={stats?.budgetVsExpenses ?? []} loading={loading} />
        </Card>
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-ink">Milestone Status</h2>
          </div>
          <MilestoneDonut data={stats?.milestoneStatusBreakdown ?? []} loading={loading} />
        </Card>
      </div>

      <Card padding="none">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-ink">Recent Projects</h2>
          <Link to="/projects" className="text-sm text-accent font-semibold hover:underline">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[540px]">
            <thead>
              <tr className="border-b border-border">
                {['Project Name', 'Category', 'Status', 'Budget', 'Progress', 'Actions'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 bg-ground rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                : (stats?.recentProjects ?? []).length === 0
                ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <i className="ri-folder-open-line text-4xl text-muted block mb-3" />
                      <p className="text-muted text-sm">No projects yet</p>
                    </td>
                  </tr>
                )
                : stats!.recentProjects.map((p) => {
                    const pct = p.targetBudget > 0 ? (p.totalSpent / p.targetBudget) * 100 : 0;
                    return (
                      <tr key={p.id} className="border-b border-border last:border-0 hover:bg-ground/40 transition-colors">
                        <td className="px-6 py-4 font-semibold text-ink">{p.title}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-ground text-ink-secondary">
                            {p.category}
                          </span>
                        </td>
                        <td className="px-6 py-4"><Badge variant={p.status} /></td>
                        <td className="px-6 py-4 tabular-nums font-medium">{formatCurrency(p.targetBudget)}</td>
                        <td className="px-6 py-4 w-36">
                          <ProgressBar value={pct} showLabel />
                        </td>
                        <td className="px-6 py-4">
                          <Link to={`/projects/${p.id}`} className="text-accent text-sm font-semibold hover:underline">
                            View →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── Funder Dashboard ─────────────────────────────────────────────────────────

function FunderDashboard() {
  const [stats, setStats] = useState<FunderDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getFunderDashboardStats()
      .then(({ data }) => setStats(data))
      .catch(() => setError('Failed to load portfolio data.'))
      .finally(() => setLoading(false));
  }, []);

  const pledgeChartData = (stats?.portfolio ?? []).map((p) => ({
    name: p.title.length > 18 ? p.title.slice(0, 18) + '…' : p.title,
    budget: p.myPledge,
    expenses: p.totalSpent,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">My Portfolio</h1>
        <p className="text-sm text-muted mt-0.5">Track your pledges and the impact of your funding</p>
      </div>

      {error && (
        <div className="p-4 bg-[#fef2f2] border border-[#fecaca] rounded-xl text-sm text-danger">
          {error}
        </div>
      )}

      {/* Hero stat strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
        <StatCard
          title="Total Pledged"
          value={stats ? formatCurrency(stats.totalPledged) : '₦0'}
          icon="ri-hand-coin-line"
          iconColor="text-accent"
          loading={loading}
        />
        <StatCard
          title="Projects Funded"
          value={stats?.projectsFunded ?? 0}
          icon="ri-folder-heart-line"
          iconColor="text-success"
          loading={loading}
        />
        <StatCard
          title="Milestones Completed"
          value={stats?.milestonesCompleted ?? 0}
          icon="ri-checkbox-circle-line"
          iconColor="text-sidebar"
          loading={loading}
        />
        <StatCard
          title="Avg. Completion"
          value={stats ? `${Math.round(stats.avgCompletionRate)}%` : '0%'}
          icon="ri-pie-chart-line"
          iconColor="text-accent"
          loading={loading}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-5">
        <Card className="lg:col-span-3">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-ink">My Pledge vs Amount Spent</h2>
            <p className="text-xs text-muted mt-0.5">How your money is being used per project</p>
          </div>
          <BudgetBarChart
            data={pledgeChartData}
            loading={loading}
            label1="My Pledge"
            label2="Spent"
            color1="#1B1D2F"
            color2="#06B6D4"
          />
        </Card>
        <Card className="lg:col-span-2">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-ink">Milestone Status</h2>
            <p className="text-xs text-muted mt-0.5">Across your funded projects</p>
          </div>
          <MilestoneDonut data={stats?.milestoneStatusBreakdown ?? []} loading={loading} />
        </Card>
      </div>

      {/* Portfolio table */}
      <Card padding="none">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="text-base font-semibold text-ink">Funded Projects</h2>
            <p className="text-xs text-muted mt-0.5">Your active portfolio</p>
          </div>
          <Link to="/projects" className="text-sm text-accent font-semibold hover:underline">
            Browse all projects
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-border">
                {['Project', 'Status', 'My Pledge', 'Project Budget', 'Spent', 'Milestones', 'Actions'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 bg-ground rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                : (stats?.portfolio ?? []).length === 0
                ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center">
                      <i className="ri-folder-heart-line text-5xl text-muted block mb-3" />
                      <p className="text-muted text-sm font-medium">You haven't funded any projects yet</p>
                      <p className="text-muted text-xs mt-1">Browse projects and make your first pledge</p>
                      <Link
                        to="/projects"
                        className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-accent text-white text-sm font-semibold rounded-lg hover:bg-accent/90 transition-colors"
                      >
                        <i className="ri-search-line" />
                        Discover Projects
                      </Link>
                    </td>
                  </tr>
                )
                : stats!.portfolio.map((p) => {
                    const milestonePct = p.milestonesCount > 0
                      ? (p.milestonesCompleted / p.milestonesCount) * 100
                      : 0;
                    const spendPct = p.myPledge > 0
                      ? Math.min((p.totalSpent / p.myPledge) * 100, 100)
                      : 0;

                    return (
                      <tr key={p.id} className="border-b border-border last:border-0 hover:bg-ground/40 transition-colors">

                        {/* Project name + thumbnail */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {p.imageUrl ? (
                              <img
                                src={p.imageUrl}
                                alt={p.title}
                                className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent/20 to-sidebar/20 flex items-center justify-center flex-shrink-0">
                                <i className="ri-folder-line text-accent text-sm" />
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-ink leading-tight">{p.title}</p>
                              <p className="text-xs text-muted mt-0.5">{p.category} · {formatDate(p.createdAt)}</p>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4"><Badge variant={p.status} /></td>

                        {/* My Pledge — primary metric, visually emphasized */}
                        <td className="px-6 py-4">
                          <p className="font-bold text-ink tabular-nums">{formatCurrency(p.myPledge)}</p>
                          <div className="mt-1.5 w-24">
                            <ProgressBar value={spendPct} size="sm" />
                          </div>
                          <p className="text-[10px] text-muted mt-0.5">
                            {formatCompactCurrency(p.totalSpent)} used ({Math.round(spendPct)}%)
                          </p>
                        </td>

                        {/* Project budget — dimmed secondary context */}
                        <td className="px-6 py-4 tabular-nums text-muted">
                          {formatCurrency(p.targetBudget)}
                        </td>

                        {/* Total spent from the project */}
                        <td className="px-6 py-4 tabular-nums font-medium text-ink">
                          {formatCurrency(p.totalSpent)}
                        </td>

                        {/* Milestone progress */}
                        <td className="px-6 py-4 w-40">
                          <ProgressBar value={milestonePct} showLabel />
                          <p className="text-[10px] text-muted mt-1">
                            {p.milestonesCompleted}/{p.milestonesCount} done
                          </p>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <Link
                            to={`/projects/${p.id}`}
                            className="text-accent text-sm font-semibold hover:underline whitespace-nowrap"
                          >
                            View →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── Role-conditional entry point ─────────────────────────────────────────────

export default function Dashboard() {
  const { user } = useAuth();
  return user?.role === 'FUNDER' ? <FunderDashboard /> : <ImplementerDashboard />;
}
