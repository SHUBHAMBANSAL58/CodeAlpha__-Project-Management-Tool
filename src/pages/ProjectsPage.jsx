import { useEffect, useRef, useState } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { FolderKanban, Plus, Search, SearchX } from 'lucide-react';
import ProjectCard from '../components/projects/ProjectCard';
import Button from '../components/ui/Button';
import { Select } from '../components/ui/Field';
import { Skeleton } from '../components/ui/Spinner';
import { EmptyState, ErrorState } from '../components/ui/States';
import Tabs from '../components/ui/Tabs';
import { useAsync } from '../hooks/useAsync';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { projectService } from '../services';
import { PROJECT_STATUSES } from '../utils/constants';

const STATUS_TABS = [{ value: 'all', label: 'All' }, ...PROJECT_STATUSES.map(({ value, label }) => ({ value, label }))];

export default function ProjectsPage() {
  const { openCreateProject } = useOutletContext();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get('search') ?? '');
  const status = params.get('status') ?? 'all';
  const ownership = params.get('ownership') ?? 'all';
  const sort = params.get('sort') ?? 'deadline';
  const debouncedSearch = useDebouncedValue(search);

  const urlSearch = params.get('search') ?? '';
  const pushedSearch = useRef(urlSearch);

  // Keep the input in sync when the top-bar search (not this input) changes the URL.
  useEffect(() => {
    if (urlSearch !== pushedSearch.current) {
      pushedSearch.current = urlSearch;
      setSearch(urlSearch);
    }
  }, [urlSearch]);

  const setParam = (key, value, fallback) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      if (!value || value === fallback) next.delete(key); else next.set(key, value);
      return next;
    }, { replace: true });
  };

  useEffect(() => {
    const next = debouncedSearch.trim();
    if (next !== urlSearch) {
      pushedSearch.current = next;
      setParam('search', next, '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const { data: projects, loading, error, reload } = useAsync(
    () => projectService.list({ search: urlSearch, status, ownership, sort }),
    [params.toString()],
  );

  const filtered = Boolean(urlSearch) || status !== 'all' || ownership !== 'all';

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Projects</h1>
          <p className="mt-1 text-sm text-slate-500">Every project you own or have been added to.</p>
        </div>
        <Button onClick={openCreateProject}><Plus className="h-4 w-4" aria-hidden /> New project</Button>
      </div>

      <div className="mb-6 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="overflow-x-auto">
          <Tabs tabs={STATUS_TABS} value={status} onChange={(v) => setParam('status', v, 'all')} label="Filter by status" />
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or description"
              aria-label="Search projects"
              className="h-9 w-full rounded-lg border border-slate-200 bg-white pr-3 pl-9 text-sm shadow-xs placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none"
            />
          </div>
          <Select aria-label="Ownership" value={ownership} onChange={(e) => setParam('ownership', e.target.value, 'all')} className="h-9 w-auto">
            <option value="all">All projects</option>
            <option value="owned">Owned by me</option>
            <option value="shared">Shared with me</option>
          </Select>
          <Select aria-label="Sort projects" value={sort} onChange={(e) => setParam('sort', e.target.value, 'deadline')} className="h-9 w-auto">
            <option value="deadline">Sort: Deadline</option>
            <option value="updated">Sort: Recently updated</option>
            <option value="name">Sort: Name</option>
            <option value="progress">Sort: Progress</option>
          </Select>
        </div>
      </div>

      {error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : loading && !projects ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-60 rounded-2xl" />)}
        </div>
      ) : projects.length === 0 ? (
        filtered ? (
          <EmptyState
            icon={SearchX}
            title="No matching projects"
            description="Try a different search term or clear the filters."
            action={<Button variant="secondary" onClick={() => { pushedSearch.current = ''; setSearch(''); setParams({}, { replace: true }); }}>Clear filters</Button>}
          />
        ) : (
          <EmptyState
            icon={FolderKanban}
            title="No projects yet"
            description="Projects group your tasks, teammates, and deadlines. Create one to get started."
            action={<Button onClick={openCreateProject}><Plus className="h-4 w-4" aria-hidden /> Create your first project</Button>}
          />
        )
      ) : (
        <>
          <p className="mb-3 text-sm text-slate-500" aria-live="polite">{projects.length} {projects.length === 1 ? 'project' : 'projects'}</p>
          <div className={`grid gap-4 transition-opacity sm:grid-cols-2 xl:grid-cols-3 ${loading ? 'opacity-60' : ''}`}>
            {projects.map((p) => <ProjectCard key={p.id} project={p} />)}
          </div>
        </>
      )}
    </>
  );
}
