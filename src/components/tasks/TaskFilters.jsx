import { Search, X } from 'lucide-react';
import { TASK_PRIORITIES, TASK_STATUSES } from '../../utils/constants';
import { Select } from '../ui/Field';

export const DEFAULT_TASK_FILTERS = { search: '', status: 'all', priority: 'all', assignee: 'all', overdue: false, sort: 'deadline' };

const SORTS = [
  { value: 'deadline', label: 'Deadline (soonest)' },
  { value: 'priority', label: 'Priority (highest)' },
  { value: 'status', label: 'Status' },
  { value: 'created', label: 'Newest first' },
  { value: 'title', label: 'Title (A–Z)' },
];

/**
 * Filter bar shared by the project task views and My Tasks.
 * Pass `members` to enable the assignee filter, `extra` for page-specific controls.
 */
export default function TaskFilters({ filters, onChange, members, showStatus = true, extra }) {
  const set = (key, value) => onChange({ ...filters, [key]: value });
  const active = Object.entries(DEFAULT_TASK_FILTERS).some(([k, v]) => k !== 'sort' && filters[k] !== v);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative w-full sm:w-60">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
        <input
          type="search"
          value={filters.search}
          onChange={(e) => set('search', e.target.value)}
          placeholder="Filter tasks…"
          aria-label="Filter tasks by text"
          className="h-9 w-full rounded-lg border border-slate-200 bg-white pr-3 pl-9 text-sm shadow-xs placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none"
        />
      </div>
      {extra}
      {showStatus && (
        <Select aria-label="Filter by status" value={filters.status} onChange={(e) => set('status', e.target.value)} className="h-9 w-auto">
          <option value="all">All statuses</option>
          <option value="open">Open (not completed)</option>
          {TASK_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </Select>
      )}
      <Select aria-label="Filter by priority" value={filters.priority} onChange={(e) => set('priority', e.target.value)} className="h-9 w-auto">
        <option value="all">All priorities</option>
        {TASK_PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
      </Select>
      {members && (
        <Select aria-label="Filter by assignee" value={filters.assignee} onChange={(e) => set('assignee', e.target.value)} className="h-9 w-auto">
          <option value="all">Everyone</option>
          <option value="me">Assigned to me</option>
          <option value="unassigned">Unassigned</option>
          {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </Select>
      )}
      <Select aria-label="Sort tasks" value={filters.sort} onChange={(e) => set('sort', e.target.value)} className="h-9 w-auto">
        {SORTS.map((s) => <option key={s.value} value={s.value}>Sort: {s.label}</option>)}
      </Select>
      <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-xs hover:border-slate-300">
        <input type="checkbox" checked={filters.overdue} onChange={(e) => set('overdue', e.target.checked)} className="h-4 w-4 rounded border-slate-300 accent-rose-600" />
        Overdue only
      </label>
      {active && (
        <button type="button" onClick={() => onChange({ ...DEFAULT_TASK_FILTERS, sort: filters.sort })} className="inline-flex h-9 items-center gap-1 rounded-lg px-2 text-sm font-medium text-slate-500 hover:text-slate-800">
          <X className="h-4 w-4" aria-hidden /> Clear
        </button>
      )}
    </div>
  );
}
