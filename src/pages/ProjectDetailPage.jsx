import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CalendarRange, ChevronRight, Crown, KanbanSquare, List, Lock, Pencil, Plus, Trash2, Users } from 'lucide-react';
import ProjectFormModal from '../components/projects/ProjectFormModal';
import TeamPanel from '../components/projects/TeamPanel';
import KanbanBoard from '../components/tasks/KanbanBoard';
import TaskFilters, { DEFAULT_TASK_FILTERS } from '../components/tasks/TaskFilters';
import TaskFormModal from '../components/tasks/TaskFormModal';
import TaskTable from '../components/tasks/TaskTable';
import { AvatarStack } from '../components/ui/Avatar';
import { ProjectStatusBadge } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import ProgressBar from '../components/ui/ProgressBar';
import { Skeleton } from '../components/ui/Spinner';
import { EmptyState, ErrorState } from '../components/ui/States';
import Tabs from '../components/ui/Tabs';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useAsync } from '../hooks/useAsync';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { projectService, taskService } from '../services';
import { byValue, TASK_STATUSES } from '../utils/constants';
import { cn } from '../utils/cn';
import { deadlineInfo, deadlineToneClass, formatDate, isTaskOverdue } from '../utils/dates';

function Metric({ label, value, tone }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className={cn('mt-0.5 font-display text-xl font-bold tabular-nums', tone ?? 'text-slate-900')}>{value}</p>
    </div>
  );
}

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [view, setView] = useState('board');
  const [filters, setFilters] = useState(DEFAULT_TASK_FILTERS);
  const debouncedSearch = useDebouncedValue(filters.search);
  const [editingProject, setEditingProject] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [taskModal, setTaskModal] = useState(null); // { task } | { defaults }

  const projectQuery = useAsync(() => projectService.get(projectId), [projectId]);
  const allTasksQuery = useAsync(() => taskService.list({ projectId }), [projectId]);
  // The board always shows every column, so the status filter only applies to the list.
  const queryFilters = { ...filters, search: debouncedSearch, status: view === 'board' ? 'all' : filters.status };
  const tasksQuery = useAsync(() => taskService.list({ projectId, ...queryFilters }), [projectId, JSON.stringify(queryFilters)]);

  const project = projectQuery.data;
  const allTasks = allTasksQuery.data ?? [];
  const isOwner = project?.ownerId === user.id;

  const counts = useMemo(() => ({
    total: allTasks.length,
    completed: allTasks.filter((t) => t.status === 'completed').length,
    overdue: allTasks.filter(isTaskOverdue).length,
    inFlight: allTasks.filter((t) => t.status === 'in_progress' || t.status === 'in_review').length,
  }), [allTasks]);

  const refresh = () => {
    projectQuery.reload({ silent: true });
    allTasksQuery.reload({ silent: true });
    tasksQuery.reload({ silent: true });
  };

  const onStatusChange = async (task, status) => {
    const patch = (list) => list?.map((t) => (t.id === task.id ? { ...t, status, isOverdue: isTaskOverdue({ ...t, status }) } : t));
    tasksQuery.setData(patch);
    allTasksQuery.setData(patch);
    try {
      await taskService.update(task.id, { status });
      toast.success(`Moved to ${byValue(TASK_STATUSES, status).label}`, task.title);
    } catch (err) {
      toast.error(err.message);
    } finally {
      refresh();
    }
  };

  const onDeleteProject = async () => {
    setDeleting(true);
    try {
      await projectService.remove(project.id);
      toast.success('Project deleted', `${project.name} and its tasks were removed.`);
      navigate('/app/projects', { replace: true });
    } catch (err) {
      toast.error(err.message);
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  if (projectQuery.error) {
    return (
      <>
        <Link to="/app/projects" className="mb-6 inline-flex text-sm font-medium text-slate-500 hover:text-slate-800">← Back to projects</Link>
        <ErrorState error={projectQuery.error} onRetry={projectQuery.reload} />
      </>
    );
  }

  if (!project) {
    return (
      <div className="space-y-6" aria-busy="true">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-44 rounded-2xl" />
        <Skeleton className="h-[420px] rounded-2xl" />
      </div>
    );
  }

  const due = deadlineInfo(project.deadline, { done: project.status === 'completed' });
  const tasks = tasksQuery.data;
  const noTasksAtAll = allTasksQuery.data && allTasks.length === 0;

  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1 text-sm text-slate-500">
        <Link to="/app/projects" className="hover:text-slate-800">Projects</Link>
        <ChevronRight className="h-4 w-4" aria-hidden />
        <span className="truncate font-medium text-slate-800">{project.name}</span>
      </nav>

      <Card className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{project.name}</h1>
              <ProjectStatusBadge status={project.status} />
            </div>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{project.description || 'No description yet.'}</p>
            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600">
              <span className="inline-flex items-center gap-1.5"><Crown className="h-4 w-4 text-amber-500" aria-hidden /> {project.owner?.name}{isOwner && ' (you)'}</span>
              <span className="inline-flex items-center gap-1.5"><CalendarRange className="h-4 w-4 text-slate-400" aria-hidden /> {formatDate(project.startDate)} – {formatDate(project.deadline)}</span>
              <span className={cn('font-medium', deadlineToneClass[due.tone])}>{due.label}</span>
              <button type="button" onClick={() => setView('team')} className="inline-flex items-center gap-2 hover:text-slate-900">
                <AvatarStack users={project.members} size="xs" /> {project.members.length} {project.members.length === 1 ? 'member' : 'members'}
              </button>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            {isOwner ? (
              <>
                <Button variant="secondary" onClick={() => setEditingProject(true)}><Pencil className="h-4 w-4" aria-hidden /> Edit</Button>
                <Button variant="danger-ghost" onClick={() => setConfirmDelete(true)} aria-label="Delete project"><Trash2 className="h-4 w-4" aria-hidden /> Delete</Button>
              </>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500" title="Only the project owner can edit or delete this project">
                <Lock className="h-3.5 w-3.5" aria-hidden /> Member access
              </span>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-6 border-t border-slate-100 pt-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <div>
            <div className="mb-2 flex items-baseline justify-between text-sm">
              <span className="font-medium text-slate-700">Completion</span>
              <span className="font-semibold tabular-nums text-slate-900">{project.progress}%</span>
            </div>
            <ProgressBar value={project.progress} label={`${project.name} completion`} />
          </div>
          <div className="grid grid-cols-4 gap-6">
            <Metric label="Tasks" value={counts.total} />
            <Metric label="In flight" value={counts.inFlight} tone="text-sky-700" />
            <Metric label="Done" value={counts.completed} tone="text-emerald-700" />
            <Metric label="Overdue" value={counts.overdue} tone={counts.overdue ? 'text-rose-600' : undefined} />
          </div>
        </div>
      </Card>

      <div className="mt-6 mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          value={view}
          onChange={setView}
          tabs={[
            { value: 'board', label: 'Board', icon: KanbanSquare },
            { value: 'list', label: 'List', icon: List },
            { value: 'team', label: 'Team', icon: Users, count: project.members.length },
          ]}
        />
        {view !== 'team' && (
          <Button onClick={() => setTaskModal({ defaults: null })}><Plus className="h-4 w-4" aria-hidden /> New task</Button>
        )}
      </div>

      {view === 'team' ? (
        <TeamPanel
          project={project}
          tasks={allTasks}
          onProjectChange={(updated) => { projectQuery.setData(updated); refresh(); }}
          onOpenTask={(task) => setTaskModal({ task })}
        />
      ) : noTasksAtAll ? (
        <EmptyState
          icon={KanbanSquare}
          title="No tasks in this project yet"
          description="Break the work down into tasks, set deadlines, and assign them to your teammates."
          action={<Button onClick={() => setTaskModal({ defaults: null })}><Plus className="h-4 w-4" aria-hidden /> Add the first task</Button>}
        />
      ) : (
        <>
          <div className="mb-4">
            <TaskFilters filters={filters} onChange={setFilters} members={project.members} showStatus={view === 'list'} />
          </div>
          {tasksQuery.error ? (
            <ErrorState error={tasksQuery.error} onRetry={tasksQuery.reload} />
          ) : view === 'board' ? (
            tasks ? (
              <KanbanBoard
                tasks={tasks}
                onOpenTask={(task) => setTaskModal({ task })}
                onStatusChange={onStatusChange}
                onAddTask={(status) => setTaskModal({ defaults: { status } })}
              />
            ) : (
              <div className="grid grid-cols-4 gap-4">{TASK_STATUSES.map((s) => <Skeleton key={s.value} className="h-[420px] rounded-2xl" />)}</div>
            )
          ) : tasks && tasks.length === 0 ? (
            <EmptyState title="No tasks match these filters" description="Adjust or clear the filters to see more tasks." />
          ) : (
            <TaskTable
              tasks={tasks}
              loading={tasksQuery.loading}
              sort={filters.sort}
              onSort={(sort) => setFilters((f) => ({ ...f, sort }))}
              onOpenTask={(task) => setTaskModal({ task })}
              onStatusChange={onStatusChange}
            />
          )}
        </>
      )}

      <TaskFormModal
        open={Boolean(taskModal)}
        project={project}
        task={taskModal?.task}
        defaults={taskModal?.defaults}
        onClose={() => setTaskModal(null)}
        onSaved={() => { setTaskModal(null); refresh(); }}
        onDeleted={() => { setTaskModal(null); refresh(); }}
      />
      <ProjectFormModal
        open={editingProject}
        project={project}
        onClose={() => setEditingProject(false)}
        onSaved={(updated) => { setEditingProject(false); projectQuery.setData(updated); refresh(); }}
      />
      <ConfirmDialog
        open={confirmDelete}
        title="Delete this project?"
        message={<><strong>{project.name}</strong> and all {counts.total} of its tasks will be permanently deleted. Team members will lose access. This can&apos;t be undone.</>}
        confirmLabel="Delete project"
        loading={deleting}
        onConfirm={onDeleteProject}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}
