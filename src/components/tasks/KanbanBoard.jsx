import { useState } from 'react';
import { Plus } from 'lucide-react';
import { TASK_STATUSES } from '../../utils/constants';
import { cn } from '../../utils/cn';
import Avatar from '../ui/Avatar';
import { PriorityBadge } from '../ui/Badge';
import DeadlineLabel from './DeadlineLabel';

function TaskCard({ task, onOpen, onStatusChange, dragging, onDragStart, onDragEnd }) {
  return (
    <div
      draggable
      onDragStart={(e) => { e.dataTransfer.setData('text/plain', task.id); e.dataTransfer.effectAllowed = 'move'; onDragStart(task.id); }}
      onDragEnd={onDragEnd}
      className={cn(
        'group cursor-grab rounded-xl border bg-white p-3.5 shadow-xs transition-all duration-150 hover:border-slate-300 hover:shadow-md active:cursor-grabbing',
        task.isOverdue ? 'border-rose-200' : 'border-slate-200/80',
        dragging && 'rotate-1 opacity-50',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <PriorityBadge priority={task.priority} />
        <Avatar user={task.assignee} size="xs" />
      </div>
      <button type="button" onClick={() => onOpen(task)} className="mt-2.5 block w-full text-left text-sm font-medium leading-snug text-slate-900 hover:text-brand-700 focus-visible:outline-none focus-visible:underline">
        {task.title}
      </button>
      <div className="mt-3 flex items-center justify-between gap-2">
        <DeadlineLabel task={task} />
        <label className="sr-only" htmlFor={`status-${task.id}`}>Status</label>
        <select
          id={`status-${task.id}`}
          value={task.status}
          onChange={(e) => onStatusChange(task, e.target.value)}
          className="cursor-pointer rounded-md border border-transparent bg-transparent py-0.5 text-xs text-slate-500 hover:border-slate-200 focus:border-brand-500 focus:outline-none"
        >
          {TASK_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>
    </div>
  );
}

/** Four-column board. Drag cards between columns, or use each card's status menu. */
export default function KanbanBoard({ tasks, onOpenTask, onStatusChange, onAddTask }) {
  const [draggingId, setDraggingId] = useState(null);
  const [overColumn, setOverColumn] = useState(null);

  const onDrop = (status) => (e) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || draggingId;
    const task = tasks.find((t) => t.id === id);
    setOverColumn(null);
    setDraggingId(null);
    if (task && task.status !== status) onStatusChange(task, status);
  };

  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
      <div className="grid min-w-[880px] grid-cols-4 gap-4">
        {TASK_STATUSES.map((column) => {
          const items = tasks.filter((t) => t.status === column.value);
          return (
            <section
              key={column.value}
              aria-label={`${column.label} column`}
              onDragOver={(e) => { e.preventDefault(); setOverColumn(column.value); }}
              onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOverColumn(null); }}
              onDrop={onDrop(column.value)}
              className={cn('flex min-h-[420px] flex-col rounded-2xl p-3 transition-colors', column.column, overColumn === column.value && 'ring-2 ring-brand-400 ring-inset')}
            >
              <header className="mb-3 flex items-center justify-between px-1">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <span className={cn('h-2 w-2 rounded-full', column.dot)} aria-hidden />
                  {column.label}
                  <span className="rounded-full bg-white/80 px-2 text-xs font-medium tabular-nums text-slate-500">{items.length}</span>
                </h3>
                <button type="button" onClick={() => onAddTask(column.value)} className="rounded-md p-1 text-slate-400 transition-colors hover:bg-white hover:text-slate-700" aria-label={`Add task to ${column.label}`}>
                  <Plus className="h-4 w-4" />
                </button>
              </header>
              <div className="flex flex-1 flex-col gap-2.5">
                {items.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onOpen={onOpenTask}
                    onStatusChange={onStatusChange}
                    dragging={draggingId === task.id}
                    onDragStart={setDraggingId}
                    onDragEnd={() => { setDraggingId(null); setOverColumn(null); }}
                  />
                ))}
                {items.length === 0 && (
                  <button type="button" onClick={() => onAddTask(column.value)} className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-slate-300/80 px-3 py-8 text-xs text-slate-400 transition-colors hover:border-slate-400 hover:text-slate-600">
                    Drop a task here or add one
                  </button>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
