import { AlertCircle, CalendarDays } from 'lucide-react';
import { cn } from '../../utils/cn';
import { deadlineInfo, deadlineToneClass } from '../../utils/dates';

export default function DeadlineLabel({ task, className }) {
  const info = deadlineInfo(task.deadline, { done: task.status === 'completed' });
  const Icon = info.tone === 'danger' ? AlertCircle : CalendarDays;
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-medium whitespace-nowrap', deadlineToneClass[info.tone], className)}>
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {info.label}
    </span>
  );
}
