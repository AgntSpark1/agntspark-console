import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import BrandMark from '../components/BrandMark';
import { useConfirmPasswordReset, useRequestPasswordReset } from '../hooks/useAuth';
import { inputClass } from './Login';

const buttonClass =
  'flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-brand-500 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:opacity-50';

/** /reset-password asks for an email; the emailed link (?token=…) sets the new password. */
export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token');

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-0 p-4 text-slate-200">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-center gap-2.5">
          <BrandMark className="h-9 w-9 shrink-0 text-slate-100" />
          <span className="text-lg font-semibold text-white">AgntSpark Console</span>
        </div>
        <div className="rounded-2xl border border-surface-3 bg-surface-1 p-6">
          {token ? <ChooseNewPassword token={token} /> : <RequestLink />}
        </div>
        <p className="mt-4 text-center text-xs text-slate-500">
          <Link to="/login" className="hover:text-brand-300">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

function RequestLink() {
  const request = useRequestPasswordReset();
  const [email, setEmail] = useState('');

  if (request.isSuccess) {
    return (
      <div>
        <h1 className="text-base font-semibold text-white">Check your email</h1>
        <p className="mt-2 text-sm text-slate-400">
          If <span className="text-slate-200">{email}</span> has an AgntSpark account, a link to reset
          the password is on its way. It works once, for 30 minutes.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        request.mutate({ email });
      }}
      className="space-y-4"
    >
      <div>
        <h1 className="text-base font-semibold text-white">Reset your password</h1>
        <p className="mt-1 text-sm text-slate-500">We'll email you a link to choose a new one.</p>
      </div>
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
      {request.isError && (
        <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-xs text-rose-400">
          {(request.error as Error).message}
        </p>
      )}
      <button type="submit" disabled={request.isPending} className={buttonClass}>
        {request.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        Send reset link
      </button>
    </form>
  );
}

function ChooseNewPassword({ token }: { token: string }) {
  const confirm = useConfirmPasswordReset();
  const [password, setPassword] = useState('');
  const [repeat, setRepeat] = useState('');
  const mismatch = repeat.length > 0 && password !== repeat;

  if (confirm.isSuccess) {
    return (
      <div>
        <h1 className="text-base font-semibold text-white">Password updated</h1>
        <p className="mt-2 text-sm text-slate-400">
          You've been signed out everywhere else. Sign in with your new password.
        </p>
        <Link to="/login" className={`${buttonClass} mt-4`}>
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (password === repeat) confirm.mutate({ token, password });
      }}
      className="space-y-4"
    >
      <h1 className="text-base font-semibold text-white">Choose a new password</h1>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-xs text-slate-500">
          New password
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          maxLength={72}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
        <p className="mt-1 text-[11px] text-slate-500">At least 8 characters.</p>
      </div>
      <div>
        <label htmlFor="repeat" className="mb-1.5 block text-xs text-slate-500">
          Repeat new password
        </label>
        <input
          id="repeat"
          type="password"
          required
          maxLength={72}
          autoComplete="new-password"
          value={repeat}
          onChange={(e) => setRepeat(e.target.value)}
          className={inputClass}
        />
        {mismatch && <p className="mt-1 text-[11px] text-rose-400">The passwords don't match.</p>}
      </div>
      {confirm.isError && (
        <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-xs text-rose-400">
          {(confirm.error as Error).message}{' '}
          <Link to="/reset-password" className="underline">
            Request a new link
          </Link>
        </p>
      )}
      <button type="submit" disabled={confirm.isPending || mismatch} className={buttonClass}>
        {confirm.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        Set new password
      </button>
    </form>
  );
}
