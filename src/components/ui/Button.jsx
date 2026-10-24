import { cn } from '../../utils/cn';
import Spinner from './Spinner';

const VARIANTS = {
  primary: 'bg-brand-600 text-white shadow-sm hover:bg-brand-700 focus-visible:ring-brand-500',
  secondary: 'border border-slate-200 bg-white text-slate-700 shadow-xs hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-brand-500',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-brand-500',
  danger: 'bg-rose-600 text-white shadow-sm hover:bg-rose-700 focus-visible:ring-rose-500',
  'danger-ghost': 'text-rose-600 hover:bg-rose-50 focus-visible:ring-rose-500',
};

const SIZES = {
  sm: 'h-8 gap-1.5 px-3 text-sm',
  md: 'h-10 gap-2 px-4 text-sm',
  lg: 'h-12 gap-2 px-6 text-base',
  icon: 'h-9 w-9',
};

/** Button styling, also used for router links that should look like buttons. */
export function buttonClasses(variant = 'primary', size = 'md', className) {
  return cn(
    'inline-flex shrink-0 items-center justify-center rounded-lg font-medium whitespace-nowrap transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

export default function Button({ variant = 'primary', size = 'md', loading = false, className, children, disabled, type = 'button', ...props }) {
  return (
    <button type={type} disabled={disabled || loading} className={buttonClasses(variant, size, className)} {...props}>
      {loading && <Spinner className="h-4 w-4" />}
      {children}
    </button>
  );
}
