import { useEffect, useState, type FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import ProgressBar from '../components/ui/ProgressBar';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import ImageUpload from '../components/ui/ImageUpload';
import { getProject, fundProject } from '../api/projects';
import { getMilestonesByProject, createMilestone, updateMilestone } from '../api/milestones';
import { logExpense } from '../api/expenses';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import type { Project, Milestone, Expense } from '../types';
import { useAuth } from '../context/AuthContext';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const projectId = Number(id);
  const isImplementer = user?.role === 'IMPLEMENTER';

  const [project, setProject]       = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading]       = useState(true);
  const [expanded, setExpanded]     = useState<Set<number>>(new Set());

  // Milestone modal
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [mTitle, setMTitle]   = useState('');
  const [mDesc, setMDesc]     = useState('');
  const [mDue, setMDue]       = useState('');
  const [mErrors, setMErrors] = useState<Record<string, string>>({});
  const [mLoading, setMLoading] = useState(false);

  // Expense modal
  const [showExpenseModal, setShowExpenseModal]   = useState(false);
  const [activeMilestoneId, setActiveMilestoneId] = useState<number | null>(null);
  const [eDesc, setEDesc]         = useState('');
  const [eAmount, setEAmount]     = useState('');
  const [eCategory, setECategory] = useState('OTHER');
  const [eDate, setEDate]         = useState('');
  const [eErrors, setEErrors]     = useState<Record<string, string>>({});
  const [eLoading, setELoading]   = useState(false);

  // Fund modal (for funders)
  const [showFundModal, setShowFundModal] = useState(false);
  const [fundAmount, setFundAmount]       = useState('');
  const [fundError, setFundError]         = useState('');
  const [fundLoading, setFundLoading]     = useState(false);

  // Evidence modal (implementer only)
  const [evidenceMilestoneId, setEvidenceMilestoneId] = useState<number | null>(null);
  const [evidenceUrl, setEvidenceUrl]                 = useState<string | null>(null);
  const [evidenceLoading, setEvidenceLoading]         = useState(false);

  const [toast, setToast] = useState('');

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  function loadData() {
    Promise.all([getProject(projectId), getMilestonesByProject(projectId)])
      .then(([{ data: proj }, { data: ms }]) => {
        setProject(proj);
        setMilestones(ms);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadData(); }, [projectId]);

  function toggleExpand(id: number) {
    setExpanded((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  }

  // Milestone handlers
  function validateMilestone() {
    const e: Record<string, string> = {};
    if (!mTitle.trim()) e.mTitle = 'Title required';
    if (!mDue) e.mDue = 'Due date required';
    setMErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleCreateMilestone(e: FormEvent) {
    e.preventDefault();
    if (!validateMilestone()) return;
    setMLoading(true);
    try {
      await createMilestone(projectId, { title: mTitle, description: mDesc, dueDate: mDue });
      setShowMilestoneModal(false);
      setMTitle(''); setMDesc(''); setMDue('');
      loadData();
      showToast('Milestone added!');
    } catch { showToast('Failed to add milestone.'); }
    finally { setMLoading(false); }
  }

  // Expense handlers
  function validateExpense() {
    const e: Record<string, string> = {};
    if (!eDesc.trim()) e.eDesc = 'Description required';
    if (!eAmount || isNaN(Number(eAmount)) || Number(eAmount) <= 0) e.eAmount = 'Valid amount required';
    if (!eDate) e.eDate = 'Date required';
    setEErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleLogExpense(ev: FormEvent) {
    ev.preventDefault();
    if (!validateExpense() || !activeMilestoneId) return;
    setELoading(true);
    try {
      await logExpense(activeMilestoneId, {
        description: eDesc,
        amount: Number(eAmount),
        category: eCategory,
        date: eDate,
      });
      setShowExpenseModal(false);
      setEDesc(''); setEAmount(''); setECategory('OTHER'); setEDate('');
      loadData();
      showToast('Expense logged!');
    } catch { showToast('Failed to log expense.'); }
    finally { setELoading(false); }
  }

  // Fund handler
  async function handleFund(ev: FormEvent) {
    ev.preventDefault();
    if (!project) return;
    const amount = Number(fundAmount);
    if (!fundAmount || isNaN(amount) || amount <= 0) {
      setFundError('Enter a valid amount greater than 0');
      return;
    }
    setFundLoading(true);
    try {
      await fundProject(project.id, amount);
      setShowFundModal(false);
      setFundAmount('');
      setFundError('');
      loadData();
      showToast(project.amountPledged ? 'Pledge updated!' : 'Project funded!');
    } catch { showToast('Failed to submit pledge.'); }
    finally { setFundLoading(false); }
  }

  function openFundModal() {
    setFundAmount(project?.amountPledged ? String(project.amountPledged) : '');
    setFundError('');
    setShowFundModal(true);
  }

  async function handleAttachEvidence() {
    if (!evidenceMilestoneId || !evidenceUrl) return;
    setEvidenceLoading(true);
    try {
      await updateMilestone(evidenceMilestoneId, { evidenceImageUrl: evidenceUrl });
      setEvidenceMilestoneId(null);
      setEvidenceUrl(null);
      loadData();
      showToast('Evidence attached!');
    } catch { showToast('Failed to attach evidence.'); }
    finally { setEvidenceLoading(false); }
  }

  const pct = project && project.targetBudget > 0
    ? (project.totalSpent / project.targetBudget) * 100 : 0;

  const statusIcon = (s: Milestone['status']) =>
    s === 'COMPLETED' ? 'ri-checkbox-circle-fill text-success'
    : s === 'IN_PROGRESS' ? 'ri-loader-line text-accent'
    : 'ri-checkbox-blank-circle-line text-dim';

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-36 bg-surface border border-border rounded-xl" />
        <div className="h-64 bg-surface border border-border rounded-xl" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="py-24 text-center">
        <i className="ri-error-warning-line text-5xl text-muted block mb-3" />
        <p className="text-muted">Project not found.</p>
      </div>
    );
  }

  const alreadyFunded = !isImplementer && project.amountPledged != null && project.amountPledged > 0;

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-sidebar text-white px-5 py-3 rounded-full text-sm font-medium shadow-elevated z-50">
          {toast}
        </div>
      )}

      {/* Header card */}
      <Card padding="none">
        {/* Cover image */}
        {project.imageUrl && (
          <div className="h-52 w-full overflow-hidden rounded-t-xl">
            <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-ink mb-2">{project.title}</h2>
            <div className="flex items-center gap-3">
              <Badge variant={project.status} />
              <span className="text-xs font-medium bg-ground text-ink-secondary px-2.5 py-1 rounded-full">
                {project.category}
              </span>
            </div>
          </div>

          {/* Public share link */}
          <Link
            to={`/p/${project.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted hover:text-accent flex items-center gap-1 transition-colors flex-shrink-0"
            title="View public project page"
          >
            <i className="ri-share-line" /> Share
          </Link>

          {/* Implementer: status changer */}
          {isImplementer && (
            <select
              defaultValue={project.status}
              className="text-sm border border-border rounded-lg px-3 py-2 bg-surface text-ink focus:outline-none focus:border-sidebar"
              onChange={async (e) => {
                try {
                  const { updateProjectStatus } = await import('../api/projects');
                  await updateProjectStatus(project.id, e.target.value);
                  loadData();
                  showToast('Status updated!');
                } catch { showToast('Failed to update status.'); }
              }}
            >
              <option value="PENDING">Pending</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
            </select>
          )}

          {/* Funder: fund / update pledge button */}
          {!isImplementer && (
            <div className="flex flex-col items-end gap-2">
              {alreadyFunded && (
                <div className="text-xs font-semibold text-success flex items-center gap-1">
                  <i className="ri-check-double-line" /> Your pledge: {formatCurrency(project.amountPledged!)}
                </div>
              )}
              <Button icon={alreadyFunded ? 'ri-edit-line' : 'ri-funds-line'} onClick={openFundModal}>
                {alreadyFunded ? 'Update Pledge' : 'Fund This Project'}
              </Button>
            </div>
          )}
        </div>

        {project.description && (
          <p className="text-sm text-muted mb-6">{project.description}</p>
        )}

        <div className="grid grid-cols-3 gap-6 mb-6">
          <div>
            <p className="text-xs text-muted mb-1">Target Budget</p>
            <p className="text-xl font-bold text-ink tabular-nums">{formatCurrency(project.targetBudget)}</p>
          </div>
          <div>
            <p className="text-xs text-muted mb-1">Total Spent</p>
            <p className="text-xl font-bold text-ink tabular-nums">{formatCurrency(project.totalSpent)}</p>
          </div>
          <div>
            <p className="text-xs text-muted mb-1">Remaining</p>
            <p className={`text-xl font-bold tabular-nums ${project.targetBudget - project.totalSpent < 0 ? 'text-danger' : 'text-success'}`}>
              {formatCurrency(project.targetBudget - project.totalSpent)}
            </p>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted">Budget used</span>
            <span className="font-semibold text-ink tabular-nums">{Math.round(pct)}%</span>
          </div>
          <ProgressBar
            value={pct}
            size="lg"
            color={pct > 90 ? 'bg-danger' : pct > 70 ? 'bg-[#f59e0b]' : 'bg-sidebar'}
          />
        </div>
        </div>
      </Card>

      {/* Milestones */}
      <Card padding="none">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="font-semibold text-ink">Milestones</h3>
          {isImplementer && (
            <Button size="sm" icon="ri-add-line" onClick={() => setShowMilestoneModal(true)}>
              Add Milestone
            </Button>
          )}
        </div>

        {milestones.length === 0 ? (
          <div className="py-16 text-center">
            <i className="ri-flag-line text-4xl text-muted block mb-3" />
            <p className="text-muted text-sm">No milestones yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {milestones.map((m) => (
              <div key={m.id} className="px-6 py-4">
                <div className="flex items-start gap-4">
                  <i className={`${statusIcon(m.status)} text-2xl mt-0.5 flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-ink">{m.title}</p>
                        {m.description && (
                          <p className="text-sm text-muted mt-0.5">{m.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant={m.status} />
                        <button
                          onClick={() => toggleExpand(m.id)}
                          className="text-muted hover:text-ink p-1 rounded transition-colors"
                        >
                          <i className={`ri-arrow-${expanded.has(m.id) ? 'up' : 'down'}-s-line`} />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-xs text-muted">
                      <span className="flex items-center gap-1">
                        <i className="ri-calendar-line" /> {formatDate(m.dueDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <i className="ri-money-dollar-circle-line" />
                        {formatCurrency(m.totalExpenses)}
                      </span>
                    </div>

                    {/* Expanded panel */}
                    {expanded.has(m.id) && (
                      <div className="mt-4 space-y-4">

                        {/* Evidence image */}
                        {m.evidenceImageUrl ? (
                          <div className="rounded-xl overflow-hidden border border-border">
                            <div className="flex items-center justify-between px-4 py-2.5 bg-ground border-b border-border">
                              <p className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                                <i className="ri-image-2-line text-success" /> Completion Evidence
                              </p>
                              {isImplementer && (
                                <button
                                  className="text-xs text-muted hover:text-ink flex items-center gap-1"
                                  onClick={() => { setEvidenceMilestoneId(m.id); setEvidenceUrl(null); }}
                                >
                                  <i className="ri-edit-line" /> Replace
                                </button>
                              )}
                            </div>
                            <img
                              src={m.evidenceImageUrl}
                              alt="Evidence"
                              className="w-full max-h-72 object-contain bg-black/5"
                            />
                          </div>
                        ) : isImplementer ? (
                          <div className="flex items-center justify-between bg-ground/70 rounded-xl border border-dashed border-border px-4 py-3">
                            <div className="flex items-center gap-2 text-sm text-muted">
                              <i className="ri-image-add-line text-base" />
                              <span>No completion evidence attached yet</span>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              icon="ri-attachment-line"
                              onClick={() => { setEvidenceMilestoneId(m.id); setEvidenceUrl(null); }}
                            >
                              Attach Evidence
                            </Button>
                          </div>
                        ) : null}

                        <div className="bg-ground rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs font-bold uppercase tracking-wider text-muted">Expenses</p>
                          {isImplementer && (
                            <Button
                              size="sm"
                              variant="ghost"
                              icon="ri-add-line"
                              onClick={() => { setActiveMilestoneId(m.id); setShowExpenseModal(true); }}
                            >
                              Log Expense
                            </Button>
                          )}
                        </div>
                        {(!m.expenses || m.expenses.length === 0) ? (
                          <p className="text-sm text-muted">No expenses logged yet.</p>
                        ) : (
                          <div className="space-y-2">
                            {m.expenses.map((exp: Expense) => (
                              <div key={exp.id} className="flex items-center justify-between bg-surface rounded-lg px-4 py-2.5">
                                <div>
                                  <p className="text-sm font-medium text-ink">{exp.description}</p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <Badge variant={exp.category} />
                                    <span className="text-xs text-muted">{formatDate(exp.date)}</span>
                                  </div>
                                </div>
                                <span className="text-sm font-bold text-ink tabular-nums">
                                  {formatCurrency(exp.amount)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Add Milestone Modal (implementer only) */}
      {isImplementer && (
        <Modal open={showMilestoneModal} onClose={() => setShowMilestoneModal(false)} title="Add Milestone">
          <form onSubmit={handleCreateMilestone} className="space-y-4" noValidate>
            <Input label="Title" value={mTitle} onChange={(e) => setMTitle(e.target.value)} error={mErrors.mTitle} placeholder="Milestone title" />
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">Description</label>
              <textarea
                value={mDesc}
                onChange={(e) => setMDesc(e.target.value)}
                rows={3}
                placeholder="Optional description"
                className="w-full rounded-lg border border-border px-4 py-3 text-sm text-ink placeholder:text-dim focus:outline-none focus:border-sidebar resize-none"
              />
            </div>
            <Input label="Due Date" type="date" value={mDue} onChange={(e) => setMDue(e.target.value)} error={mErrors.mDue} />
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowMilestoneModal(false)}>Cancel</Button>
              <Button type="submit" className="flex-1" loading={mLoading}>Add Milestone</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Log Expense Modal (implementer only) */}
      {isImplementer && (
        <Modal open={showExpenseModal} onClose={() => setShowExpenseModal(false)} title="Log Expense">
          <form onSubmit={handleLogExpense} className="space-y-4" noValidate>
            <Input label="Description" value={eDesc} onChange={(e) => setEDesc(e.target.value)} error={eErrors.eDesc} placeholder="What was this expense for?" />
            <Input label="Amount ($)" type="number" min="0" step="0.01" value={eAmount} onChange={(e) => setEAmount(e.target.value)} error={eErrors.eAmount} prefixIcon="ri-money-dollar-circle-line" placeholder="0.00" />
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">Category</label>
              <select
                value={eCategory}
                onChange={(e) => setECategory(e.target.value)}
                className="w-full rounded-lg border border-border px-4 py-3 text-sm text-ink bg-surface focus:outline-none focus:border-sidebar"
              >
                {['TRAVEL','EQUIPMENT','PERSONNEL','OTHER'].map((c) => (
                  <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>
                ))}
              </select>
            </div>
            <Input label="Date" type="date" value={eDate} onChange={(e) => setEDate(e.target.value)} error={eErrors.eDate} />
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowExpenseModal(false)}>Cancel</Button>
              <Button type="submit" className="flex-1" loading={eLoading}>Log Expense</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Attach Evidence Modal (implementer only) */}
      {isImplementer && (
        <Modal
          open={evidenceMilestoneId !== null}
          onClose={() => { setEvidenceMilestoneId(null); setEvidenceUrl(null); }}
          title="Attach Completion Evidence"
        >
          <div className="space-y-4">
            <p className="text-sm text-muted">
              Upload a photo or document image as proof of milestone completion. This will be visible to all funders.
            </p>
            <ImageUpload
              label="Evidence Image"
              placeholder="Upload photo, receipt, or completion proof"
              value={evidenceUrl}
              onChange={setEvidenceUrl}
              aspectRatio="banner"
            />
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => { setEvidenceMilestoneId(null); setEvidenceUrl(null); }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="flex-1"
                loading={evidenceLoading}
                onClick={handleAttachEvidence}
              >
                <i className="ri-attachment-line mr-1.5" /> Attach Evidence
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Fund Modal (funder only) */}
      {!isImplementer && (
        <Modal open={showFundModal} onClose={() => { setShowFundModal(false); setFundError(''); }} title={alreadyFunded ? 'Update Pledge' : 'Fund This Project'}>
          <form onSubmit={handleFund} className="space-y-4" noValidate>
            <p className="text-sm text-muted">
              Pledging funds to <span className="font-semibold text-ink">{project.title}</span>.
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
              <Button type="button" variant="outline" className="flex-1" onClick={() => { setShowFundModal(false); setFundError(''); }}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" loading={fundLoading}>
                {alreadyFunded ? 'Update Pledge' : 'Confirm Pledge'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
