import { useState, type FormEvent } from 'react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Settings() {
  const { user } = useAuth();

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw]         = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [errors, setErrors]       = useState<Record<string, string>>({});
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState('');
  const [apiError, setApiError]   = useState('');

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'GC';

  function validate() {
    const e: Record<string, string> = {};
    if (!currentPw) e.currentPw = 'Current password required';
    if (!newPw || newPw.length < 8) e.newPw = 'New password must be at least 8 characters';
    if (newPw !== confirmPw) e.confirmPw = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError('');
    setSuccess('');
    try {
      await api.post('/api/auth/change-password', { currentPassword: currentPw, newPassword: newPw });
      setSuccess('Password updated successfully.');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setApiError(msg ?? 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile */}
      <Card>
        <h3 className="font-semibold text-ink mb-5">Profile</h3>
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-sidebar flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="space-y-1.5">
            <p className="text-lg font-bold text-ink">{user?.fullName ?? '—'}</p>
            <p className="text-sm text-muted">{user?.email ?? '—'}</p>
            <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full
              ${user?.role === 'IMPLEMENTER' ? 'bg-[#ecfdf5] text-[#059669]' : 'bg-[#eff6ff] text-[#1d4ed8]'}`}
            >
              {user?.role ?? '—'}
            </span>
          </div>
        </div>
      </Card>

      {/* Security */}
      <Card>
        <h3 className="font-semibold text-ink mb-5">Change Password</h3>

        {success && (
          <div className="mb-5 p-3 bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg text-sm text-success">
            {success}
          </div>
        )}
        {apiError && (
          <div className="mb-5 p-3 bg-[#fef2f2] border border-[#fecaca] rounded-lg text-sm text-danger">
            {apiError}
          </div>
        )}

        <form onSubmit={handleChangePassword} noValidate className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            value={currentPw}
            onChange={(e) => setCurrentPw(e.target.value)}
            error={errors.currentPw}
            placeholder="Enter current password"
          />
          <Input
            label="New Password"
            type="password"
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            error={errors.newPw}
            placeholder="At least 8 characters"
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
            error={errors.confirmPw}
            placeholder="Repeat new password"
          />
          <div className="pt-2">
            <Button type="submit" loading={loading}>
              Update Password
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
