import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, Menu, Plus, Search, UserRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';

function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onClick = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full py-1 pr-2 pl-1 transition-colors hover:bg-slate-100"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Avatar user={user} size="sm" />
        <span className="hidden text-sm font-medium text-slate-700 md:block">{user?.name.split(' ')[0]}</span>
        <ChevronDown className="hidden h-4 w-4 text-slate-400 md:block" aria-hidden />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 mt-2 w-60 animate-pop-in overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-900/10">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="truncate text-sm font-semibold text-slate-900">{user?.name}</p>
            <p className="truncate text-xs text-slate-500">{user?.email}</p>
          </div>
          <div className="p-1">
            <Link role="menuitem" to="/app/profile" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
              <UserRound className="h-4 w-4 text-slate-400" aria-hidden /> Profile & settings
            </Link>
            <button role="menuitem" type="button" onClick={logout} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
              <LogOut className="h-4 w-4 text-slate-400" aria-hidden /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Topbar({ onMenuClick, onNewProject }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const onSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/app/projects?search=${encodeURIComponent(q)}` : '/app/projects');
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200/80 bg-white/85 px-4 backdrop-blur-md sm:px-6">
      <button type="button" onClick={onMenuClick} className="-ml-1 rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden" aria-label="Open navigation">
        <Menu className="h-5 w-5" />
      </button>
      <form onSubmit={onSearch} className="relative max-w-md flex-1" role="search">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search projects…"
          aria-label="Search projects"
          className="h-9 w-full rounded-lg border border-transparent bg-slate-100 pr-3 pl-9 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100 focus:outline-none"
        />
      </form>
      <div className="ml-auto flex items-center gap-2">
        <Button size="sm" onClick={onNewProject} className="hidden sm:inline-flex">
          <Plus className="h-4 w-4" aria-hidden /> New project
        </Button>
        <UserMenu />
      </div>
    </header>
  );
}
