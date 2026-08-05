import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import ProgressBar from '../components/ui/ProgressBar';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { getProjects, fundProject } from '../api/projects';
import { formatCurrency } from '../utils/formatCurrency';
import { useAuth } from '../context/AuthContext';
import type { Project } from '../types';

const STATUS_FILTERS = ['All', 'ACTIVE', 'PENDING', 'COMPLETED'] as const;
type Filter = (typeof STATUS_FILTERS)[number];

export default function Projects() {
  const { user } = useAuth();
  const isFunder = user?.role === 'FUNDER';

  const [projects, setProjects]     = useState<Project[]>([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState<Filter>('All');
  const [search, setSearch]         = useState('');
  const navigate                    = useNavigate();

  // Fund modal
  const [fundTarget, setFundTarget]   = useState<Project | null>(null);
  const [fundAmount, setFundAmount]   = useState('');
  const [fundError, setFundError]     = useState('');
  const [fundLoading, setFundLoading] = useState(false);
  const [toast, setToast]             = useState('');

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  function loadProjects() {
    setLoading(true);
    getProjects(filter === 'All' ? undefined : filter)
      .then(({ data }) => setProjects(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadProjects(); }, [filter]);

  const visible = projects.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  function openFundModal(p: Project) {
    setFundTarget(p);
    setFundAmount(p.amountPledged ? String(p.amountPledged) : '');
    setFundError('');
  }

  async function handleFund(e: FormEvent) {
    e.preventDefault();
    if (!fundTarget) return;
    const amount = Number(fundAmount);
    if (!fundAmount || isNaN(amount) || amount <= 0) {
      setFundError('Enter a valid amount greater than 0');
      return;
    }
    setFundLoading(true);
    try {
      await fundProject(fundTarget.id, amount);
      setFundTarget(null);
      setFundAmount('');
      loadProjects();
      showToast(fundTarget.amountPledged ? 'Pledge updated!' : 'Project funded successfully!');
    } catch {
      showToast('Failed to submit pledge.');
    } finally {
      setFundLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-sidebar text-white px-5 py-3 rounded-full text-sm font-medium shadow-elevated z-50">
          {toast}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-1 bg-ground rounded-lg p-1 overflow-x-auto flex-shrink-0">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap
                ${filter === f ? 'bg-surface shadow-card text-ink font-semibold' : 'text-muted hover:text-ink'}`}
            >
              {f === 'All' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:ml-auto">
          <div className="relative flex-1 sm:flex-none">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm" />
            <input
              type="search"
              placeholder="Search projects…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-surface border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-ink placeholder:text-dim focus:outline-none focus:border-sidebar w-full sm:w-48"
            />
          </div>
          {!isFunder && (
            <Button icon="ri-add-line" onClick={() => navigate('/projects/new')}>
              <span className="hidden sm:inline">New Project</span>
              <span className="sm:hidden">New</span>
            </Button>
          )}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-xl p-6 space-y-3 animate-pulse">
              <div className="h-4 bg-ground rounded w-3/4" />
              <div className="h-3 bg-ground rounded w-full" />
              <div className="h-3 bg-ground rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="py-24 text-center">
          <i className="ri-folder-open-line text-5xl text-muted block mb-3" />
          <p className="text-muted">
            {search
              ? `No projects matching "${search}"`
              : isFunder
              ? 'No projects registered on the platform yet.'
              : 'No projects yet. Create your first one.'}
          </p>
          {!search && !isFunder && (
            <Button className="mt-4 mx-auto" icon="ri-add-line" onClick={() => navigate('/projects/new')}>
              New Project
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
          {visible.map((p) => {
            const pct = p.targetBudget > 0 ? (p.totalSpent / p.targetBudget) * 100 : 0;
            const alreadyFunded = isFunder && p.amountPledged != null && p.amountPledged > 0;

            return (
              <Card key={p.id} className="flex flex-col gap-4 relative overflow-hidden p-0">
                {/* Thumbnail */}
                {p.imageUrl ? (
                  <div className="h-36 w-full overflow-hidden flex-shrink-0">
                    <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="h-36 w-full bg-gradient-to-br from-sidebar/10 to-sidebar/5 flex items-center justify-center flex-shrink-0">
                    <i className="ri-folder-image-line text-4xl text-sidebar/20" />
                  </div>
                )}

                <div className="flex flex-col gap-4 px-5 pb-5">
                  <div className="flex items-start justify-between">
                    <Badge variant={p.status} />
                    <span className="text-xs text-muted">{p.milestonesCount} milestones</span>
                  </div>

                  <div>
                    <h3 className="font-semibold text-ink text-base leading-snug mb-1">{p.title}</h3>
                    <p className="text-sm text-muted line-clamp-2">{p.description}</p>
                  </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium bg-ground text-ink-secondary px-2.5 py-0.5 rounded-full">
                    {p.category}
                  </span>
                  <span className="ml-auto text-xs text-muted flex items-center gap-1">
                    <i className="ri-flag-line" /> {p.milestonesCompleted}/{p.milestonesCount}
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-muted">Budget</span>
                    <span className="font-bold text-ink tabular-nums">{formatCurrency(p.targetBudget)}</span>
                  </div>
                  <ProgressBar value={pct} showLabel size="md" />
                </div>

                {isFunder ? (
                  <div className="mt-auto flex flex-col gap-2">
                    {alreadyFunded && (
                      <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-success bg-success/10 border border-success/20 rounded-lg py-1.5">
                        <i className="ri-check-double-line" />
                        Your pledge: {formatCurrency(p.amountPledged!)}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Link
                        to={`/projects/${p.id}`}
                        className="flex-1 text-center py-2 text-sm font-semibold text-ink border border-border rounded-lg hover:bg-ground transition-colors"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => openFundModal(p)}
                        className="flex-1 text-center py-2 text-sm font-semibold text-white bg-sidebar rounded-lg hover:opacity-90 transition-opacity"
                      >
                        {alreadyFunded ? 'Update Pledge' : 'Fund Project'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <Link
                    to={`/projects/${p.id}`}
                    className="mt-auto block text-center py-2 text-sm font-semibold text-ink border border-border rounded-lg hover:bg-ground transition-colors"
                  >
                    View Project
                  </Link>
                )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Fund Modal */}
      <Modal
        open={!!fundTarget}
        onClose={() => { setFundTarget(null); setFundAmount(''); setFundError(''); }}
        title={fundTarget?.amountPledged ? 'Update Pledge' : 'Fund This Project'}
      >
        {fundTarget && (
          <form onSubmit={handleFund} className="space-y-4" noValidate>
            <p className="text-sm text-muted">
              You are pledging funds to{' '}
              <span className="font-semibold text-ink">{fundTarget.title}</span>.
              This records your commitment — no real payment is processed in this version.
            </p>
            <Input
              label="Amount Pledged ($)"
              type="number"
              min="1"
              step="0.01"
              value={fundAmount}
              onChange={(e) => { setFundAmount(e.target.value); setFundError(''); }}
              error={fundError}
              prefixIcon="ri-money-dollar-circle-line"
              placeholder="0.00"
            />
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => { setFundTarget(null); setFundAmount(''); setFundError(''); }}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" loading={fundLoading}>
                {fundTarget?.amountPledged ? 'Update Pledge' : 'Confirm Pledge'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
