import type { ReactNode } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, MessageSquare } from 'lucide-react';
import clsx from 'clsx';
import BrandMark from '../BrandMark';
import { useLogout } from '../../hooks/useAuth';

// Phone-first shell for builders: a slim top bar, content in one column.
export default function StudioLayout({ children }: { children: ReactNode }) {
  const logout = useLogout();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[100dvh] flex-col bg-surface-0 text-slate-200">
      <header className="sticky top-0 z-10 border-b border-surface-3 bg-surface-1/95 pt-[env(safe-area-inset-top)] backdrop-blur">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-3 px-4">
          <Link to="/studio" className="flex items-center gap-2">
            <BrandMark className="h-7 w-7 text-slate-100" />
            <span className="text-sm font-semibold text-white">AgntSpark</span>
          </Link>
          <nav className="ml-auto flex items-center gap-1">
            <NavLink
              to="/studio"
              end
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm',
                  isActive ? 'text-brand-300' : 'text-slate-400 hover:text-slate-200',
                )
              }
            >
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Assistants</span>
            </NavLink>
            <Link
              to="/"
              title="Developer console"
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-slate-400 hover:text-slate-200"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Console</span>
            </Link>
            <button
              onClick={() => {
                logout();
                navigate('/login', { replace: true });
              }}
              aria-label="Sign out"
              title="Sign out"
              className="rounded-lg p-2 text-slate-500 hover:text-slate-300"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4">
        {children}
      </main>
    </div>
  );
}
