import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Loader2, Sparkles } from 'lucide-react';
import clsx from 'clsx';
import { hasStoredToken, useLogin, useRegister } from '../hooks/useAuth';

const inputClass =
  'h-10 w-full rounded-lg border border-surface-3 bg-surface-2 px-3 text-sm text-slate-200 placeholder:text-slate-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500';

export default function Login() {
  const navigate = useNavigate();
  const login = useLogin();
  const register = useRegister();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  if (hasStoredToken()) return <Navigate to="/" replace />;

  const active = mode === 'login' ? login : register;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const onSuccess = () => navigate('/', { replace: true });
    if (mode === 'login') {
      login.mutate({ email, password }, { onSuccess });
    } else {
      register.mutate({ email, password, name }, { onSuccess });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-0 p-4 text-slate-200">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-white">AgntSpark Console</span>
        </div>

        <div className="rounded-2xl border border-surface-3 bg-surface-1 p-6">
          <div className="mb-5 grid grid-cols-2 gap-1 rounded-lg bg-surface-2 p-1">
            {(['login', 'register'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={clsx(
                  'rounded-md py-1.5 text-sm font-medium transition-colors',
                  mode === m ? 'bg-surface-1 text-white' : 'text-slate-400 hover:text-slate-200',
                )}
              >
                {m === 'login' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
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
                minLength={mode === 'register' ? 8 : 1}
                maxLength={72}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
              />
              {mode === 'register' && <p className="mt-1 text-[11px] text-slate-500">At least 8 characters.</p>}
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
              {mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
