import { useEffect, useState, type FormEvent } from 'react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import StatCard from '../components/ui/StatCard';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { getExpenses, logExpense } from '../api/expenses';
import { getProjects } from '../api/projects';
import { getMilestonesByProject } from '../api/milestones';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import type { Expense, Project, Milestone } from '../types';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['All', 'TRAVEL', 'EQUIPMENT', 'PERSONNEL', 'OTHER'];
const EXPENSE_CATEGORIES = ['TRAVEL', 'EQUIPMENT', 'PERSONNEL', 'OTHER'];

export default function Expenses() {
  const { user } = useAuth();
  const isImplementer = user?.role === 'IMPLEMENTER';

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading]   = useState(true);
  const [category, setCategory] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo]     = useState('');
  const [toast, setToast]       = useState('');

  // Log expense modal state
  const [showModal, setShowModal]       = useState(false);
  const [projects, setProjects]         = useState<Project[]>([]);
  const [milestones, setMilestones]     = useState<Milestone[]>([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedMilestone, setSelectedMilestone] = useState('');
  const [eDesc, setEDesc]               = useState('');
  const [eAmount, setEAmount]           = useState('');
  const [eCategory, setECategory]       = useState('OTHER');
  const [eDate, setEDate]               = useState('');
  const [eErrors, setEErrors]           = useState<Record<string, string>>({});
  const [eLoading, setELoading]         = useState(false);
  const [loadingMilestones, setLoadingMilestones] = useState(false);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

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

  // Load projects when modal opens (implementer only)
  function openModal() {
    setEDesc(''); setEAmount(''); setECategory('OTHER');
    setEDate(new Date().toISOString().split('T')[0]);
    setEErrors({}); setMilestones([]); setSelectedMilestone('');
    setShowModal(true);

    getProjects().then(({ data }) => {
      setProjects(data);
      if (data.length > 0) {
        setSelectedProject(String(data[0].id));
        loadMilestones(data[0].id);
      }
    }).catch(() => {});
  }

  function loadMilestones(projectId: number) {
    setLoadingMilestones(true);
    setSelectedMilestone('');
    getMilestonesByProject(projectId)
      .then(({ data }) => {
        setMilestones(data);
        if (data.length > 0) setSelectedMilestone(String(data[0].id));
      })
      .catch(() => setMilestones([]))
      .finally(() => setLoadingMilestones(false));
  }

  function handleProjectChange(projectId: string) {
    setSelectedProject(projectId);
    loadMilestones(Number(projectId));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!selectedProject)  e.project   = 'Select a project';
    if (!selectedMilestone) e.milestone = 'Select a milestone';
    if (!eDesc.trim())     e.desc      = 'Description is required';
    if (!eAmount || isNaN(Number(eAmount)) || Number(eAmount) <= 0)
      e.amount = 'Enter a valid amount';
    if (!eDate) e.date = 'Date is required';
    setEErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setELoading(true);
    try {
      await logExpense(Number(selectedMilestone), {
        description: eDesc,
        amount: Number(eAmount),
        category: eCategory,
        date: eDate,
      });
      setShowModal(false);
      load();
      showToast('Expense logged!');
    } catch {
      showToast('Failed to log expense.');
    } finally {
      setELoading(false);
    }
  }

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
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-sidebar text-white px-5 py-3 rounded-full text-sm font-medium shadow-elevated z-50">
          {toast}
        </div>
      )}

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

      {/* Filters + Log button */}
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

          {/* Log Expense button — implementers only */}
          {isImplementer && (
            <div className="sm:ml-auto">
              <Button icon="ri-add-line" onClick={openModal}>
                Log Expense
              </Button>
            </div>
          )}
        </div>

        <Table
          columns={columns}
          data={expenses}
          loading={loading}
          emptyIcon="ri-receipt-line"
          emptyMessage="No expenses logged yet"
        />
      </Card>

      {/* Log Expense Modal */}
      {isImplementer && (
        <Modal open={showModal} onClose={() => setShowModal(false)} title="Log Expense">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            {/* Project selector */}
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">Project</label>
              {projects.length === 0 ? (
                <p className="text-sm text-muted py-2">No projects yet. <Link to="/projects/new" className="text-accent hover:underline">Create one first.</Link></p>
              ) : (
                <select
                  value={selectedProject}
                  onChange={(e) => handleProjectChange(e.target.value)}
                  className={`w-full rounded-lg border px-4 py-3 text-sm text-ink bg-surface focus:outline-none focus:border-sidebar
                    ${eErrors.project ? 'border-danger' : 'border-border'}`}
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              )}
              {eErrors.project && <p className="text-xs text-danger mt-1">{eErrors.project}</p>}
            </div>

            {/* Milestone selector */}
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">Milestone</label>
              {loadingMilestones ? (
                <div className="h-11 bg-ground rounded-lg animate-pulse" />
              ) : milestones.length === 0 ? (
                <p className="text-sm text-muted py-2">No milestones in this project yet.</p>
              ) : (
                <select
                  value={selectedMilestone}
                  onChange={(e) => setSelectedMilestone(e.target.value)}
                  className={`w-full rounded-lg border px-4 py-3 text-sm text-ink bg-surface focus:outline-none focus:border-sidebar
                    ${eErrors.milestone ? 'border-danger' : 'border-border'}`}
                >
                  {milestones.map((m) => (
                    <option key={m.id} value={m.id}>{m.title}</option>
                  ))}
                </select>
              )}
              {eErrors.milestone && <p className="text-xs text-danger mt-1">{eErrors.milestone}</p>}
            </div>

            <Input
              label="Description"
              value={eDesc}
              onChange={(e) => setEDesc(e.target.value)}
              error={eErrors.desc}
              placeholder="What was this expense for?"
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Amount (₦)"
                type="number"
                min="0"
                step="0.01"
                value={eAmount}
                onChange={(e) => setEAmount(e.target.value)}
                error={eErrors.amount}
                prefixIcon="ri-money-dollar-circle-line"
                placeholder="0.00"
              />
              <div>
                <label className="block text-sm font-semibold text-ink mb-1.5">Category</label>
                <select
                  value={eCategory}
                  onChange={(e) => setECategory(e.target.value)}
                  className="w-full rounded-lg border border-border px-4 py-3 text-sm text-ink bg-surface focus:outline-none focus:border-sidebar"
                >
                  {EXPENSE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>
                  ))}
                </select>
              </div>
            </div>

            <Input
              label="Date"
              type="date"
              value={eDate}
              onChange={(e) => setEDate(e.target.value)}
              error={eErrors.date}
            />

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                loading={eLoading}
                disabled={milestones.length === 0 || projects.length === 0}
              >
                Log Expense
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
