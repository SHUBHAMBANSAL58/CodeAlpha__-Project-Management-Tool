import { TASK_STATUSES } from '../../utils/constants';
import { cn } from '../../utils/cn';

/** Single stacked bar showing how all tasks split across statuses. */
export default function StatusBreakdown({ counts, total }) {
  if (!total) return <div className="h-2.5 rounded-full bg-slate-100" aria-hidden />;
  return (
    <div>
      <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-full" role="img" aria-label={TASK_STATUSES.map((s) => `${s.label}: ${counts[s.value]}`).join(', ')}>
        {TASK_STATUSES.map((s) => counts[s.value] > 0 && (
          <div key={s.value} className={cn('h-full transition-[width] duration-500', s.dot)} style={{ width: `${(counts[s.value] / total) * 100}%` }} />
        ))}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-slate-600">
        {TASK_STATUSES.map((s) => (
          <li key={s.value} className="inline-flex items-center gap-1.5">
            <span className={cn('h-2 w-2 rounded-full', s.dot)} aria-hidden />
            {s.label} <span className="font-semibold tabular-nums text-slate-900">{counts[s.value]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
