// Deadlines are stored as calendar dates ("YYYY-MM-DD") so they behave the
// same in every timezone; timestamps (createdAt, updatedAt) are ISO strings.
const DAY_MS = 86_400_000;

export function toDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export const todayStr = () => toDateStr(new Date());

export function dateOffset(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toDateStr(date);
}

export function parseDateStr(value) {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function isValidDateStr(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = parseDateStr(value);
  return !Number.isNaN(date.getTime()) && toDateStr(date) === value;
}

export function daysUntil(value) {
  if (!value) return null;
  return Math.round((parseDateStr(value) - parseDateStr(todayStr())) / DAY_MS);
}

export function formatDate(value, options = { month: 'short', day: 'numeric', year: 'numeric' }) {
  if (!value) return '—';
  const date = value.length === 10 ? parseDateStr(value) : new Date(value);
  return date.toLocaleDateString(undefined, options);
}

export const formatShortDate = (value) => formatDate(value, { month: 'short', day: 'numeric' });

export function relativeTime(iso) {
  const seconds = (Date.now() - new Date(iso).getTime()) / 1000;
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86_400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604_800) return `${Math.floor(seconds / 86_400)}d ago`;
  return formatDate(iso, { month: 'short', day: 'numeric' });
}

export function isTaskOverdue(task) {
  return task.status !== 'completed' && Boolean(task.deadline) && task.deadline < todayStr();
}

/** Human label plus a tone for a deadline, e.g. "3d overdue" (danger). */
export function deadlineInfo(value, { done = false } = {}) {
  const days = daysUntil(value);
  if (days === null) return { label: 'No deadline', tone: 'muted' };
  if (done) return { label: formatShortDate(value), tone: 'muted' };
  if (days < 0) return { label: `${-days}d overdue`, tone: 'danger' };
  if (days === 0) return { label: 'Due today', tone: 'warning' };
  if (days === 1) return { label: 'Due tomorrow', tone: 'warning' };
  if (days <= 7) return { label: `Due in ${days}d`, tone: 'default' };
  return { label: `Due ${formatShortDate(value)}`, tone: 'muted' };
}

export const deadlineToneClass = {
  danger: 'text-rose-600',
  warning: 'text-amber-600',
  default: 'text-slate-700',
  muted: 'text-slate-500',
};
