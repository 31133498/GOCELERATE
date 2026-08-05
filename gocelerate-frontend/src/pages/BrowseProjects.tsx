import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPublicProjects } from '../api/projects';
import { formatCurrency } from '../utils/formatCurrency';
import type { PublicProjectView } from '../types';

const CATEGORIES = ['All', 'Infrastructure', 'Technology', 'Health', 'Education', 'Agriculture', 'Environment', 'Finance', 'Other'];
const STATUSES   = ['All', 'ACTIVE', 'PENDING', 'COMPLETED'] as const;

const STATUS_LABEL: Record<string, string> = { ACTIVE: 'Active', PENDING: 'Pending', COMPLETED: 'Completed' };
const STATUS_COLOR: Record<string, string> = {
  ACTIVE:    'bg-emerald-100 text-emerald-700',
  PENDING:   'bg-amber-100 text-amber-700',
  COMPLETED: 'bg-sky-100 text-sky-700',
};

function ProjectCard({ p }: { p: PublicProjectView }) {
  const pct = p.targetBudget > 0 ? Math.min((p.totalSpent / p.targetBudget) * 100, 100) : 0;

  return (
    <Link
      to={`/p/${p.id}`}
      className="group flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden"
    >
      {/* Cover image */}
      <div className="relative h-44 bg-gradient-to-br from-[#1B1D2F] to-[#06B6D4]/60 flex-shrink-0">
        {p.imageUrl ? (
          <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <i className="ri-folder-line text-5xl text-white/30" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLOR[p.status] ?? 'bg-gray-100 text-gray-600'}`}>
            {STATUS_LABEL[p.status] ?? p.status}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className="text-xs font-medium bg-black/40 text-white px-2.5 py-1 rounded-full backdrop-blur-sm">
            {p.category}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5">
        <h3 className="font-bold text-[#1B1D2F] text-base leading-snug mb-1.5 group-hover:text-[#06B6D4] transition-colors line-clamp-2">
          {p.title}
        </h3>
        <p className="text-sm text-gray-400 leading-relaxed line-clamp-2 mb-4 flex-1">
          {p.description || 'No description provided.'}
        </p>

        {/* Budget progress */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span>Budget used</span>
            <span className="font-semibold text-[#1B1D2F]">{Math.round(pct)}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-[#06B6D4] transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-50">
          <div className="text-center">
            <p className="text-xs font-bold text-[#1B1D2F] tabular-nums">{formatCurrency(p.targetBudget)}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Budget</p>
          </div>
          <div className="text-center border-x border-gray-100">
            <p className="text-xs font-bold text-[#06B6D4] tabular-nums">{formatCurrency(p.totalPledged)}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Pledged</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-bold text-[#1B1D2F] tabular-nums">
              {p.milestonesCompleted}/{p.milestonesCount}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">Milestones</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function BrowseProjects() {
  const [projects, setProjects] = useState<PublicProjectView[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus]     = useState<typeof STATUSES[number]>('All');

  useEffect(() => {
    getPublicProjects()
      .then(({ data }) => setProjects(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const visible = projects.filter((p) => {
    const matchSearch   = p.title.toLowerCase().includes(search.toLowerCase()) ||
                          (p.description ?? '').toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === 'All' || p.category === category;
    const matchStatus   = status === 'All' || p.status === status;
    return matchSearch && matchCategory && matchStatus;
  });

  return (
    <div className="min-h-screen bg-[#F5F6FA]">
      {/* Topbar */}
      <nav className="sticky top-0 z-20 bg-white border-b border-gray-100 px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#06B6D4] flex items-center justify-center">
            <i className="ri-rocket-line text-white text-sm" />
          </div>
          <span className="font-bold text-[#1B1D2F] text-base">Gocelerate</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/login"    className="text-sm text-gray-500 hover:text-[#1B1D2F] font-medium transition-colors">Sign In</Link>
          <Link to="/register" className="text-sm bg-[#1B1D2F] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#1B1D2F]/90 transition-colors">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-[#1B1D2F] text-white px-6 py-14 text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 text-[#06B6D4] text-xs font-semibold px-4 py-1.5 rounded-full mb-6 border border-[#06B6D4]/30">
          <i className="ri-search-line" /> Browse All Projects
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">
          Discover Impact Projects
        </h1>
        <p className="text-white/50 max-w-md mx-auto text-sm leading-relaxed">
          Every project on this platform is fully transparent — browse milestones, track spending, and fund the work that matters to you.
        </p>
      </div>

      {/* Filters */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#1B1D2F] text-gray-800 placeholder:text-gray-400"
            />
          </div>

          {/* Category */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="text-sm border border-gray-200 rounded-xl px-4 py-2.5 bg-white text-gray-700 focus:outline-none focus:border-[#1B1D2F] min-w-[150px]"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
            ))}
          </select>

          {/* Status */}
          <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl p-1">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap
                  ${status === s ? 'bg-white shadow-sm text-[#1B1D2F]' : 'text-gray-400 hover:text-gray-700'}`}
              >
                {s === 'All' ? 'All' : STATUS_LABEL[s]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                <div className="h-44 bg-gray-100" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-full" />
                  <div className="h-3 bg-gray-100 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="py-24 text-center">
            <i className="ri-folder-open-line text-5xl text-gray-300 block mb-4" />
            <p className="text-gray-500 font-medium">
              {projects.length === 0 ? 'No projects on the platform yet.' : 'No projects match your filters.'}
            </p>
            {(search || category !== 'All' || status !== 'All') && (
              <button
                onClick={() => { setSearch(''); setCategory('All'); setStatus('All'); }}
                className="mt-4 text-sm text-[#06B6D4] hover:underline font-semibold"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-400 mb-5">
              {visible.length} project{visible.length !== 1 ? 's' : ''} found
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {visible.map((p) => <ProjectCard key={p.id} p={p} />)}
            </div>
          </>
        )}

        {/* CTA for non-logged in users */}
        <div className="mt-14 bg-[#1B1D2F] rounded-2xl p-8 sm:p-10 text-center text-white">
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Want to fund a project?</h2>
          <p className="text-white/50 text-sm mb-6 max-w-sm mx-auto">
            Create a free account to pledge funds, track your portfolio, and monitor how your money is used in real time.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/register?role=FUNDER"
              className="px-6 py-3 bg-[#06B6D4] text-white text-sm font-bold rounded-xl hover:bg-[#06B6D4]/90 transition-colors"
            >
              <i className="ri-funds-line mr-2" />
              Join as a Funder
            </Link>
            <Link
              to="/register?role=IMPLEMENTER"
              className="px-6 py-3 bg-white/10 text-white text-sm font-bold rounded-xl hover:bg-white/20 transition-colors"
            >
              <i className="ri-folder-add-line mr-2" />
              Register a Project
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
