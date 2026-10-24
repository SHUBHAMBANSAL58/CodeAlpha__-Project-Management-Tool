import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, BarChart3, CalendarClock, KanbanSquare, ShieldCheck, Users, ListFilter } from 'lucide-react';
import Logo from '../components/layout/Logo';
import Avatar from '../components/ui/Avatar';
import { PriorityBadge } from '../components/ui/Badge';
import { buttonClasses } from '../components/ui/Button';
import ProgressBar from '../components/ui/ProgressBar';
import { useAuth } from '../context/AuthContext';
import { TASK_STATUSES } from '../utils/constants';
import { cn } from '../utils/cn';

const FEATURES = [
  { icon: KanbanSquare, title: 'Boards and lists', text: 'Drag tasks across To Do, In Progress, In Review, and Completed, or work through a sortable table.' },
  { icon: Users, title: 'Team ownership', text: 'Owners invite teammates, and only project members can be assigned work, so responsibility stays clear.' },
  { icon: CalendarClock, title: 'Deadlines that matter', text: 'Tasks are checked against the project timeline, and overdue work is flagged everywhere it appears.' },
  { icon: BarChart3, title: 'Live dashboard', text: 'Totals, status breakdowns, upcoming deadlines, and activity are all calculated from your real tasks.' },
  { icon: ListFilter, title: 'Find anything fast', text: 'Search projects and filter tasks by status, priority, assignee, and deadline in a couple of clicks.' },
  { icon: ShieldCheck, title: 'Permission-aware', text: 'Clear feedback when you can view but not change something, and no access to projects you are not on.' },
];

const PREVIEW = {
  todo: [{ t: 'Migrate blog content', p: 'medium', u: { id: 'u2', name: 'Marcus Chen' }, overdue: true }, { t: 'Cross-browser QA pass', p: 'urgent', u: { id: 'u4', name: 'Diego Alvarez' } }],
  in_progress: [{ t: 'Responsive component library', p: 'high', u: { id: 'u2', name: 'Marcus Chen' } }],
  in_review: [{ t: 'Accessibility test plan', p: 'medium', u: { id: 'u4', name: 'Diego Alvarez' } }],
  completed: [{ t: 'Homepage hero design', p: 'high', u: { id: 'u3', name: 'Priya Natarajan' } }, { t: 'Information architecture audit', p: 'medium', u: { id: 'u3', name: 'Priya Natarajan' } }],
};

function ProductPreview() {
  return (
    <div className="relative mx-auto mt-16 max-w-5xl">
      <div className="pointer-events-none absolute -inset-x-10 -top-10 bottom-0 rounded-[3rem] bg-linear-to-b from-brand-200/40 to-transparent blur-2xl" aria-hidden />
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10" aria-hidden>
        <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/80 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" /><span className="h-2.5 w-2.5 rounded-full bg-slate-300" /><span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          <span className="ml-3 text-xs font-medium text-slate-500">Website Redesign · Board</span>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <p className="font-display text-lg font-bold text-slate-900">Website Redesign</p>
            <ProgressBar value={29} showLabel className="mt-2 max-w-sm" />
          </div>
          <div className="flex gap-6 text-sm">
            <span><b className="tabular-nums">7</b> <span className="text-slate-500">tasks</span></span>
            <span className="text-rose-600"><b className="tabular-nums">1</b> overdue</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 px-5 pb-5 md:grid-cols-4">
          {TASK_STATUSES.map((s) => (
            <div key={s.value} className={cn('rounded-xl p-2.5', s.column)}>
              <p className="mb-2 flex items-center gap-1.5 px-1 text-xs font-semibold text-slate-700"><span className={cn('h-1.5 w-1.5 rounded-full', s.dot)} />{s.label}</p>
              <div className="space-y-2">
                {PREVIEW[s.value].map((card) => (
                  <div key={card.t} className={cn('rounded-lg border bg-white p-2.5 shadow-xs', card.overdue ? 'border-rose-200' : 'border-slate-200/80')}>
                    <div className="flex items-center justify-between"><PriorityBadge priority={card.p} /><Avatar user={card.u} size="xs" /></div>
                    <p className="mt-2 text-xs font-medium text-slate-800">{card.t}</p>
                    {card.overdue && <p className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-rose-600"><AlertTriangle className="h-3 w-3" />2d overdue</p>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const primary = isAuthenticated ? { to: '/app', label: 'Open your dashboard' } : { to: '/register', label: 'Get started free' };

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Logo />
          <nav className="flex items-center gap-2">
            <a href="#features" className="hidden px-3 text-sm font-medium text-slate-600 hover:text-slate-900 sm:block">Features</a>
            {isAuthenticated ? (
              <Link to="/app" className={buttonClasses('primary', 'sm')}>Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className={buttonClasses('ghost', 'sm')}>Sign in</Link>
                <Link to="/register" className={buttonClasses('primary', 'sm')}>Get started</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <section className="overflow-hidden px-6 pt-16 pb-20 sm:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" /> Project management for focused teams
          </p>
          <h1 className="mt-6 text-4xl leading-[1.08] font-extrabold text-slate-900 sm:text-6xl">
            Keep every project <span className="text-brand-600">on cadence.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Plan projects, assign tasks to the right people, and see exactly what&apos;s on track, what&apos;s at risk, and what&apos;s overdue, all in one calm workspace.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to={primary.to} className={buttonClasses('primary', 'lg')}>{primary.label} <ArrowRight className="h-4 w-4" aria-hidden /></Link>
            {!isAuthenticated && <Link to="/login" className={buttonClasses('secondary', 'lg')}>Try the demo workspace</Link>}
          </div>
        </div>
        <ProductPreview />
      </section>

      <section id="features" className="border-t border-slate-100 bg-slate-50 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold text-slate-900">Everything a project needs, nothing it doesn&apos;t</h2>
            <p className="mt-3 text-slate-600">From the first task to the final deadline, Cadence keeps the plan, the people, and the progress in one place.</p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700"><Icon className="h-5 w-5" aria-hidden /></span>
                <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto flex max-w-4xl flex-col items-center rounded-3xl bg-slate-950 px-8 py-14 text-center">
          <h2 className="text-3xl font-bold text-white">Bring your next project into focus</h2>
          <p className="mt-3 max-w-lg text-slate-400">Create a project, invite your team, and watch the dashboard fill in as work moves forward.</p>
          <Link to={primary.to} className={buttonClasses('primary', 'lg', 'mt-8')}>{primary.label} <ArrowRight className="h-4 w-4" aria-hidden /></Link>
        </div>
      </section>

      <footer className="border-t border-slate-100 px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-sm text-slate-500 sm:flex-row">
          <Logo />
          <p>© {new Date().getFullYear()} Cadence. Built for teams that ship.</p>
        </div>
      </footer>
    </div>
  );
}
