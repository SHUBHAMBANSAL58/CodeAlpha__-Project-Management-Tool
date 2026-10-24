import { cn } from '../../utils/cn';

export default function ProgressBar({ value = 0, className, size = 'md', showLabel = false, label = 'Progress' }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  const tone = pct === 100 ? 'bg-emerald-500' : 'bg-brand-500';
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div
        className={cn('flex-1 overflow-hidden rounded-full bg-slate-100', size === 'sm' ? 'h-1.5' : 'h-2')}
        role="progressbar"
        aria-label={label}
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className={cn('h-full rounded-full transition-[width] duration-500 ease-out', tone)} style={{ width: `${pct}%` }} />
      </div>
      {showLabel && <span className="w-10 text-right text-xs font-semibold tabular-nums text-slate-700">{pct}%</span>}
    </div>
  );
}
