import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import ImageUpload from '../components/ui/ImageUpload';
import Table from '../components/ui/Table';
import { getMilestones, createMilestone, updateMilestone } from '../api/milestones';
import { getProjects } from '../api/projects';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate, isOverdue } from '../utils/formatDate';
import type { Milestone, Project } from '../types';
import { useAuth } from '../context/AuthContext';

const STATUS_FILTERS = ['All', 'NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'] as const;
type Filter = (typeof STATUS_FILTERS)[number];

const filterLabel = (f: string) =>
  f === 'All' ? 'All'
  : f === 'NOT_STARTED' ? 'Not Started'
  : f === 'IN_PROGRESS' ? 'In Progress'
  : 'Completed';

export default function Milestones() {
  const { user } = useAuth();
  const isImplementer = user?.role === 'IMPLEMENTER';

  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [projects, setProjects]     = useState<Project[]>([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState<Filter>('All');
  const [toast, setToast]           = useState('');

  // Add milestone modal
  const [showModal, setShowModal]     = useState(false);
  const [mProject, setMProject]       = useState('');
  const [mTitle, setMTitle]           = useState('');
  const [mDesc, setMDesc]             = useState('');
  const [mDue, setMDue]               = useState('');
  const [mImage, setMImage]           = useState<string | null>(null);
  const [mErrors, setMErrors]         = useState<Record<string, string>>({});
  const [mLoading, setMLoading]       = useState(false);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  function load() {
    setLoading(true);
    getMilestones(filter === 'All' ? undefined : filter)
      .then(({ data }) => setMilestones(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [filter]);

  useEffect(() => {
    if (!isImplementer) return;
    getProjects().then(({ data }) => {
      setProjects(data);
      if (data.length > 0) setMProject(String(data[0].id));
    }).catch(() => {});
  }, [isImplementer]);

  function openModal() {
    setMTitle(''); setMDesc(''); setMDue(''); setMImage(null); setMErrors({});
    if (projects.length > 0) setMProject(String(projects[0].id));
    setShowModal(true);
  }

  function validateModal() {
    const e: Record<string, string> = {};
    if (!mProject) e.mProject = 'Select a project';
    if (!mTitle.trim()) e.mTitle = 'Title is required';
    if (!mDue) e.mDue = 'Due date is required';
    setMErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!validateModal()) return;
    setMLoading(true);
    try {
      await createMilestone(Number(mProject), {
        title: mTitle,
        description: mDesc,
        dueDate: mDue,
        evidenceImageUrl: mImage,
      });
      setShowModal(false);
      load();
      showToast('Milestone added!');
    } catch { showToast('Failed to add milestone.'); }
    finally { setMLoading(false); }
  }

  const columns = [
    {
      key: 'image', label: '',
      render: (m: Milestone) => m.evidenceImageUrl ? (
        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
          <img src={m.evidenceImageUrl} alt="" className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="w-10 h-10 rounded-lg bg-ground flex items-center justify-center flex-shrink-0">
          <i className="ri-flag-line text-muted text-base" />
        </div>
      ),
    },
    {
      key: 'title', label: 'Milestone',
      render: (m: Milestone) => (
        <span className="font-semibold text-ink">{m.title}</span>
      ),
    },
    {
      key: 'project', label: 'Project',
      render: (m: Milestone) => (
        <Link to={`/projects/${m.projectId}`} className="text-accent hover:underline text-sm">
          {m.projectTitle ?? `Project #${m.projectId}`}
        </Link>
      ),
    },
    {
      key: 'status', label: 'Status',
      render: (m: Milestone) => <Badge variant={m.status} />,
    },
    {
      key: 'dueDate', label: 'Due Date',
      render: (m: Milestone) => (
        <span className={`flex items-center gap-1 text-sm ${isOverdue(m.dueDate) && m.status !== 'COMPLETED' ? 'text-danger font-medium' : 'text-ink-secondary'}`}>
          <i className="ri-calendar-line" />
          {formatDate(m.dueDate)}
          {isOverdue(m.dueDate) && m.status !== 'COMPLETED' && (
            <span className="ml-1 text-xs bg-[#fef2f2] text-danger px-1.5 py-0.5 rounded">Overdue</span>
          )}
        </span>
      ),
    },
    {
      key: 'totalExpenses', label: 'Expenses',
      render: (m: Milestone) => (
        <span className="tabular-nums font-medium">{formatCurrency(m.totalExpenses ?? 0)}</span>
      ),
    },
    {
      key: 'actions', label: 'Actions',
      render: (m: Milestone) => (
        <div className="flex items-center gap-2">
          {isImplementer && m.status !== 'COMPLETED' && (
            <button
              onClick={async () => {
                try {
                  const next = m.status === 'NOT_STARTED' ? 'IN_PROGRESS' : 'COMPLETED';
                  await updateMilestone(m.id, { status: next });
                  load();
                  showToast('Milestone updated!');
                } catch { showToast('Update failed.'); }
              }}
              className="text-xs font-semibold text-accent hover:underline"
            >
              {m.status === 'NOT_STARTED' ? 'Start' : 'Complete'}
            </button>
          )}
          <Link to={`/projects/${m.projectId}`} className="text-xs text-muted hover:text-ink">
            View →
          </Link>
        </div>
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

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-1 bg-surface border border-border rounded-lg p-1 overflow-x-auto">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap
                ${filter === f ? 'bg-ground shadow-card text-ink font-semibold' : 'text-muted hover:text-ink'}`}
            >
              {filterLabel(f)}
            </button>
          ))}
        </div>

        {isImplementer && (
          <div className="sm:ml-auto">
            <Button icon="ri-add-line" onClick={openModal}>
              Add Milestone
            </Button>
          </div>
        )}
      </div>

      <Card padding="none">
        <Table
          columns={columns}
          data={milestones}
          loading={loading}
          emptyIcon="ri-flag-line"
          emptyMessage="No milestones found"
          rowClassName={(m) =>
            isOverdue(m.dueDate) && m.status !== 'COMPLETED'
              ? 'border-l-[3px] border-l-danger'
              : ''
          }
        />
      </Card>

      {/* Add Milestone Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Milestone">
        <form onSubmit={handleCreate} className="space-y-4" noValidate>
          {/* Project selector */}
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Project</label>
            <select
              value={mProject}
              onChange={(e) => setMProject(e.target.value)}
              className={`w-full rounded-lg border px-4 py-3 text-sm text-ink bg-surface focus:outline-none focus:border-sidebar
                ${mErrors.mProject ? 'border-danger' : 'border-border'}`}
            >
              {projects.length === 0 && <option value="">No projects yet</option>}
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
            {mErrors.mProject && <p className="text-xs text-danger mt-1">{mErrors.mProject}</p>}
          </div>

          <Input
            label="Title"
            value={mTitle}
            onChange={(e) => setMTitle(e.target.value)}
            error={mErrors.mTitle}
            placeholder="Milestone title"
          />

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

          <Input
            label="Due Date"
            type="date"
            value={mDue}
            onChange={(e) => setMDue(e.target.value)}
            error={mErrors.mDue}
          />

          <ImageUpload
            label="Milestone Image (optional)"
            placeholder="Upload a photo or diagram for this milestone"
            value={mImage}
            onChange={setMImage}
          />

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" loading={mLoading}>
              Add Milestone
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
