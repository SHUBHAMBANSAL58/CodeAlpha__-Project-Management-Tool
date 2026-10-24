import { NavLink } from 'react-router-dom';
import { CheckSquare, FolderKanban, LayoutDashboard, LogOut, Plus, UserRound, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';
import Avatar from '../ui/Avatar';
import Logo from './Logo';

const NAV = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/projects', label: 'Projects', icon: FolderKanban },
  { to: '/app/tasks', label: 'My Tasks', icon: CheckSquare },
  { to: '/app/profile', label: 'Profile & Settings', icon: UserRound },
];

function SidebarContent({ onNavigate, onNewProject, onClose }) {
  const { user, logout } = useAuth();
  return (
    <div className="flex h-full flex-col bg-slate-950 text-slate-300">
      <div className="flex h-16 items-center justify-between px-5">
        <Logo inverted />
        {onClose && (
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden" aria-label="Close navigation">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="px-3 pt-2">
        <button
          type="button"
          onClick={() => { onNewProject(); onNavigate?.(); }}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-white ring-1 ring-white/10 transition-colors hover:bg-white/15"
        >
          <Plus className="h-4 w-4" aria-hidden /> New project
        </button>
      </div>

      <nav className="mt-6 flex-1 space-y-1 px-3" aria-label="Main">
        <p className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">Workspace</p>
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) => cn(
              'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive ? 'bg-brand-600/15 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-slate-100',
            )}
          >
            {({ isActive }) => (
              <>
                <Icon className={cn('h-[18px] w-[18px]', isActive ? 'text-brand-400' : 'text-slate-500 group-hover:text-slate-300')} aria-hidden />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <Avatar user={user} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{user?.name}</p>
            <p className="truncate text-xs text-slate-500">{user?.email}</p>
          </div>
          <button type="button" onClick={logout} className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white/10 hover:text-white" aria-label="Sign out" title="Sign out">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({ mobileOpen, onMobileClose, onNewProject }) {
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">
        <SidebarContent onNewProject={onNewProject} />
      </aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 animate-fade-in bg-slate-950/50" onClick={onMobileClose} aria-hidden />
          <aside className="relative h-full w-72 max-w-[85vw] animate-slide-in shadow-2xl">
            <SidebarContent onNavigate={onMobileClose} onClose={onMobileClose} onNewProject={onNewProject} />
          </aside>
        </div>
      )}
    </>
  );
}
