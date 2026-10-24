export const TASK_STATUSES = [
  { value: 'todo', label: 'To Do', dot: 'bg-slate-400', badge: 'bg-slate-100 text-slate-700 ring-slate-200', column: 'bg-slate-100/70' },
  { value: 'in_progress', label: 'In Progress', dot: 'bg-sky-500', badge: 'bg-sky-50 text-sky-700 ring-sky-200', column: 'bg-sky-50/70' },
  { value: 'in_review', label: 'In Review', dot: 'bg-violet-500', badge: 'bg-violet-50 text-violet-700 ring-violet-200', column: 'bg-violet-50/70' },
  { value: 'completed', label: 'Completed', dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200', column: 'bg-emerald-50/70' },
];

export const TASK_PRIORITIES = [
  { value: 'low', label: 'Low', rank: 1, badge: 'bg-slate-100 text-slate-600 ring-slate-200', icon: 'text-slate-400' },
  { value: 'medium', label: 'Medium', rank: 2, badge: 'bg-amber-50 text-amber-700 ring-amber-200', icon: 'text-amber-500' },
  { value: 'high', label: 'High', rank: 3, badge: 'bg-orange-50 text-orange-700 ring-orange-200', icon: 'text-orange-500' },
  { value: 'urgent', label: 'Urgent', rank: 4, badge: 'bg-rose-50 text-rose-700 ring-rose-200', icon: 'text-rose-500' },
];

export const PROJECT_STATUSES = [
  { value: 'planning', label: 'Planning', badge: 'bg-indigo-50 text-indigo-700 ring-indigo-200', dot: 'bg-indigo-500' },
  { value: 'active', label: 'Active', badge: 'bg-brand-50 text-brand-700 ring-brand-200', dot: 'bg-brand-500' },
  { value: 'on_hold', label: 'On Hold', badge: 'bg-amber-50 text-amber-700 ring-amber-200', dot: 'bg-amber-500' },
  { value: 'completed', label: 'Completed', badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200', dot: 'bg-emerald-500' },
];

export const byValue = (list, value) => list.find((item) => item.value === value) ?? list[0];
export const priorityRank = (value) => byValue(TASK_PRIORITIES, value).rank;
export const statusRank = (value) => TASK_STATUSES.findIndex((s) => s.value === value);
