import { Link } from 'react-router-dom';
import { AlertCircle, CalendarDays, CheckCircle2, Crown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';
import { deadlineInfo, deadlineToneClass } from '../../utils/dates';
import { AvatarStack } from '../ui/Avatar';
import { ProjectStatusBadge } from '../ui/Badge';
import ProgressBar from '../ui/ProgressBar';

export default function ProjectCard({ project }) {
  const { user } = useAuth();
  const isOwner = project.ownerId === user?.id;
  const due = deadlineInfo(project.deadline, { done: project.status === 'completed' });
  const { total, completed, overdue } = project.taskCounts;

  return (
    <Link
      to={`/app/projects/${project.id}`}
      className="group flex flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
    >
      <div className="flex items-center justify-between gap-2">
        <ProjectStatusBadge status={project.status} />
        {isOwner && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500"><Crown className="h-3.5 w-3.5 text-amber-500" aria-hidden /> Owner</span>
        )}
      </div>
      <h3 className="mt-3 text-base font-semibold text-slate-900 group-hover:text-brand-700">{project.name}</h3>
      <p className="mt-1 line-clamp-2 min-h-10 text-sm text-slate-500">{project.description || 'No description yet.'}</p>

      <div className="mt-5">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="font-medium text-slate-600">{completed} of {total} tasks done</span>
          <span className="font-semibold tabular-nums text-slate-900">{project.progress}%</span>
        </div>
        <ProgressBar value={project.progress} size="sm" label={`${project.name} progress`} />
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <AvatarStack users={project.members} size="xs" />
        <div className="flex items-center gap-3 text-xs">
          {overdue > 0 && (
            <span className="inline-flex items-center gap-1 font-medium text-rose-600"><AlertCircle className="h-3.5 w-3.5" aria-hidden /> {overdue} overdue</span>
          )}
          <span className={cn('inline-flex items-center gap-1 font-medium', deadlineToneClass[due.tone])}>
            {project.status === 'completed' ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> : <CalendarDays className="h-3.5 w-3.5" aria-hidden />}
            {due.label}
          </span>
        </div>
      </div>
    </Link>
  );
}
