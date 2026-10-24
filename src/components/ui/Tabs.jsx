import { cn } from '../../utils/cn';

/** Segmented tab control. `tabs` is [{ value, label, icon?, count? }]. */
export default function Tabs({ tabs, value, onChange, className, label = 'Views' }) {
  return (
    <div role="tablist" aria-label={label} className={cn('inline-flex rounded-xl bg-slate-100 p-1', className)}>
      {tabs.map(({ value: v, label: text, icon: Icon, count }) => {
        const active = v === value;
        return (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(v)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-150',
              active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800',
            )}
          >
            {Icon && <Icon className="h-4 w-4" aria-hidden />}
            {text}
            {count !== undefined && <span className={cn('rounded-full px-1.5 text-xs tabular-nums', active ? 'bg-slate-100 text-slate-600' : 'text-slate-400')}>{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
