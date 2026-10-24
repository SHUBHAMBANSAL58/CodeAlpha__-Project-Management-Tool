import { Flag } from 'lucide-react';
import { byValue, PROJECT_STATUSES, TASK_PRIORITIES, TASK_STATUSES } from '../../utils/constants';
import { cn } from '../../utils/cn';

export function Badge({ className, children }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset', className)}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }) {
  const s = byValue(TASK_STATUSES, status);
  return (
    <Badge className={s.badge}>
      <span className={cn('h-1.5 w-1.5 rounded-full', s.dot)} aria-hidden />
      {s.label}
    </Badge>
  );
}

export function PriorityBadge({ priority }) {
  const p = byValue(TASK_PRIORITIES, priority);
  return (
    <Badge className={p.badge}>
      <Flag className="h-3 w-3" aria-hidden />
      {p.label}
    </Badge>
  );
}

export function ProjectStatusBadge({ status }) {
  const s = byValue(PROJECT_STATUSES, status);
  return (
    <Badge className={s.badge}>
      <span className={cn('h-1.5 w-1.5 rounded-full', s.dot)} aria-hidden />
      {s.label}
    </Badge>
  );
}
