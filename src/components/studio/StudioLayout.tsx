import type { ReactNode } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, MessageSquare } from 'lucide-react';
import clsx from 'clsx';
import BrandMark from '../BrandMark';
import LanguagePicker from '../LanguagePicker';
import { useLogout } from '../../hooks/useAuth';
import { useI18n } from '../../i18n';

// Phone-first shell for builders: a slim top bar, content in one column.
export default function StudioLayout({ children }: { children: ReactNode }) {
  const logout = useLogout();
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <div className="studio-bg flex min-h-[100dvh] flex-col text-slate-200">
      <header className="sticky top-0 z-20 border-b border-white/5 bg-surface-0/80 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-2 px-4">
          <Link to="/studio" className="flex items-center gap-2">
            <BrandMark className="h-7 w-7 text-slate-100" />
            <span className="text-[15px] font-semibold tracking-tight text-white">AgntSpark</span>
            <span className="rounded-md bg-brand-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-300">
              Studio
            </span>
          </Link>
          <nav className="ml-auto flex items-center gap-0.5">
            <NavLink
              to="/studio"
              end
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm transition-colors',
                  isActive ? 'text-white' : 'text-slate-400 hover:bg-surface-2 hover:text-slate-200',
                )
              }
            >
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">{t('nav.assistants')}</span>
            </NavLink>
            <LanguagePicker />
            <Link
              to="/"
              title={t('nav.consoleTitle')}
              className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-slate-400 transition-colors hover:bg-surface-2 hover:text-slate-200"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">{t('nav.console')}</span>
            </Link>
            <button
              onClick={() => {
                logout();
                navigate('/login', { replace: true });
              }}
              aria-label={t('nav.signOut')}
              title={t('nav.signOut')}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-surface-2 hover:text-slate-300"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-5">
        {children}
      </main>
    </div>
  );
}
