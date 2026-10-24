import { cn } from '../../utils/cn';

const TONES = {
  neutral: 'bg-slate-100 text-slate-600',
  brand: 'bg-brand-50 text-brand-700',
  sky: 'bg-sky-50 text-sky-700',
  violet: 'bg-violet-50 text-violet-700',
  emerald: 'bg-emerald-50 text-emerald-700',
  rose: 'bg-rose-50 text-rose-700',
};

export default function StatCard({ label, value, icon: Icon, tone = 'neutral', hint, emphasize = false }) {
  return (
    <div className={cn('rounded-2xl border bg-white p-4 shadow-xs sm:p-5', emphasize ? 'border-rose-200' : 'border-slate-200/80')}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className={cn('flex h-8 w-8 items-center justify-center rounded-lg', TONES[tone])}>
          <Icon className="h-4 w-4" aria-hidden />
        </span>
      </div>
      <p className={cn('mt-3 font-display text-3xl font-bold tabular-nums', emphasize ? 'text-rose-600' : 'text-slate-900')}>{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
