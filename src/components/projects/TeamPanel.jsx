import { useId, useMemo, useState } from 'react';
import { Crown, Lock, UserMinus, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { projectService } from '../../services';
import { validateEmail } from '../../utils/validators';
import Avatar from '../ui/Avatar';
import { StatusBadge } from '../ui/Badge';
import Button from '../ui/Button';
import { Card } from '../ui/Card';
import ConfirmDialog from '../ui/ConfirmDialog';
import { Field, Input } from '../ui/Field';

/** Members of a project, their assigned work, and owner-only membership controls. */
export default function TeamPanel({ project, tasks, onProjectChange, onOpenTask }) {
  const { user } = useAuth();
  const toast = useToast();
  const inputId = useId();
  const isOwner = project.ownerId === user.id;
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState(null);
  const [removeBusy, setRemoveBusy] = useState(false);

  const workload = useMemo(() => {
    const map = new Map(project.members.map((m) => [m.id, []]));
    tasks.forEach((t) => t.assigneeId && map.get(t.assigneeId)?.push(t));
    return map;
  }, [project.members, tasks]);

  const unassigned = tasks.filter((t) => !t.assigneeId && t.status !== 'completed');

  const onAdd = async (e) => {
    e.preventDefault();
    const emailError = validateEmail(email);
    if (emailError) { setError(emailError); return; }
    setAdding(true);
    try {
      const updated = await projectService.addMember(project.id, { email });
      const added = updated.members.find((m) => m.email === email.trim().toLowerCase());
      toast.success(`${added?.name ?? 'Member'} joined ${project.name}`);
      setEmail('');
      onProjectChange(updated);
    } catch (err) {
      setError(err.fields?.email ?? err.message);
      toast.error(err.message);
    } finally {
      setAdding(false);
    }
  };

  const onRemove = async () => {
    setRemoveBusy(true);
    try {
      const updated = await projectService.removeMember(project.id, removing.id);
      toast.success(`${removing.name} was removed`, 'Their open tasks are now unassigned.');
      setRemoving(null);
      onProjectChange(updated);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setRemoveBusy(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        {project.members.map((member) => {
          const assigned = workload.get(member.id) ?? [];
          const open = assigned.filter((t) => t.status !== 'completed');
          const memberIsOwner = member.id === project.ownerId;
          return (
            <Card key={member.id} className="p-5">
              <div className="flex flex-wrap items-center gap-3">
                <Avatar user={member} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 font-semibold text-slate-900">
                    {member.name}
                    {member.id === user.id && <span className="text-xs font-normal text-slate-400">(you)</span>}
                  </p>
                  <p className="truncate text-sm text-slate-500">{member.title || member.email}</p>
                </div>
                <span className={memberIsOwner ? 'inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-200 ring-inset' : 'rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600'}>
                  {memberIsOwner && <Crown className="h-3 w-3" aria-hidden />}
                  {memberIsOwner ? 'Owner' : 'Member'}
                </span>
                {isOwner && !memberIsOwner && (
                  <Button variant="danger-ghost" size="sm" onClick={() => setRemoving(member)} aria-label={`Remove ${member.name}`}>
                    <UserMinus className="h-4 w-4" aria-hidden /> Remove
                  </Button>
                )}
              </div>
              <div className="mt-4 flex gap-6 text-sm">
                <p><span className="font-semibold tabular-nums text-slate-900">{open.length}</span> <span className="text-slate-500">open</span></p>
                <p><span className="font-semibold tabular-nums text-slate-900">{assigned.length - open.length}</span> <span className="text-slate-500">completed</span></p>
              </div>
              {open.length > 0 && (
                <ul className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-100">
                  {open.map((t) => (
                    <li key={t.id}>
                      <button type="button" onClick={() => onOpenTask(t)} className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-slate-50">
                        <span className={t.isOverdue ? 'truncate font-medium text-rose-700' : 'truncate text-slate-700'}>{t.title}</span>
                        <StatusBadge status={t.status} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          );
        })}
      </div>

      <div className="space-y-4">
        <Card className="p-5">
          <h3 className="flex items-center gap-2 font-semibold text-slate-900"><UserPlus className="h-4 w-4 text-brand-600" aria-hidden /> Add a team member</h3>
          {isOwner ? (
            <form onSubmit={onAdd} noValidate className="mt-4 space-y-3">
              <Field label="Email address" htmlFor={inputId} error={error} hint="They need a Cadence account first.">
                <Input id={inputId} type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} invalid={!!error} placeholder="teammate@company.com" autoComplete="off" />
              </Field>
              <Button type="submit" loading={adding} className="w-full">Add to project</Button>
            </form>
          ) : (
            <div className="mt-3 flex gap-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
              <Lock className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
              <p>Only <span className="font-medium text-slate-800">{project.owner?.name}</span> (project owner) can add or remove members.</p>
            </div>
          )}
        </Card>
        <Card className="p-5">
          <h3 className="font-semibold text-slate-900">Unassigned work</h3>
          {unassigned.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">Every open task has an owner.</p>
          ) : (
            <ul className="mt-3 space-y-1">
              {unassigned.map((t) => (
                <li key={t.id}>
                  <button type="button" onClick={() => onOpenTask(t)} className="w-full truncate rounded-lg px-2 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-50">{t.title}</button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <ConfirmDialog
        open={Boolean(removing)}
        title="Remove team member?"
        message={<>Remove <strong>{removing?.name}</strong> from {project.name}? They&apos;ll lose access, and any tasks assigned to them become unassigned.</>}
        confirmLabel="Remove member"
        loading={removeBusy}
        onConfirm={onRemove}
        onCancel={() => setRemoving(null)}
      />
    </div>
  );
}
