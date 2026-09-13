import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/agents': 'Agents',
  '/settings': 'Settings',
};

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const title = pageTitles[location.pathname] ?? 'AgntSpark Console';

  return (
    <div className="flex h-screen overflow-hidden bg-surface-0 text-slate-200">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center border-b border-surface-3 bg-surface-1 px-6">
          <h1 className="text-lg font-semibold text-white">{title}</h1>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
