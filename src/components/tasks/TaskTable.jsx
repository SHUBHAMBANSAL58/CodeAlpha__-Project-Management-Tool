import { ArrowDown, ArrowUp } from 'lucide-react';
import { TASK_STATUSES } from '../../utils/constants';
import { cn } from '../../utils/cn';
import Avatar from '../ui/Avatar';
import { PriorityBadge } from '../ui/Badge';
import { Skeleton } from '../ui/Spinner';
import DeadlineLabel from './DeadlineLabel';

function SortHeader({ label, field, sort, onSort, className }) {
  const active = sort === field;
  return (
    <th scope="col" className={cn('px-4 py-3 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase', className)} aria-sort={active ? 'ascending' : 'none'}>
      {onSort ? (
        <button type="button" onClick={() => onSort(field)} className={cn('inline-flex items-center gap-1 uppercase hover:text-slate-800', active && 'text-slate-900')}>
          {label}
          {active ? <ArrowDown className="h-3 w-3" aria-hidden /> : <ArrowUp className="h-3 w-3 opacity-0" aria-hidden />}
        </button>
      ) : label}
    </th>
  );
}

/** Task list with inline status updates. Overdue rows are highlighted. */
export default function TaskTable({ tasks, loading, sort, onSort, onOpenTask, onStatusChange, showProject = false }) {
  if (loading && !tasks) {
    return (
      <div className="space-y-2 rounded-2xl border border-slate-200/80 bg-white p-4">
        {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-11" />)}
      </div>
    );
  }

  return (
    <div className={cn('overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs transition-opacity', loading && 'opacity-60')}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50/70">
            <tr>
              <SortHeader label="Task" field="title" sort={sort} onSort={onSort} className="min-w-[240px]" />
              {showProject && <SortHeader label="Project" />}
              <SortHeader label="Status" field="status" sort={sort} onSort={onSort} />
              <SortHeader label="Priority" field="priority" sort={sort} onSort={onSort} />
              <SortHeader label="Assignee" />
              <SortHeader label="Deadline" field="deadline" sort={sort} onSort={onSort} />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tasks.map((task) => (
              <tr key={task.id} className={cn('transition-colors hover:bg-slate-50/80', task.isOverdue && 'bg-rose-50/40')}>
                <td className="px-4 py-3">
                  <button type="button" onClick={() => onOpenTask(task)} className="text-left font-medium text-slate-900 hover:text-brand-700 focus-visible:underline focus-visible:outline-none">
                    {task.title}
                  </button>
                  {task.isOverdue && <span className="ml-2 rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-rose-700 uppercase">Overdue</span>}
                </td>
                {showProject && <td className="px-4 py-3 whitespace-nowrap text-slate-600">{task.project?.name}</td>}
                <td className="px-4 py-3">
                  <label className="sr-only" htmlFor={`row-status-${task.id}`}>Status for {task.title}</label>
                  <select
                    id={`row-status-${task.id}`}
                    value={task.status}
                    onChange={(e) => onStatusChange(task, e.target.value)}
                    className="cursor-pointer rounded-lg border border-slate-200 bg-white py-1 pr-7 pl-2 text-xs font-medium text-slate-700 hover:border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none"
                  >
                    {TASK_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3"><PriorityBadge priority={task.priority} /></td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-2 whitespace-nowrap text-slate-700">
                    <Avatar user={task.assignee} size="xs" />
                    {task.assignee?.name ?? <span className="text-slate-400">Unassigned</span>}
                  </span>
                </td>
                <td className="px-4 py-3"><DeadlineLabel task={task} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
