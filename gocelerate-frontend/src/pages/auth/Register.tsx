import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { register as registerApi } from '../../api/auth';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

type Role = 'IMPLEMENTER' | 'FUNDER';

const ROLES: { id: Role; icon: string; label: string; tag: string; desc: string; bullets: string[] }[] = [
  {
    id: 'IMPLEMENTER',
    icon: 'ri-team-line',
    label: 'Implementer',
    tag: 'I run projects',
    desc: 'Register your social impact project, track milestones, log expenses, and generate reports for funders.',
    bullets: ['Create & manage projects', 'Add milestone plans', 'Log expenses', 'Generate reports'],
  },
  {
    id: 'FUNDER',
    icon: 'ri-funds-line',
    label: 'Funder',
    tag: 'I fund projects',
    desc: 'Browse every registered project, pledge funds to the ones you support, and monitor progress in real time.',
    bullets: ['Browse all projects', 'Pledge funds', 'Track milestone progress', 'Access verified reports'],
  },
];

export default function Register() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [params]  = useSearchParams();

  const initial = (params.get('role') === 'FUNDER' ? 'FUNDER' : 'IMPLEMENTER') as Role;

  const [fullName, setFullName] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole]         = useState<Role>(initial);
  const [errors, setErrors]     = useState<Record<string, string>>({});
  const [loading, setLoading]   = useState(false);
  const [apiError, setApiError] = useState('');

  function validate() {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = 'Full name is required';
    if (!email)           e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email';
    if (!password)        e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Minimum 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError('');
    try {
      const { data } = await registerApi(fullName, email, password, role);
      login(data.token, data.user);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setApiError(msg ?? 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F6FA] flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 h-16 bg-white border-b border-gray-100">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#06B6D4] flex items-center justify-center">
            <i className="ri-rocket-line text-white text-sm" />
          </div>
          <span className="font-bold text-[#1B1D2F] text-base">Gocelerate</span>
        </Link>
        <p className="text-sm text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-[#1B1D2F] font-semibold hover:underline">Sign In</Link>
        </p>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#1B1D2F] mb-2">Create your account</h1>
            <p className="text-gray-400">Join the platform connecting Nigerian social impact projects with funders.</p>
          </div>

          {/* Role selector */}
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            {ROLES.map(r => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id)}
                className={`text-left p-5 rounded-2xl border-2 transition-all ${
                  role === r.id
                    ? 'border-[#1B1D2F] bg-[#1B1D2F]'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                  role === r.id ? 'bg-[#06B6D4]/20' : 'bg-[#F5F6FA]'
                }`}>
                  <i className={`${r.icon} text-lg ${role === r.id ? 'text-[#06B6D4]' : 'text-gray-400'}`} />
                </div>
                <div className={`text-xs font-semibold uppercase tracking-wider mb-1 ${role === r.id ? 'text-[#06B6D4]' : 'text-gray-400'}`}>
                  {r.tag}
                </div>
                <p className={`font-bold text-base mb-1.5 ${role === r.id ? 'text-white' : 'text-gray-800'}`}>{r.label}</p>
                <p className={`text-xs leading-relaxed ${role === r.id ? 'text-white/60' : 'text-gray-400'}`}>{r.desc}</p>
                {role === r.id && (
                  <div className="absolute top-3 right-3">
                    <div className="w-5 h-5 bg-[#06B6D4] rounded-full flex items-center justify-center">
                      <i className="ri-check-line text-white text-xs" />
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Form card */}
          <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-8">
            {apiError && (
              <div className="mb-5 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 flex items-center gap-2">
                <i className="ri-error-warning-line" /> {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  type="text"
                  placeholder="Your full name"
                  prefixIcon="ri-user-line"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  error={errors.fullName}
                />
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  prefixIcon="ri-mail-line"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                />
              </div>
              <Input
                label="Password"
                type="password"
                placeholder="Minimum 6 characters"
                prefixIcon="ri-lock-line"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
              />

              <div className="flex items-start gap-2 pt-1">
                <input type="checkbox" required id="terms" className="mt-0.5 accent-[#1B1D2F]" />
                <label htmlFor="terms" className="text-sm text-gray-400 leading-relaxed cursor-pointer">
                  I agree to Gocelerate's terms of use and understand this platform tracks project accountability,
                  not real financial transactions.
                </label>
              </div>

              <Button type="submit" className="w-full" loading={loading}>
                Create {role === 'IMPLEMENTER' ? 'Implementer' : 'Funder'} Account
                <i className="ri-arrow-right-line ml-2" />
              </Button>
            </form>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            © 2026 Gocelerate · Built for Nigerian social impact
          </p>
        </div>
      </div>
    </div>
  );
}
