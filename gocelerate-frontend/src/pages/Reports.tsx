import { useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ProgressBar from '../components/ui/ProgressBar';
import MilestoneDonut from '../components/charts/MilestoneDonut';
import { getProjects } from '../api/projects';
import { getReport } from '../api/reports';
import { formatCurrency } from '../utils/formatCurrency';
import type { Project, Report } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const CATEGORY_COLORS: Record<string, string> = {
  TRAVEL: '#06B6D4',
  EQUIPMENT: '#1B1D2F',
  PERSONNEL: '#22C55E',
  OTHER: '#9CA3AF',
};

export default function Reports() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedId, setSelectedId] = useState<number | ''>('');
  const [report, setReport]         = useState<Report | null>(null);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingReport, setLoadingReport]     = useState(false);

  useEffect(() => {
    getProjects()
      .then(({ data }) => {
        setProjects(data);
        if (data.length > 0) setSelectedId(data[0].id);
      })
      .catch(() => {})
      .finally(() => setLoadingProjects(false));
  }, []);

  useEffect(() => {
    if (!selectedId) { setReport(null); return; }
    setLoadingReport(true);
    getReport(Number(selectedId))
      .then(({ data }) => setReport(data))
      .catch(() => setReport(null))
      .finally(() => setLoadingReport(false));
  }, [selectedId]);

  const pct = report && report.totalBudget > 0
    ? (report.totalSpent / report.totalBudget) * 100
    : 0;

  const donutData = report?.milestoneStatus.map(({ status, count }) => ({
    name: status === 'NOT_STARTED' ? 'Not Started'
        : status === 'IN_PROGRESS' ? 'In Progress'
        : 'Completed',
    value: count,
  })) ?? [];

  return (
    <div className="space-y-6">
      {/* Project selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-ink">Project</label>
          {loadingProjects ? (
            <div className="w-64 h-10 bg-surface border border-border rounded-lg animate-pulse" />
          ) : (
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(Number(e.target.value))}
              className="w-full sm:w-72 text-sm border border-border rounded-lg px-4 py-2.5 bg-surface text-ink focus:outline-none focus:border-sidebar"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          )}
        </div>
        <Button
          variant="outline"
          icon="ri-download-line"
          onClick={() => window.print()}
          disabled={!report}
        >
          Export PDF
        </Button>
      </div>

      {!selectedId && !loadingProjects && (
        <div className="py-24 text-center">
          <i className="ri-bar-chart-line text-5xl text-muted block mb-3" />
          <p className="text-muted">Select a project to view its report.</p>
        </div>
      )}

      {loadingReport && (
        <div className="space-y-4 animate-pulse">
          <div className="h-36 bg-surface border border-border rounded-xl" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
            <div className="h-72 bg-surface border border-border rounded-xl" />
            <div className="h-72 bg-surface border border-border rounded-xl" />
          </div>
        </div>
      )}

      {report && !loadingReport && (
        <>
          {/* Budget summary */}
          <Card>
            <h3 className="font-semibold text-ink mb-5">Budget Overview</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6">
              <div>
                <p className="text-xs text-muted mb-1">Total Budget</p>
                <p className="text-2xl font-bold text-ink tabular-nums">{formatCurrency(report.totalBudget)}</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">Total Spent</p>
                <p className="text-2xl font-bold text-ink tabular-nums">{formatCurrency(report.totalSpent)}</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">Remaining</p>
                <p className={`text-2xl font-bold tabular-nums ${report.remainingBudget < 0 ? 'text-danger' : 'text-success'}`}>
                  {formatCurrency(report.remainingBudget)}
                </p>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted">Budget utilisation</span>
                <span className="font-semibold">{Math.round(pct)}%</span>
              </div>
              <ProgressBar
                value={pct}
                size="lg"
                color={pct > 90 ? 'bg-danger' : pct > 70 ? 'bg-[#f59e0b]' : 'bg-sidebar'}
              />
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
            {/* Milestone status donut */}
            <Card>
              <h3 className="font-semibold text-ink mb-4">Milestone Status</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <MilestoneDonut data={donutData} />
                </div>
                <div className="space-y-2">
                  {donutData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-2 text-sm">
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: ['#E5E7EB', '#06B6D4', '#22C55E'][i] }}
                      />
                      <span className="text-muted">{d.name}</span>
                      <span className="font-bold text-ink ml-1">{d.value}</span>
                    </div>
                  ))}
                  <p className="text-xs text-muted mt-2">
                    {Math.round(report.milestoneCompletion)}% complete
                  </p>
                </div>
              </div>
            </Card>

            {/* Expenses by category */}
            <Card>
              <h3 className="font-semibold text-ink mb-4">Expenses by Category</h3>
              {report.expensesByCategory.length === 0 ? (
                <div className="py-10 text-center">
                  <i className="ri-pie-chart-line text-4xl text-muted block mb-2" />
                  <p className="text-muted text-sm">No expenses recorded.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={report.expensesByCategory}
                    layout="vertical"
                    margin={{ left: 16, right: 16, top: 4, bottom: 4 }}
                  >
                    <XAxis type="number" tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`}
                      tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="category" width={90}
                      tick={{ fontSize: 12, fill: '#374151' }} axisLine={false} tickLine={false}
                      tickFormatter={(v: string) => v.charAt(0) + v.slice(1).toLowerCase()} />
                    <Tooltip
                      formatter={(v) => [formatCurrency(v as number), 'Amount']}
                      contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }}
                    />
                    <Bar dataKey="amount" radius={[0, 4, 4, 0]} barSize={20}>
                      {report.expensesByCategory.map((entry) => (
                        <Cell
                          key={entry.category}
                          fill={CATEGORY_COLORS[entry.category] ?? '#9CA3AF'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
