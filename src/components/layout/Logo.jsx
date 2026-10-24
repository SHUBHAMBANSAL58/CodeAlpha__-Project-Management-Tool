import { cn } from '../../utils/cn';

export default function Logo({ className, inverted = false }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 shadow-sm shadow-brand-900/30">
        <svg viewBox="0 0 32 32" className="h-5 w-5" aria-hidden>
          <path d="M8 17.5l5 5L24 10.5" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className={cn('font-display text-lg font-bold tracking-tight', inverted ? 'text-white' : 'text-slate-900')}>Cadence</span>
    </span>
  );
}
