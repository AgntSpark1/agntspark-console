import { useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import BrandMark from '../components/BrandMark';
import LanguagePicker from '../components/LanguagePicker';
import clsx from 'clsx';
import { hasStoredToken, useLogin, useRegister, useRegistrationMode } from '../hooks/useAuth';
import { useI18n } from '../i18n';

const inputClass =
  'h-10 w-full rounded-lg border border-surface-3 bg-surface-2 px-3 text-sm text-slate-200 placeholder:text-slate-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500';

export default function Login() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [params] = useSearchParams();
  // Invite links look like /login?invite=inv_…
  const inviteFromLink = params.get('invite') ?? '';
  // Where to go after signing in: the page that sent us here, else the
  // builder app (most people come to make an assistant).
  const nextParam = params.get('next') ?? '';
  const next = nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : '/studio';

  const login = useLogin();
  const register = useRegister();
  const registrationQ = useRegistrationMode();
  const registration = registrationQ.data ?? 'open';

  const [mode, setMode] = useState<'login' | 'register'>(inviteFromLink ? 'register' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [inviteCode, setInviteCode] = useState(inviteFromLink);

  if (hasStoredToken()) return <Navigate to={next} replace />;

  const canRegister = registration !== 'closed';
  const activeMode = canRegister ? mode : 'login';
  const active = activeMode === 'login' ? login : register;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const onSuccess = () => navigate(next, { replace: true });
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
    <div className="studio-bg relative flex min-h-[100dvh] items-center justify-center p-4 text-slate-200">
      <div className="absolute right-3 top-[calc(0.75rem+env(safe-area-inset-top))]">
        <LanguagePicker />
      </div>
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <BrandMark className="h-11 w-11 shrink-0 text-slate-100" />
          <span className="text-xl font-semibold tracking-tight text-white">AgntSpark</span>
          <p className="max-w-xs text-sm text-slate-400">{t('login.tagline')}</p>
        </div>

        <div className="rounded-2xl border border-white/5 bg-surface-1/90 p-6 shadow-2xl shadow-black/40 backdrop-blur">
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
                  {m === 'login' ? t('login.signIn') : t('login.createAccount')}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {activeMode === 'register' && registration === 'invite' && (
              <div>
                <label htmlFor="invite" className="mb-1.5 block text-xs text-slate-500">
                  {t('login.inviteCode')}
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
                  {t('login.inviteNote')}
                </p>
              </div>
            )}
            {activeMode === 'register' && (
              <div>
                <label htmlFor="name" className="mb-1.5 block text-xs text-slate-500">
                  {t('login.name')}
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
                {t('login.email')}
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
                {t('login.password')}
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
                <p className="mt-1 text-[11px] text-slate-500">{t('login.passwordHint')}</p>
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
              {activeMode === 'login' ? t('login.signIn') : t('login.createAccount')}
            </button>
          </form>

          {!canRegister && (
            <p className="mt-4 text-center text-[11px] text-slate-500">{t('login.closed')}</p>
          )}
        </div>
      </div>
    </div>
  );
}
