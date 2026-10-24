import { Link } from 'react-router-dom';
import { relativeTime } from '../../utils/dates';
import Avatar from '../ui/Avatar';

export default function ActivityFeed({ items }) {
  if (!items.length) {
    return <p className="px-5 pb-5 text-sm text-slate-500">Activity from your projects will show up here.</p>;
  }
  return (
    <ol className="space-y-4 px-5 pb-5">
      {items.map((item) => (
        <li key={item.id} className="flex gap-3">
          <Avatar user={item.actor} size="xs" className="mt-0.5" />
          <div className="min-w-0 text-sm">
            <p className="text-slate-700">
              <span className="font-medium text-slate-900">{item.actor?.name ?? 'Someone'}</span> {item.message}
            </p>
            <p className="mt-0.5 text-xs text-slate-400">
              {item.project && <Link to={`/app/projects/${item.project.id}`} className="font-medium text-slate-500 hover:text-brand-700">{item.project.name}</Link>}
              {item.project && ' · '}
              {relativeTime(item.createdAt)}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
