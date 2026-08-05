import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { login as loginApi } from '../../api/auth';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors]     = useState<Record<string, string>>({});
  const [loading, setLoading]   = useState(false);
  const [apiError, setApiError] = useState('');

  function validate() {
    const e: Record<string, string> = {};
    if (!email)    e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError('');
    try {
      const { data } = await loginApi(email, password);
      login(data.token, data.user);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setApiError(msg ?? 'Invalid email or password');
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
          No account?{' '}
          <Link to="/register" className="text-[#1B1D2F] font-semibold hover:underline">Create one free</Link>
        </p>
      </nav>

      <div className="flex-1 flex">
        {/* Left panel — branding */}
        <div className="hidden lg:flex flex-col justify-between w-1/2 bg-[#1B1D2F] p-16">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 text-[#06B6D4] text-xs font-semibold px-4 py-1.5 rounded-full mb-8 border border-[#06B6D4]/30">
              <i className="ri-map-pin-line" /> Nigeria's Impact Accountability Platform
            </div>
            <h2 className="text-4xl font-bold text-white leading-tight mb-4">
              Welcome back to<br />
              <span className="text-[#06B6D4]">Gocelerate</span>
            </h2>
            <p className="text-white/50 text-base leading-relaxed max-w-sm">
              Track milestones, log expenses, and prove outcomes — one shared system for implementers and funders.
            </p>
          </div>

          {/* Mini stats */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Projects Tracked', value: '150+', icon: 'ri-folder-line' },
              { label: 'Funds Monitored', value: '₦500M+', icon: 'ri-money-dollar-circle-line' },
              { label: 'Milestones Logged', value: '1,200+', icon: 'ri-flag-line' },
              { label: 'SDGs Addressed', value: '6', icon: 'ri-earth-line' },
            ].map(s => (
              <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <i className={`${s.icon} text-[#06B6D4] text-lg mb-2 block`} />
                <p className="text-white font-bold text-lg">{s.value}</p>
                <p className="text-white/40 text-xs">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel — form */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm">
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-[#1B1D2F] flex items-center justify-center mx-auto mb-4">
                <i className="ri-login-circle-line text-2xl text-[#06B6D4]" />
              </div>
              <h1 className="text-2xl font-bold text-[#1B1D2F] mb-1">Sign in to your account</h1>
              <p className="text-gray-400 text-sm">Enter your credentials to continue</p>
            </div>

            {apiError && (
              <div className="mb-5 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 flex items-center gap-2">
                <i className="ri-error-warning-line" /> {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                prefixIcon="ri-mail-line"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
              />
              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                prefixIcon="ri-lock-line"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
              />

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" className="w-4 h-4 rounded accent-[#1B1D2F]" />
                  <span className="text-gray-500">Remember me</span>
                </label>
              </div>

              <Button type="submit" className="w-full" loading={loading}>
                Sign In <i className="ri-arrow-right-line ml-2" />
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-400">
                Don't have an account?{' '}
                <Link to="/register" className="text-[#1B1D2F] font-semibold hover:underline">
                  Create one free
                </Link>
              </p>
              <p className="text-xs text-gray-300 mt-4">
                <Link to="/" className="hover:text-gray-400 transition-colors">
                  <i className="ri-arrow-left-line mr-1" /> Back to home
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
