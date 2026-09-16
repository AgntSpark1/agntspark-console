import { useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import BrandMark from '../components/BrandMark';
import clsx from 'clsx';
import { hasStoredToken, useLogin, useRegister, useRegistrationMode } from '../hooks/useAuth';

const inputClass =
  'h-10 w-full rounded-lg border border-surface-3 bg-surface-2 px-3 text-sm text-slate-200 placeholder:text-slate-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500';

export default function Login() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  // Invite links look like /login?invite=inv_…
  const inviteFromLink = params.get('invite') ?? '';

  const login = useLogin();
  const register = useRegister();
  const registrationQ = useRegistrationMode();
  const registration = registrationQ.data ?? 'open';

  const [mode, setMode] = useState<'login' | 'register'>(inviteFromLink ? 'register' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [inviteCode, setInviteCode] = useState(inviteFromLink);

  if (hasStoredToken()) return <Navigate to="/" replace />;

  const canRegister = registration !== 'closed';
  const activeMode = canRegister ? mode : 'login';
  const active = activeMode === 'login' ? login : register;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const onSuccess = () => navigate('/', { replace: true });
    if (activeMode === 'login') {
      login.mutate({ email, password }, { onSuccess });
    } else {
      register.mutate(
        { email, password, name, invite_code: inviteCode.trim() || undefined },
        { onSuccess },
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-0 p-4 text-slate-200">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-center gap-2.5">
          <BrandMark className="h-9 w-9 shrink-0 text-slate-100" />
          <span className="text-lg font-semibold text-white">AgntSpark Console</span>
        </div>

        <div className="rounded-2xl border border-surface-3 bg-surface-1 p-6">
          {canRegister && (
            <div className="mb-5 grid grid-cols-2 gap-1 rounded-lg bg-surface-2 p-1">
              {(['login', 'register'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={clsx(
                    'rounded-md py-1.5 text-sm font-medium transition-colors',
                    activeMode === m ? 'bg-surface-1 text-white' : 'text-slate-400 hover:text-slate-200',
                  )}
                >
                  {m === 'login' ? 'Sign in' : 'Create account'}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {activeMode === 'register' && registration === 'invite' && (
              <div>
                <label htmlFor="invite" className="mb-1.5 block text-xs text-slate-500">
                  Invite code
                </label>
                <input
                  id="invite"
                  required
                  autoComplete="off"
                  maxLength={128}
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="inv_…"
                  className={`${inputClass} font-mono`}
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  AgntSpark is in private alpha — accounts need an invite.
                </p>
              </div>
            )}
            {activeMode === 'register' && (
              <div>
                <label htmlFor="name" className="mb-1.5 block text-xs text-slate-500">
                  Name
                </label>
                <input
                  id="name"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                />
              </div>
            )}
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs text-slate-500">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs text-slate-500">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={activeMode === 'register' ? 8 : 1}
                maxLength={72}
                autoComplete={activeMode === 'login' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
              />
              {activeMode === 'register' && (
                <p className="mt-1 text-[11px] text-slate-500">At least 8 characters.</p>
              )}
            </div>

            {active.isError && (
              <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-xs text-rose-400">
                {(active.error as Error).message}
              </p>
            )}

            <button
              type="submit"
              disabled={active.isPending}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-brand-500 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
            >
              {active.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {activeMode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          {!canRegister && (
            <p className="mt-4 text-center text-[11px] text-slate-500">New accounts are currently closed.</p>
          )}
        </div>
      </div>
    </div>
  );
}
