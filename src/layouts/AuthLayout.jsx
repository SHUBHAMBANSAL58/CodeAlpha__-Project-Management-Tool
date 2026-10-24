import { Link, Outlet } from 'react-router-dom';
import { BarChart3, KanbanSquare, Users } from 'lucide-react';
import Logo from '../components/layout/Logo';

const POINTS = [
  { icon: KanbanSquare, text: 'Kanban boards and task tables that stay in sync' },
  { icon: Users, text: 'Assign work to teammates with clear ownership' },
  { icon: BarChart3, text: 'Live progress, deadlines, and overdue alerts' },
];

export default function AuthLayout() {
  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <div className="relative hidden overflow-hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col">
        <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-brand-600/30 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" aria-hidden />
        <Link to="/" className="relative"><Logo inverted /></Link>
        <div className="relative mt-auto max-w-md">
          <h2 className="text-3xl leading-tight font-bold">Every project, every deadline, one steady rhythm.</h2>
          <ul className="mt-8 space-y-4">
            {POINTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-slate-300">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-brand-300"><Icon className="h-5 w-5" aria-hidden /></span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative mt-12 text-sm text-slate-500">© {new Date().getFullYear()} Cadence</p>
      </div>
      <div className="flex flex-col px-6 py-10 sm:px-12">
        <Link to="/" className="lg:hidden"><Logo /></Link>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
