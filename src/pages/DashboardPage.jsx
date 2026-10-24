import { Link, useOutletContext } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, CircleDashed, FolderKanban, ListTodo, Loader, Plus } from 'lucide-react';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import StatCard from '../components/dashboard/StatCard';
import StatusBreakdown from '../components/dashboard/StatusBreakdown';
import DeadlineLabel from '../components/tasks/DeadlineLabel';
import Avatar from '../components/ui/Avatar';
import { PriorityBadge, ProjectStatusBadge } from '../components/ui/Badge';
import Button, { buttonClasses } from '../components/ui/Button';
import { Card, CardHeader } from '../components/ui/Card';
import ProgressBar from '../components/ui/ProgressBar';
import { Skeleton } from '../components/ui/Spinner';
import { EmptyState, ErrorState } from '../components/ui/States';
import { useAuth } from '../context/AuthContext';
import { useAsync } from '../hooks/useAsync';
import { dashboardService } from '../services';
import { deadlineInfo, deadlineToneClass } from '../utils/dates';
import { cn } from '../utils/cn';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-[120px] rounded-2xl" />)}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-96 rounded-2xl lg:col-span-2" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    </div>
  );
}

function TaskRow({ task }) {
  return (
    <li>
      <Link to={`/app/projects/${task.projectId}`} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-slate-50">
        <Avatar user={task.assignee} size="xs" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-900">{task.title}</p>
          <p className="truncate text-xs text-slate-500">{task.project?.name}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <DeadlineLabel task={task} />
          <PriorityBadge priority={task.priority} />
        </div>
      </Link>
    </li>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { openCreateProject } = useOutletContext();
  const { data, loading, error, reload } = useAsync(() => dashboardService.get(), []);

  const header = (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm text-slate-500">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">{greeting()}, {user.name.split(' ')[0]}</h1>
        {data && (
          <p className="mt-1 text-sm text-slate-600">
            You have <span className="font-semibold text-slate-900">{data.stats.myOpenTasks}</span> open {data.stats.myOpenTasks === 1 ? 'task' : 'tasks'} assigned to you
            {data.stats.overdueTasks > 0 && <> and <span className="font-semibold text-rose-600">{data.stats.overdueTasks} overdue</span> across your projects</>}.
          </p>
        )}
      </div>
      <div className="flex gap-2">
        <Link to="/app/tasks" className={buttonClasses('secondary')}>View my tasks</Link>
        <Button onClick={openCreateProject}><Plus className="h-4 w-4" aria-hidden /> New project</Button>
      </div>
    </div>
  );

  if (loading && !data) return <>{header}<DashboardSkeleton /></>;
  if (error) return <>{header}<ErrorState error={error} onRetry={reload} /></>;

  const { stats, upcoming, overdue, projects, activity } = data;

  if (stats.totalProjects === 0) {
    return (
      <>
        {header}
        <EmptyState
          icon={FolderKanban}
          title="Welcome to Cadence"
          description="Create your first project to start planning tasks, inviting teammates, and tracking progress here."
          action={<Button onClick={openCreateProject}><Plus className="h-4 w-4" aria-hidden /> Create a project</Button>}
        />
      </>
    );
  }

  const counts = { todo: stats.pendingTasks, in_progress: stats.inProgressTasks, in_review: stats.inReviewTasks, completed: stats.completedTasks };
  const completion = stats.totalTasks ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;

  return (
    <>
      {header}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Projects" value={stats.totalProjects} icon={FolderKanban} tone="brand" hint={`${stats.activeProjects} active`} />
        <StatCard label="Total tasks" value={stats.totalTasks} icon={ListTodo} tone="neutral" hint={`${completion}% complete`} />
        <StatCard label="To do" value={stats.pendingTasks} icon={CircleDashed} tone="neutral" hint="Not started" />
        <StatCard label="In progress" value={stats.inProgressTasks} icon={Loader} tone="sky" hint={`${stats.inReviewTasks} in review`} />
        <StatCard label="Completed" value={stats.completedTasks} icon={CheckCircle2} tone="emerald" />
        <StatCard label="Overdue" value={stats.overdueTasks} icon={AlertTriangle} tone="rose" emphasize={stats.overdueTasks > 0} hint={stats.overdueTasks ? 'Needs attention' : 'All on track'} />
      </div>

      <Card className="mt-6 p-5">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-base font-semibold text-slate-900">Task status across your projects</h2>
          <span className="text-sm text-slate-500">{stats.totalTasks} tasks</span>
        </div>
        <StatusBreakdown counts={counts} total={stats.totalTasks} />
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Project progress" description="Open projects, ordered by deadline" action={<Link to="/app/projects" className="text-sm font-medium text-brand-700 hover:text-brand-800">All projects</Link>} />
            {projects.length === 0 ? (
              <p className="px-5 py-6 text-sm text-slate-500">All of your projects are complete. 🎉</p>
            ) : (
              <ul className="mt-3 divide-y divide-slate-100">
                {projects.map((p) => {
                  const due = deadlineInfo(p.deadline);
                  return (
                    <li key={p.id}>
                      <Link to={`/app/projects/${p.id}`} className="grid gap-3 px-5 py-4 transition-colors hover:bg-slate-50 sm:grid-cols-[minmax(0,1fr)_200px] sm:items-center">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate font-medium text-slate-900">{p.name}</p>
                            <ProjectStatusBadge status={p.status} />
                          </div>
                          <p className="mt-1 text-xs text-slate-500">
                            {p.taskCounts.completed}/{p.taskCounts.total} tasks · <span className={cn('font-medium', deadlineToneClass[due.tone])}>{due.label}</span>
                            {p.taskCounts.overdue > 0 && <span className="font-medium text-rose-600"> · {p.taskCounts.overdue} overdue</span>}
                          </p>
                        </div>
                        <ProgressBar value={p.progress} showLabel label={`${p.name} progress`} />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          {overdue.length > 0 && (
            <Card className="border-rose-200">
              <CardHeader title={<span className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-rose-600" aria-hidden /> Overdue tasks</span>} description="Past their deadline and not yet completed" />
              <ul className="mt-2 divide-y divide-slate-100">{overdue.map((t) => <TaskRow key={t.id} task={t} />)}</ul>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Upcoming deadlines" description="Due in the next 7 days" />
            {upcoming.length === 0 ? (
              <p className="px-5 py-6 text-sm text-slate-500">Nothing due this week.</p>
            ) : (
              <ul className="mt-2 divide-y divide-slate-100">{upcoming.map((t) => <TaskRow key={t.id} task={t} />)}</ul>
            )}
          </Card>
          <Card>
            <CardHeader title="Recent activity" className="pb-4" />
            <ActivityFeed items={activity} />
          </Card>
        </div>
      </div>
    </>
  );
}
