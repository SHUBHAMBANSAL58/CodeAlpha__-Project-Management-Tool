import { cn } from '../../utils/cn';

const control =
  'block w-full rounded-lg border bg-white px-3 text-sm text-slate-900 shadow-xs transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500';
const stateClass = (invalid) =>
  invalid ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-200' : 'border-slate-200 hover:border-slate-300 focus:border-brand-500 focus:ring-brand-100';

export function Field({ label, htmlFor, error, hint, required, children, className }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="ml-0.5 text-rose-500" aria-hidden>*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p id={htmlFor ? `${htmlFor}-error` : undefined} className="text-xs font-medium text-rose-600">{error}</p>
      ) : (
        hint && <p className="text-xs text-slate-500">{hint}</p>
      )}
    </div>
  );
}

export function Input({ className, invalid, ...props }) {
  return (
    <input
      className={cn(control, 'h-10', stateClass(invalid), className)}
      aria-invalid={invalid || undefined}
      aria-describedby={invalid && props.id ? `${props.id}-error` : undefined}
      {...props}
    />
  );
}

export function Textarea({ className, invalid, rows = 4, ...props }) {
  return (
    <textarea
      rows={rows}
      className={cn(control, 'resize-y py-2.5', stateClass(invalid), className)}
      aria-invalid={invalid || undefined}
      aria-describedby={invalid && props.id ? `${props.id}-error` : undefined}
      {...props}
    />
  );
}

export function Select({ className, invalid, children, ...props }) {
  return (
    <select
      className={cn(control, 'select-chevron cursor-pointer appearance-none pr-9', !/\bh-\d/.test(className ?? '') && 'h-10', stateClass(invalid), className)}
      aria-invalid={invalid || undefined}
      {...props}
    >
      {children}
    </select>
  );
}
