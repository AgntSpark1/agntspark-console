import { NavLink, useNavigate } from 'react-router-dom';
import { Bot, LayoutDashboard, LogOut, Settings } from 'lucide-react';
import BrandMark from './BrandMark';
import clsx from 'clsx';
import { useLogout, useMe } from '../hooks/useAuth';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/agents', label: 'Agents', icon: Bot },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const meQ = useMe();
  const logout = useLogout();
  const navigate = useNavigate();
  const me = meQ.data;

  const initials = me?.name
    ? me.name
        .split(/\s+/)
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '··';

  return (
    <aside className="flex h-full w-60 flex-col border-r border-surface-3 bg-surface-1">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <BrandMark className="h-8 w-8 shrink-0 text-slate-100" />
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-white">AgntSpark</span>
          <span className="text-[11px] text-slate-500">Console</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-500/10 text-brand-300'
                  : 'text-slate-400 hover:bg-surface-2 hover:text-slate-200',
              )
            }
          >
            <Icon className="h-4.5 w-4.5 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-surface-3 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-3 text-xs font-semibold text-slate-300">
            {initials}
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-xs font-medium text-slate-300">{me?.name ?? '…'}</span>
            <span className="truncate text-[11px] text-slate-500">{me?.email ?? ''}</span>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/login', { replace: true });
            }}
            aria-label="Sign out"
            title="Sign out"
            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-surface-2 hover:text-slate-300"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
