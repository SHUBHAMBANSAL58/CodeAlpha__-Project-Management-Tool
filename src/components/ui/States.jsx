import { AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';
import Button from './Button';

export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center', className)}>
      {Icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <Icon className="h-6 w-6" aria-hidden />
        </div>
      )}
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ error, onRetry, title = "We couldn't load this", className }) {
  const forbidden = error?.status === 403;
  const missing = error?.status === 404;
  return (
    <div className={cn('flex flex-col items-center justify-center rounded-2xl border border-rose-100 bg-rose-50/40 px-6 py-14 text-center', className)} role="alert">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
        <AlertCircle className="h-6 w-6" aria-hidden />
      </div>
      <h3 className="text-base font-semibold text-slate-900">{forbidden ? 'Access denied' : missing ? 'Not found' : title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-slate-600">{error?.message ?? 'Something went wrong.'}</p>
      {onRetry && !forbidden && !missing && (
        <Button variant="secondary" className="mt-5" onClick={() => onRetry()}>Try again</Button>
      )}
    </div>
  );
}
