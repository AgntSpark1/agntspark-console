import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Bot,
  Rocket,
  BarChart3,
  Settings,
  Sparkles,
} from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/agents', label: 'Agents', icon: Bot },
  { to: '/deploy', label: 'Deploy', icon: Rocket },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="flex h-full w-60 flex-col border-r border-surface-3 bg-surface-1">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-white">AgntSpark</span>
          <span className="text-[11px] text-slate-500">Console</span>
        </div>
      </div>

      {/* Nav */}
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

      {/* Footer */}
      <div className="border-t border-surface-3 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-3 text-xs font-semibold text-slate-300">
            AS
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-slate-300">admin</span>
            <span className="text-[11px] text-slate-500">admin@agntspark.io</span>
          </div>
        </div>
      </div>

      {/* Active route debug */}
      <div className="hidden text-[10px] text-slate-600">
        {location.pathname}
      </div>
    </aside>
  );
}
