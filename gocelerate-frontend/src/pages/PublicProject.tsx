import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPublicProject } from '../api/projects';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import type { PublicProjectView } from '../types';

const STATUS_COLOR: Record<string, string> = {
  ACTIVE:    'bg-green-100 text-green-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
  PENDING:   'bg-yellow-100 text-yellow-800',
};

const MILESTONE_ICON: Record<string, string> = {
  COMPLETED:   'ri-checkbox-circle-fill text-green-500',
  IN_PROGRESS: 'ri-loader-line text-cyan-500',
  NOT_STARTED: 'ri-checkbox-blank-circle-line text-gray-300',
};

export default function PublicProject() {
  const { id } = useParams<{ id: string }>();
  const [data, setData]     = useState<PublicProjectView | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    getPublicProject(Number(id))
      .then(({ data: d }) => setData(d))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F6FA] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-[#1B1D2F] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="min-h-screen bg-[#F5F6FA] flex flex-col items-center justify-center gap-4">
        <i className="ri-error-warning-line text-6xl text-gray-300" />
        <h1 className="text-2xl font-bold text-gray-700">Project not found</h1>
        <Link to="/" className="text-[#06B6D4] hover:underline text-sm font-medium">← Back to Gocelerate</Link>
      </div>
    );
  }

  const pct = data.targetBudget > 0 ? Math.min((data.totalSpent / data.targetBudget) * 100, 100) : 0;
  const fundPct = data.targetBudget > 0 ? Math.min((data.totalPledged / data.targetBudget) * 100, 100) : 0;
  const completedMilestones = data.milestones.filter(m => m.status === 'COMPLETED');

  return (
    <div className="min-h-screen bg-[#F5F6FA]">
      {/* Navbar */}
      <nav className="bg-[#1B1D2F] border-b border-white/10 px-6 h-14 flex items-center justify-between sticky top-0 z-40">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-lg bg-[#06B6D4] flex items-center justify-center">
            <i className="ri-rocket-line text-white text-sm" />
          </div>
          <span className="text-white font-bold text-base">Gocelerate</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-white/60 hover:text-white text-sm font-medium transition-colors">Sign In</Link>
          <Link to="/register" className="bg-[#06B6D4] hover:bg-[#0891B2] text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero / Cover */}
      <div className="relative">
        {data.imageUrl ? (
          <div className="h-72 w-full overflow-hidden">
            <img src={data.imageUrl} alt={data.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1B1D2F]/80 via-[#1B1D2F]/20 to-transparent" />
          </div>
        ) : (
          <div className="h-48 bg-gradient-to-br from-[#1B1D2F] to-[#06B6D4]/30" />
        )}

        {/* Project title over hero */}
        <div className={`absolute bottom-0 left-0 right-0 px-6 pb-6 ${data.imageUrl ? '' : 'pt-8'}`}>
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_COLOR[data.status] ?? 'bg-gray-100 text-gray-700'}`}>
                {data.status}
              </span>
              <span className="text-white/60 text-xs bg-white/10 px-2.5 py-1 rounded-full">{data.category}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight drop-shadow">{data.title}</h1>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Target Budget',   value: formatCurrency(data.targetBudget), icon: 'ri-target-line',          color: 'text-[#1B1D2F]' },
            { label: 'Total Pledged',   value: formatCurrency(data.totalPledged), icon: 'ri-funds-line',           color: 'text-[#06B6D4]' },
            { label: 'Amount Spent',    value: formatCurrency(data.totalSpent),   icon: 'ri-money-dollar-circle-line', color: 'text-purple-600' },
            { label: 'Milestones Done', value: `${data.milestonesCompleted}/${data.milestonesCount}`, icon: 'ri-flag-line', color: 'text-green-600' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <i className={`${s.icon} text-base ${s.color}`} />
                <p className="text-xs text-gray-400 font-medium">{s.label}</p>
              </div>
              <p className={`text-xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Budget bars */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900 text-lg">Budget Overview</h2>
          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-gray-500">Spent vs Budget</span>
              <span className="font-semibold text-gray-800 tabular-nums">{Math.round(pct)}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div className="h-3 rounded-full bg-[#1B1D2F] transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-gray-500">Pledged vs Budget</span>
              <span className="font-semibold text-[#06B6D4] tabular-nums">{Math.round(fundPct)}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div className="h-3 rounded-full bg-[#06B6D4] transition-all" style={{ width: `${fundPct}%` }} />
            </div>
          </div>
        </div>

        {/* Description */}
        {data.description && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="font-bold text-gray-900 text-lg mb-3">About This Project</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{data.description}</p>
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1.5"><i className="ri-calendar-line" /> Started {formatDate(data.createdAt)}</span>
              <span className="flex items-center gap-1.5"><i className="ri-price-tag-3-line" /> {data.category}</span>
            </div>
          </div>
        )}

        {/* Achievements (completed milestones with evidence) */}
        {completedMilestones.length > 0 && (
          <div>
            <h2 className="font-bold text-gray-900 text-xl mb-4 flex items-center gap-2">
              <i className="ri-trophy-line text-yellow-500" /> Achievements
            </h2>
            <div className="grid sm:grid-cols-2 gap-5">
              {completedMilestones.map((m) => (
                <div key={m.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  {m.evidenceImageUrl && (
                    <div className="h-44 overflow-hidden">
                      <img src={m.evidenceImageUrl} alt={m.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <i className="ri-checkbox-circle-fill text-green-500 text-lg" />
                      <span className="text-xs font-bold text-green-600 uppercase tracking-wide">Completed</span>
                    </div>
                    <h3 className="font-bold text-gray-900">{m.title}</h3>
                    {m.description && <p className="text-sm text-gray-500 mt-1">{m.description}</p>}
                    {m.dueDate && (
                      <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                        <i className="ri-calendar-check-line" /> Due {formatDate(m.dueDate)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Milestones timeline */}
        <div>
          <h2 className="font-bold text-gray-900 text-xl mb-6 flex items-center gap-2">
            <i className="ri-flag-line text-[#06B6D4]" /> Project Milestones
          </h2>
          {data.milestones.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 shadow-sm">
              <i className="ri-flag-line text-4xl text-gray-200 block mb-2" />
              <p className="text-gray-400 text-sm">No milestones added yet.</p>
            </div>
          ) : (
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-5 top-0 bottom-0 w-px bg-gray-200 ml-px" />
              <div className="space-y-6">
                {data.milestones.map((m) => (
                  <div key={m.id} className="relative flex gap-5">
                    {/* Circle */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 z-10
                      ${m.status === 'COMPLETED' ? 'bg-green-50 border-green-300' : m.status === 'IN_PROGRESS' ? 'bg-cyan-50 border-cyan-300' : 'bg-gray-50 border-gray-200'}`}>
                      <i className={`${MILESTONE_ICON[m.status]} text-base`} />
                    </div>
                    {/* Card */}
                    <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-1">
                      {m.evidenceImageUrl && m.status === 'COMPLETED' && (
                        <div className="h-36 overflow-hidden">
                          <img src={m.evidenceImageUrl} alt={m.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      {m.evidenceImageUrl && m.status !== 'COMPLETED' && (
                        <div className="h-28 overflow-hidden">
                          <img src={m.evidenceImageUrl} alt={m.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-bold text-gray-900 leading-snug">{m.title}</h3>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0
                            ${m.status === 'COMPLETED' ? 'bg-green-100 text-green-700'
                              : m.status === 'IN_PROGRESS' ? 'bg-cyan-100 text-cyan-700'
                              : 'bg-gray-100 text-gray-500'}`}>
                            {m.status.replace('_', ' ')}
                          </span>
                        </div>
                        {m.description && <p className="text-sm text-gray-500 mt-1 leading-relaxed">{m.description}</p>}
                        {m.dueDate && (
                          <p className="text-xs text-gray-400 mt-3 flex items-center gap-1.5">
                            <i className="ri-calendar-line" /> Due {formatDate(m.dueDate)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Funders */}
        <div>
          <h2 className="font-bold text-gray-900 text-xl mb-4 flex items-center gap-2">
            <i className="ri-heart-line text-pink-500" /> Funders
            <span className="text-sm font-normal text-gray-400 ml-1">({data.funders.length})</span>
          </h2>
          {data.funders.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 shadow-sm">
              <i className="ri-funds-line text-4xl text-gray-200 block mb-2" />
              <p className="text-gray-400 text-sm">No funders yet. Be the first to support this project.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {data.funders.map((f, i) => (
                <div key={i} className={`flex items-center justify-between px-6 py-4 ${i < data.funders.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#06B6D4]/15 flex items-center justify-center text-[#06B6D4] font-bold text-sm">
                      {f.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{f.name}</p>
                      {f.pledgedAt && <p className="text-xs text-gray-400">{formatDate(f.pledgedAt)}</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#1B1D2F] tabular-nums">{formatCurrency(f.amountPledged)}</p>
                    <p className="text-xs text-gray-400">pledged</p>
                  </div>
                </div>
              ))}
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Total pledged</span>
                <span className="font-black text-[#06B6D4] tabular-nums text-lg">{formatCurrency(data.totalPledged)}</span>
              </div>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="bg-[#1B1D2F] rounded-3xl p-8 text-center">
          <i className="ri-funds-line text-3xl text-[#06B6D4] block mb-3" />
          <h3 className="text-white font-bold text-xl mb-2">Want to support this project?</h3>
          <p className="text-white/50 text-sm mb-6">Join Gocelerate to pledge funds and track how every naira is used.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/register?role=FUNDER"
              className="bg-[#06B6D4] hover:bg-[#0891B2] text-white font-semibold px-7 py-3 rounded-full transition-all hover:scale-105 text-sm"
            >
              Register as a Funder
            </Link>
            <Link
              to="/login"
              className="border border-white/20 hover:border-white/50 text-white/70 hover:text-white font-semibold px-7 py-3 rounded-full transition-all text-sm"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-4">
          <Link to="/" className="text-gray-400 hover:text-gray-600 text-sm flex items-center gap-1.5 justify-center transition-colors">
            <div className="w-5 h-5 rounded bg-[#1B1D2F] flex items-center justify-center">
              <i className="ri-rocket-line text-white text-xs" />
            </div>
            Powered by Gocelerate
          </Link>
        </div>
      </div>
    </div>
  );
}
