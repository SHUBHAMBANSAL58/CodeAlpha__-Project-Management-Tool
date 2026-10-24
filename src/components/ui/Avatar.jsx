import { cn } from '../../utils/cn';

const PALETTE = [
  'bg-brand-100 text-brand-800',
  'bg-sky-100 text-sky-800',
  'bg-violet-100 text-violet-800',
  'bg-amber-100 text-amber-800',
  'bg-rose-100 text-rose-800',
  'bg-indigo-100 text-indigo-800',
  'bg-teal-100 text-teal-800',
];

const SIZES = { xs: 'h-6 w-6 text-[10px]', sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-16 w-16 text-xl' };

export const initials = (name = '') => name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase() || '?';

function colorFor(id = '') {
  let hash = 0;
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

export default function Avatar({ user, size = 'sm', className, ring = false }) {
  if (!user) {
    return <span className={cn('inline-flex shrink-0 items-center justify-center rounded-full border border-dashed border-slate-300 bg-white text-slate-400', SIZES[size], className)} title="Unassigned">?</span>;
  }
  return (
    <span
      className={cn('inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold', colorFor(user.id), SIZES[size], ring && 'ring-2 ring-white', className)}
      title={user.name}
    >
      {initials(user.name)}
    </span>
  );
}

export function AvatarStack({ users = [], max = 4, size = 'sm' }) {
  const shown = users.slice(0, max);
  const extra = users.length - shown.length;
  return (
    <div className="flex -space-x-2">
      {shown.map((u) => <Avatar key={u.id} user={u} size={size} ring />)}
      {extra > 0 && (
        <span className={cn('inline-flex items-center justify-center rounded-full bg-slate-100 font-semibold text-slate-600 ring-2 ring-white', SIZES[size])}>+{extra}</span>
      )}
    </div>
  );
}
