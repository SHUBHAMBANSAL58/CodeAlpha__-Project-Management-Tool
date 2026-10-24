import { useState } from 'react';
import { CheckSquare } from 'lucide-react';
import TaskFilters, { DEFAULT_TASK_FILTERS } from '../components/tasks/TaskFilters';
import TaskFormModal from '../components/tasks/TaskFormModal';
import TaskTable from '../components/tasks/TaskTable';
import { Select } from '../components/ui/Field';
import { EmptyState, ErrorState } from '../components/ui/States';
import Tabs from '../components/ui/Tabs';
import { useToast } from '../context/ToastContext';
import { useAsync } from '../hooks/useAsync';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { projectService, taskService } from '../services';
import { byValue, TASK_STATUSES } from '../utils/constants';
import { isTaskOverdue } from '../utils/dates';

const SCOPES = [
  { value: 'assigned', label: 'Assigned to me' },
  { value: 'created', label: 'Created by me' },
  { value: 'all', label: 'All my projects' },
];

export default function MyTasksPage() {
  const toast = useToast();
  const [scope, setScope] = useState('assigned');
  const [projectId, setProjectId] = useState('');
  const [filters, setFilters] = useState({ ...DEFAULT_TASK_FILTERS, status: 'open' });
  const debouncedSearch = useDebouncedValue(filters.search);
  const [editing, setEditing] = useState(null); // { task, project }

  const projects = useAsync(() => projectService.list({ sort: 'name' }), []);
  const query = { ...filters, search: debouncedSearch, scope, projectId: projectId || undefined };
  const tasks = useAsync(() => taskService.list(query), [JSON.stringify(query)]);

  const openTask = async (task) => {
    try {
      const project = await projectService.get(task.projectId);
      setEditing({ task, project });
    } catch (err) {
      toast.error(err.message);
    }
  };

  const onStatusChange = async (task, status) => {
    tasks.setData((list) => list?.map((t) => (t.id === task.id ? { ...t, status, isOverdue: isTaskOverdue({ ...t, status }) } : t)));
    try {
      await taskService.update(task.id, { status });
      toast.success(`Moved to ${byValue(TASK_STATUSES, status).label}`, task.title);
    } catch (err) {
      toast.error(err.message);
    } finally {
      tasks.reload({ silent: true });
    }
  };

  const projectFilter = (
    <Select aria-label="Filter by project" value={projectId} onChange={(e) => setProjectId(e.target.value)} className="h-9 w-auto">
      <option value="">All projects</option>
      {(projects.data ?? []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
    </Select>
  );

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">My Tasks</h1>
        <p className="mt-1 text-sm text-slate-500">Everything on your plate, across every project.</p>
      </div>

      <div className="mb-4 overflow-x-auto">
        <Tabs tabs={SCOPES} value={scope} onChange={setScope} label="Task scope" />
      </div>
      <div className="mb-4">
        <TaskFilters filters={filters} onChange={setFilters} extra={projectFilter} />
      </div>

      {tasks.error ? (
        <ErrorState error={tasks.error} onRetry={tasks.reload} />
      ) : tasks.data && tasks.data.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title={filters.status === 'open' && scope === 'assigned' ? "You're all caught up" : 'No tasks found'}
          description={filters.status === 'open' && scope === 'assigned' ? 'No open tasks are assigned to you right now.' : 'Try a different scope or clear the filters.'}
        />
      ) : (
        <TaskTable
          tasks={tasks.data}
          loading={tasks.loading}
          sort={filters.sort}
          onSort={(sort) => setFilters((f) => ({ ...f, sort }))}
          onOpenTask={openTask}
          onStatusChange={onStatusChange}
          showProject
        />
      )}

      <TaskFormModal
        open={Boolean(editing)}
        project={editing?.project}
        task={editing?.task}
        onClose={() => setEditing(null)}
        onSaved={() => { setEditing(null); tasks.reload({ silent: true }); }}
        onDeleted={() => { setEditing(null); tasks.reload({ silent: true }); }}
      />
    </>
  );
}
