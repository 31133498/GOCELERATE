import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useInView, useCountUp } from '../hooks/useInView';

/* ─────────────────────── data ─────────────────────── */
const STATS = [
  { raw: 150,  suffix: '+',  label: 'Projects Registered',  icon: 'ri-folder-line' },
  { raw: 500,  suffix: 'M+', label: 'Funds Tracked (₦)',    icon: 'ri-money-dollar-circle-line', prefix: '₦' },
  { raw: 1200, suffix: '+',  label: 'Milestones Logged',    icon: 'ri-flag-line' },
  { raw: 6,    suffix: '',   label: 'SDGs Addressed',       icon: 'ri-earth-line' },
];

const PROBLEMS = [
  {
    icon: 'ri-search-eye-line',
    title: 'Good projects struggle to reach funders',
    body: 'A community initiative or first-time founder with a genuine solution rarely has a grant writer or a listing on platforms that institutional funders use. There is no simple, trusted, centralised place where a small project can be discovered.',
  },
  {
    icon: 'ri-file-damage-line',
    title: 'Committed money cannot be verified',
    body: 'Once a project is funded, tracking how money is spent typically depends on manual logs, paper receipts, and end-of-period reports reconstructed from memory. No shared source of truth. When staff turn over, the project history is lost.',
  },
];

const IMPL_STEPS = [
  { icon: 'ri-folder-add-line',  step: '01', title: 'Register Your Project', desc: 'Create a project profile with a title, description, target budget, and category. Immediately visible to all funders on the platform.' },
  { icon: 'ri-flag-2-line',      step: '02', title: 'Add Milestones',        desc: 'Break your work into trackable milestones with due dates and descriptions so funders can see your plan before pledging.' },
  { icon: 'ri-receipt-line',     step: '03', title: 'Log Expenses',          desc: 'Record every naira spent against a milestone as it happens — not at the end of the quarter. Category, amount, description.' },
  { icon: 'ri-bar-chart-2-line', step: '04', title: 'Share Reports',         desc: 'A full summary report is always ready: budget vs spend, milestone completion, and expense breakdown by category.' },
];

const FUNDER_STEPS = [
  { icon: 'ri-search-line',      step: '01', title: 'Browse All Projects',     desc: 'Explore every registered project. Filter by status, search by name, read the full brief and milestone plan before committing.' },
  { icon: 'ri-funds-line',       step: '02', title: 'Pledge Your Support',     desc: 'Select any project and record your funding commitment. A formal, timestamped pledge — no payment gateway required.' },
  { icon: 'ri-dashboard-line',   step: '03', title: 'Track Progress Live',     desc: 'Your funded-projects dashboard shows live milestone status, budget utilisation, and recent activity — without chasing updates.' },
  { icon: 'ri-file-chart-line',  step: '04', title: 'Review Verified Reports', desc: 'Access the full project report at any time to verify how funds were used. Structured, auditable, always up to date.' },
];

const SDGS = [
  { num: 1,  color: '#E5243B', title: 'No Poverty',               desc: 'Widens funding access for small implementers and first-time founders.' },
  { num: 8,  color: '#A21942', title: 'Decent Work & Growth',     desc: 'Supports accountable economic activity in the social impact sector.' },
  { num: 9,  color: '#FD6925', title: 'Industry & Innovation',    desc: 'Digital infrastructure replacing scattered spreadsheets and paper records.' },
  { num: 10, color: '#DD1367', title: 'Reduced Inequalities',     desc: 'Levels the playing field between large NGOs and small community initiatives.' },
  { num: 16, color: '#00689D', title: 'Strong Institutions',      desc: 'An accountability layer working against undocumented spending.' },
  { num: 17, color: '#19486A', title: 'Partnerships for Goals',   desc: 'One shared system removing friction from the funder–implementer relationship.' },
];

const FEATURES = [
  { icon: 'ri-flag-line',         title: 'Milestone Tracking',     desc: 'Break projects into phases, mark progress, and keep everyone updated without manual status calls.' },
  { icon: 'ri-receipt-2-line',    title: 'Expense Logging',        desc: 'Attach spending to milestones as it happens. Every naira has a description, category, and timestamp.' },
  { icon: 'ri-pie-chart-2-line',  title: 'Budget Visibility',      desc: 'Live budget vs expense charts give every party a clear, shared picture of how funds move.' },
  { icon: 'ri-file-list-3-line',  title: 'Instant Reports',        desc: 'Full project summary reports — no reconstruction, no end-of-quarter scramble.' },
  { icon: 'ri-team-line',         title: 'Role-Based Access',      desc: 'Implementers manage. Funders monitor. Clear roles, clear accountability, no overlap.' },
  { icon: 'ri-shield-check-line', title: 'Structured Audit Trail', desc: 'Every entry is timestamped and structured. A reliable history that survives staff turnover.' },
];

/* ─────────────────────── helpers ─────────────────────── */
function RevealDiv({
  children,
  className = '',
  direction = 'up',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  direction?: 'up' | 'left' | 'right' | 'scale';
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const base =
    direction === 'left'  ? 'reveal-left'  :
    direction === 'right' ? 'reveal-right' :
    direction === 'scale' ? 'reveal-scale' : 'reveal';

  return (
    <div
      ref={ref}
      className={`${base} ${visible ? 'in' : ''} ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

type StatItem = { raw: number; suffix: string; label: string; icon: string; prefix?: string };
function StatCounter({ raw, suffix, prefix = '', label, icon }: StatItem) {
  const { ref, inView } = useInView(0.3);
  const count = useCountUp(raw, inView, 1600);
  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className="text-center group"
    >
      <div className={`text-4xl font-black text-white mb-1 tabular-nums transition-all duration-300 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      <p className="text-white/40 text-sm">{label}</p>
    </div>
  );
}

/* ─────────────────────── product mockup ─────────────────────── */
function HeroProductPreview() {
  return (
    <div className="relative w-full max-w-sm mx-auto lg:mx-0 animate-float" style={{ animationDuration: '5s' }}>
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-white/10">
        {/* Browser chrome */}
        <div className="bg-[#1B1D2F] px-5 py-3 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400/60" />
          <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
          <div className="w-3 h-3 rounded-full bg-green-400/60" />
          <span className="ml-3 text-white/30 text-xs font-mono">gocelerate.app/dashboard</span>
        </div>
        <div className="flex">
          {/* Mini sidebar */}
          <div className="w-12 bg-[#1B1D2F] flex flex-col items-center pt-4 gap-3 pb-4">
            {['ri-dashboard-line','ri-folder-line','ri-flag-line','ri-receipt-line','ri-bar-chart-line'].map((icon, i) => (
              <div key={icon} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${i === 0 ? 'bg-[#06B6D4]/30' : ''}`}>
                <i className={`${icon} text-sm ${i === 0 ? 'text-[#06B6D4]' : 'text-white/20'}`} />
              </div>
            ))}
          </div>
          {/* Mini dashboard */}
          <div className="flex-1 p-4 bg-[#F5F6FA] space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {[{l:'Projects',v:'12',c:'text-[#1B1D2F]'},{l:'Active',v:'4',c:'text-[#22C55E]'}].map(s=>(
                <div key={s.l} className="bg-white rounded-lg px-3 py-2 shadow-sm">
                  <p className="text-[10px] text-gray-400">{s.l}</p>
                  <p className={`text-base font-bold ${s.c}`}>{s.v}</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-lg p-3 space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-gray-800 leading-tight">Women's Empowerment Initiative</span>
                <span className="text-[9px] font-bold text-[#22C55E] bg-[#22C55E]/10 px-1.5 py-0.5 rounded-full">ACTIVE</span>
              </div>
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>₦2,400,000</span><span>50% used</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div className="bg-[#06B6D4] h-1.5 rounded-full transition-all" style={{ width: '50%' }} />
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 space-y-2 shadow-sm">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Milestones</p>
              {[{l:'Community Assessment',s:'done'},{l:'Training Workshop Series',s:'active'},{l:'Impact Evaluation',s:'pending'}].map(m=>(
                <div key={m.l} className="flex items-center gap-2">
                  <i className={`text-xs flex-shrink-0 ${m.s==='done'?'ri-checkbox-circle-fill text-[#22C55E]':m.s==='active'?'ri-loader-line text-[#06B6D4]':'ri-checkbox-blank-circle-line text-gray-300'}`} />
                  <span className="text-[10px] text-gray-600 truncate">{m.l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating badge — bottom-left */}
      <div
        className="absolute -bottom-5 -left-5 bg-white rounded-2xl shadow-elevated px-4 py-3 flex items-center gap-2.5 border border-gray-100 animate-float-badge"
        style={{ animationDelay: '0.5s', animationDuration: '3.5s' }}
      >
        <div className="w-8 h-8 bg-[#22C55E]/10 rounded-full flex items-center justify-center flex-shrink-0">
          <i className="ri-shield-check-line text-[#22C55E] text-sm" />
        </div>
        <div>
          <p className="text-xs font-bold text-gray-800">Verified Report</p>
          <p className="text-[10px] text-gray-400">₦1.2M logged · 2 milestones</p>
        </div>
      </div>

      {/* Floating badge — top-right */}
      <div
        className="absolute -top-5 -right-5 bg-[#06B6D4] rounded-2xl shadow-elevated px-4 py-3 flex items-center gap-2 animate-pulse-glow animate-float-badge"
        style={{ animationDelay: '1s', animationDuration: '4s' }}
      >
        <i className="ri-funds-line text-white text-sm" />
        <div>
          <p className="text-[10px] text-white/70">New Pledge</p>
          <p className="text-xs font-bold text-white">₦500,000</p>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── navbar ─────────────────────── */
function NavBar() {
  const { isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#1B1D2F] shadow-modal' : 'bg-[#1B1D2F]/80 backdrop-blur-md'} border-b border-white/10`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-[#06B6D4] flex items-center justify-center group-hover:scale-110 transition-transform">
            <i className="ri-rocket-line text-white text-base" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">Gocelerate</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {[['#features','Features'],['#how-it-works','How It Works'],['#sdgs','Impact']].map(([href,label])=>(
            <a key={href} href={href} className="text-white/60 hover:text-white text-sm font-medium transition-colors hover:scale-105 inline-block">
              {label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <Link to="/dashboard" className="bg-[#06B6D4] hover:bg-[#0891B2] text-white text-sm font-semibold px-5 py-2 rounded-full transition-all hover:scale-105 hover:shadow-lg">
              Go to Dashboard <i className="ri-arrow-right-line ml-1" />
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-white/70 hover:text-white text-sm font-medium transition-colors px-3 py-2">Sign In</Link>
              <Link to="/register" className="bg-[#06B6D4] hover:bg-[#0891B2] text-white text-sm font-semibold px-5 py-2 rounded-full transition-all hover:scale-105 hover:shadow-lg">
                Get Started
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden text-white/70 p-2" onClick={()=>setMobileOpen(!mobileOpen)}>
          <i className={`${mobileOpen?'ri-close-line':'ri-menu-line'} text-xl transition-transform duration-200`} />
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#1B1D2F] px-6 py-4 space-y-2 animate-fade-up">
          {[['#features','Features'],['#how-it-works','How It Works'],['#sdgs','Impact']].map(([href,label])=>(
            <a key={href} href={href} onClick={()=>setMobileOpen(false)} className="block text-white/70 hover:text-white text-sm font-medium py-2 transition-colors">{label}</a>
          ))}
          <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
            <Link to="/login" className="text-center text-white/70 text-sm font-medium py-2">Sign In</Link>
            <Link to="/register" className="text-center bg-[#06B6D4] text-white text-sm font-semibold px-5 py-2.5 rounded-full">Get Started</Link>
          </div>
        </div>
      )}
    </nav>
  );
}

/* ─────────────────────── page ─────────────────────── */
export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'implementer'|'funder'>('implementer');

  return (
    <div className="bg-white text-gray-800 overflow-x-hidden">
      <NavBar />

      {/* ── HERO ── */}
      <section className="bg-[#1B1D2F] pt-32 pb-28 px-6 relative overflow-hidden">
        {/* Animated background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#06B6D4]/8 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#06B6D4]/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Left: copy */}
            <div className="flex-1 text-center lg:text-left">
              <h1 className="animate-fade-up delay-100 text-4xl sm:text-5xl lg:text-[3.8rem] font-black text-white leading-[1.08] mb-6 tracking-tight">
                Track Every Naira.<br />
                <span
                  className="animate-gradient"
                  style={{ background: 'linear-gradient(90deg,#06B6D4,#22C55E,#06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', backgroundSize: '200% 200%' }}
                >
                  Prove Every Outcome.
                </span>
              </h1>

              <p className="animate-fade-up delay-200 text-white/55 text-lg leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
                Gocelerate connects Nigerian social impact projects with funders — with milestone tracking,
                real-time expense logging, and instant reports built in from day one.
              </p>

              <div className="animate-fade-up delay-300 flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
                {isAuthenticated ? (
                  <button onClick={()=>navigate('/dashboard')} className="w-full sm:w-auto bg-[#06B6D4] hover:bg-[#0891B2] text-white font-semibold px-8 py-3.5 rounded-full transition-all hover:scale-105 hover:shadow-xl text-base">
                    Go to Dashboard <i className="ri-arrow-right-line ml-1" />
                  </button>
                ) : (
                  <>
                    <Link to="/register" className="w-full sm:w-auto text-center bg-[#06B6D4] hover:bg-[#0891B2] text-white font-semibold px-8 py-3.5 rounded-full transition-all hover:scale-105 hover:shadow-xl text-base">
                      Get Started Free <i className="ri-arrow-right-line ml-1" />
                    </Link>
                    <a href="#how-it-works" className="w-full sm:w-auto text-center text-white/70 hover:text-white border border-white/20 hover:border-white/50 font-semibold px-8 py-3.5 rounded-full transition-all hover:scale-105 text-base">
                      See How It Works
                    </a>
                  </>
                )}
              </div>

              <div className="animate-fade-up delay-400 mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 justify-center lg:justify-start">
                <p className="text-white/25 text-xs">Trusted by:</p>
                {['NGOs','Community CBOs','First-time Founders','Impact Funders'].map(t=>(
                  <span key={t} className="text-white/40 text-xs font-medium">{t}</span>
                ))}
              </div>
            </div>

            {/* Right: product mockup */}
            <div className="animate-fade-up delay-500 flex-1 flex justify-center w-full max-w-sm lg:max-w-none lg:flex-none lg:w-[420px] mt-8 lg:mt-0">
              <HeroProductPreview />
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-[#111827] py-14 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s)=>(
            <StatCounter key={s.label} {...s} />
          ))}
        </div>
      </section>

      {/* ── COMMUNITY PHOTO ── */}
      <section className="relative overflow-hidden bg-[#111827]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row min-h-[480px]">

            {/* Image — left panel */}
            <RevealDiv direction="left" className="lg:w-[58%] relative overflow-hidden min-h-[340px] lg:min-h-0">
              <img
                src="/images/youth-impact.jpg"
                alt="Young Nigerian changemakers"
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
              {/* Edge blend into the right panel */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-[#111827] hidden lg:block" />
              {/* Bottom fade for mobile */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-[#111827]/30 to-transparent lg:hidden" />
            </RevealDiv>

            {/* Copy — right panel */}
            <RevealDiv direction="right" className="lg:w-[42%] flex items-center px-8 lg:px-14 py-14 lg:py-20">
              <div>
                <span className="text-[#06B6D4] text-xs font-bold uppercase tracking-widest mb-3 block">
                  The People We Serve
                </span>
                <h2 className="text-3xl lg:text-[2.6rem] font-black text-white leading-tight mb-5">
                  Built for the people changing Nigeria from the ground up.
                </h2>
                <p className="text-white/45 leading-relaxed mb-7">
                  From youth-led community initiatives to established NGOs, the real work of social impact
                  in Nigeria has always outpaced the tools available to document it. Gocelerate was built
                  to close that gap — one verified milestone at a time.
                </p>
                <div className="border-l-2 border-[#06B6D4] pl-5 mb-8">
                  <p className="text-white/55 text-sm italic leading-relaxed">
                    "Every community project deserves the same financial accountability infrastructure
                    that large organisations take for granted."
                  </p>
                </div>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 bg-[#06B6D4] hover:bg-[#0891B2] text-white font-semibold px-7 py-3 rounded-full transition-all hover:scale-105 hover:shadow-lg text-sm"
                >
                  Join the movement <i className="ri-arrow-right-line" />
                </Link>
              </div>
            </RevealDiv>

          </div>
        </div>
      </section>

      {/* ── PROBLEM ── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <RevealDiv className="text-center mb-16">
            <span className="text-[#06B6D4] text-sm font-bold uppercase tracking-widest">The Problem</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-3">The gap we are closing</h2>
            <p className="text-gray-400 mt-4 max-w-2xl mx-auto text-lg">
              Two failures occur together in social impact funding. Neither is solved by tools currently available to a small implementer.
            </p>
          </RevealDiv>

          <div className="grid md:grid-cols-2 gap-8">
            {PROBLEMS.map((p,i)=>(
              <RevealDiv key={p.title} direction={i===0?'left':'right'} delay={i*100}>
                <div className="bg-[#F5F6FA] rounded-2xl p-8 border border-gray-100 hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 h-full">
                  <div className="w-12 h-12 bg-[#1B1D2F] rounded-xl flex items-center justify-center mb-5">
                    <i className={`${p.icon} text-xl text-[#06B6D4]`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{p.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{p.body}</p>
                </div>
              </RevealDiv>
            ))}
          </div>

          <RevealDiv className="mt-10" delay={200}>
            <p className="text-center text-gray-400 max-w-2xl mx-auto text-base italic border-l-4 border-[#06B6D4] pl-5 text-left">
              "Trustworthy projects struggle to get funded, and funded projects struggle to prove that funding was used well.
              Gocelerate addresses both sides of that gap within one platform."
            </p>
          </RevealDiv>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 px-6 bg-[#F5F6FA]">
        <div className="max-w-7xl mx-auto">
          <RevealDiv className="text-center mb-12">
            <span className="text-[#06B6D4] text-sm font-bold uppercase tracking-widest">How It Works</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-3">Built for both sides of impact</h2>
            <p className="text-gray-400 mt-4 max-w-xl mx-auto text-lg">
              Whether you run projects or fund them, Gocelerate gives you a clear, structured path.
            </p>
          </RevealDiv>

          {/* Tab toggle */}
          <RevealDiv className="flex justify-center mb-12">
            <div className="inline-flex bg-white border border-gray-200 rounded-full p-1 shadow-sm">
              {(['implementer','funder'] as const).map(tab=>(
                <button
                  key={tab}
                  onClick={()=>setActiveTab(tab)}
                  className={`px-6 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 ${
                    activeTab===tab ? 'bg-[#1B1D2F] text-white shadow-md scale-[1.02]' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <i className={`${tab==='implementer'?'ri-team-line':'ri-funds-line'} mr-2`} />
                  {tab==='implementer'?'I Run Projects':'I Fund Projects'}
                </button>
              ))}
            </div>
          </RevealDiv>

          {/* Steps */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(activeTab==='implementer'?IMPL_STEPS:FUNDER_STEPS).map((s,i)=>(
              <RevealDiv key={s.title} delay={i*120} direction="up">
                <div className="relative bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-elevated hover:-translate-y-1 transition-all duration-300 h-full group">
                  <div className="text-6xl font-black text-gray-100 absolute top-4 right-4 leading-none select-none group-hover:text-[#06B6D4]/10 transition-colors duration-300">{s.step}</div>
                  <div className="w-11 h-11 bg-[#06B6D4]/10 group-hover:bg-[#06B6D4]/20 rounded-xl flex items-center justify-center mb-4 transition-colors">
                    <i className={`${s.icon} text-xl text-[#06B6D4]`} />
                  </div>
                  <h3 className="font-bold text-gray-900 text-base mb-2">{s.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </RevealDiv>
            ))}
          </div>

          <RevealDiv className="mt-10 text-center" delay={400}>
            <Link to="/register" className="inline-flex items-center gap-2 bg-[#1B1D2F] hover:bg-[#111827] text-white font-semibold px-8 py-3.5 rounded-full transition-all hover:scale-105 hover:shadow-xl">
              {activeTab==='implementer'?'Register Your Project':'Start Browsing Projects'}
              <i className="ri-arrow-right-line" />
            </Link>
          </RevealDiv>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <RevealDiv className="text-center mb-16">
            <span className="text-[#06B6D4] text-sm font-bold uppercase tracking-widest">Features</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-3">Everything accountability requires</h2>
            <p className="text-gray-400 mt-4 max-w-xl mx-auto text-lg">
              Every feature was chosen to close the gap between a funding commitment and a verified outcome.
            </p>
          </RevealDiv>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f,i)=>(
              <RevealDiv key={f.title} delay={i*80} direction="scale">
                <div className="group p-6 rounded-2xl border border-gray-100 hover:border-[#06B6D4]/40 hover:shadow-elevated transition-all duration-300 bg-white hover:-translate-y-1 h-full cursor-default">
                  <div className="w-11 h-11 bg-[#1B1D2F] group-hover:bg-[#06B6D4] rounded-xl flex items-center justify-center mb-4 transition-colors duration-300">
                    <i className={`${f.icon} text-xl text-white`} />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 group-hover:text-[#1B1D2F]">{f.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </RevealDiv>
            ))}
          </div>
        </div>
      </section>

      {/* ── SDGs ── */}
      <section id="sdgs" className="py-24 px-6 bg-[#F5F6FA]">
        <div className="max-w-7xl mx-auto">
          <RevealDiv className="text-center mb-16">
            <span className="text-[#06B6D4] text-sm font-bold uppercase tracking-widest">Global Impact</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-3">Aligned with 6 UN SDGs</h2>
            <p className="text-gray-400 mt-4 max-w-xl mx-auto text-lg">
              Gocelerate is built around a documented gap inside several Sustainable Development Goals.
            </p>
          </RevealDiv>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SDGS.map((s,i)=>(
              <RevealDiv key={s.num} delay={i*100} direction="up">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex gap-4 hover:shadow-elevated hover:-translate-y-1 transition-all duration-300 h-full group">
                  <div
                    className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center text-white font-black text-lg group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: s.color }}
                  >
                    {s.num}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm mb-1">SDG {s.num} — {s.title}</p>
                    <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </RevealDiv>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROLES ── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <RevealDiv className="text-center mb-16">
            <span className="text-[#06B6D4] text-sm font-bold uppercase tracking-widest">Two Roles, One System</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-3">Choose how you participate</h2>
          </RevealDiv>

          <div className="grid md:grid-cols-2 gap-8">
            <RevealDiv direction="left">
              <div className="relative overflow-hidden rounded-3xl bg-[#1B1D2F] p-8 text-white h-full hover:shadow-2xl transition-all duration-500 group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#06B6D4]/8 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-700" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#06B6D4]/5 rounded-full translate-y-1/2 -translate-x-1/4" />
                <div className="relative">
                  <div className="w-14 h-14 bg-[#06B6D4]/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <i className="ri-team-line text-2xl text-[#06B6D4]" />
                  </div>
                  <div className="inline-flex items-center gap-1.5 bg-white/10 text-white/60 text-xs font-medium px-3 py-1 rounded-full mb-4">For NGOs, CBOs & Founders</div>
                  <h3 className="text-2xl font-bold mb-3">Implementer</h3>
                  <p className="text-white/55 leading-relaxed mb-6">
                    You run the projects. Register your initiative, map out your milestones, and log expenses as they happen.
                    Your dashboard gives funders a live, verified view of how their money is being used.
                  </p>
                  <ul className="space-y-2.5 mb-8">
                    {['Create and manage projects','Add milestone plans','Log expenses against milestones','Share instant reports with funders'].map(item=>(
                      <li key={item} className="flex items-center gap-2.5 text-sm text-white/60">
                        <i className="ri-check-line text-[#06B6D4]" /> {item}
                      </li>
                    ))}
                  </ul>
                  <Link to="/register?role=IMPLEMENTER" className="inline-flex items-center gap-2 bg-[#06B6D4] hover:bg-[#0891B2] text-white font-semibold px-6 py-3 rounded-full transition-all hover:scale-105 text-sm">
                    Register as Implementer <i className="ri-arrow-right-line" />
                  </Link>
                </div>
              </div>
            </RevealDiv>

            <RevealDiv direction="right">
              <div className="relative overflow-hidden rounded-3xl bg-[#F5F6FA] border border-gray-100 p-8 h-full hover:shadow-elevated transition-all duration-500 group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#06B6D4]/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-700" />
                <div className="relative">
                  <div className="w-14 h-14 bg-[#1B1D2F]/8 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <i className="ri-funds-line text-2xl text-[#1B1D2F]" />
                  </div>
                  <div className="inline-flex items-center gap-1.5 bg-[#1B1D2F]/8 text-[#1B1D2F]/60 text-xs font-medium px-3 py-1 rounded-full mb-4">For Donors, Foundations & Investors</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Funder</h3>
                  <p className="text-gray-500 leading-relaxed mb-6">
                    You back the impact. Browse every registered project on the platform, pledge your support, and track exactly how
                    funds are used — without chasing updates or waiting for quarterly reports.
                  </p>
                  <ul className="space-y-2.5 mb-8">
                    {['Browse all registered projects','Pledge funds to any project','Track live milestone progress','Access structured expense reports'].map(item=>(
                      <li key={item} className="flex items-center gap-2.5 text-sm text-gray-500">
                        <i className="ri-check-line text-[#06B6D4]" /> {item}
                      </li>
                    ))}
                  </ul>
                  <Link to="/register?role=FUNDER" className="inline-flex items-center gap-2 bg-[#1B1D2F] hover:bg-[#111827] text-white font-semibold px-6 py-3 rounded-full transition-all hover:scale-105 text-sm">
                    Register as Funder <i className="ri-arrow-right-line" />
                  </Link>
                </div>
              </div>
            </RevealDiv>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 bg-[#1B1D2F] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#06B6D4]/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s' }} />
        </div>
        <RevealDiv className="max-w-3xl mx-auto text-center relative">
          <div className="w-16 h-16 bg-[#06B6D4]/20 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
            <i className="ri-rocket-line text-3xl text-[#06B6D4]" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">Ready to accelerate impact?</h2>
          <p className="text-white/45 text-lg mb-10 leading-relaxed">
            Join implementers and funders building a more accountable, more transparent Nigerian social impact sector.
            No payment required to get started.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register" className="bg-[#06B6D4] hover:bg-[#0891B2] text-white font-semibold px-8 py-4 rounded-full transition-all hover:scale-105 hover:shadow-xl text-base">
              Create a Free Account
            </Link>
            <Link to="/login" className="border border-white/20 hover:border-white/50 text-white/70 hover:text-white font-semibold px-8 py-4 rounded-full transition-all hover:scale-105 text-base">
              Sign In to Your Account
            </Link>
          </div>
        </RevealDiv>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#111827] py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-10 mb-10">
            <div className="max-w-xs">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-lg bg-[#06B6D4] flex items-center justify-center">
                  <i className="ri-rocket-line text-white text-base" />
                </div>
                <span className="text-white font-bold text-lg">Gocelerate</span>
              </div>
              <p className="text-white/35 text-sm leading-relaxed">
                Connecting Nigerian social impact projects with funders through transparent, milestone-based accountability.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-10">
              {[
                { title: 'Platform', links: [['#features','Features'],['#how-it-works','How It Works'],['#sdgs','SDG Impact']] },
                { title: 'Account',  links: [['/register','Sign Up'],['/login','Sign In'],['/register?role=IMPLEMENTER','Implementer'],['/register?role=FUNDER','Funder']] },
                { title: 'Context',  links: [['#','Nigerian NGOs'],['#','SDG Alignment'],['#','Social Impact'],['#','COS 202 Project']] },
              ].map(col=>(
                <div key={col.title}>
                  <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-3">{col.title}</p>
                  <ul className="space-y-2">
                    {col.links.map(([href,label])=>(
                      <li key={label}>
                        {href.startsWith('/') ? (
                          <Link to={href} className="text-white/35 hover:text-white/70 text-sm transition-colors">{label}</Link>
                        ) : (
                          <a href={href} className="text-white/35 hover:text-white/70 text-sm transition-colors">{label}</a>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-white/25 text-xs">© 2026 Gocelerate. Built for Nigeria's social impact sector.</p>
            <p className="text-white/15 text-xs">Aligned with UN SDGs 1, 8, 9, 10, 16 & 17</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
