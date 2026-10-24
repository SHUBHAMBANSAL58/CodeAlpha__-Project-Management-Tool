import { useEffect, useId, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { taskService } from '../../services';
import { TASK_PRIORITIES, TASK_STATUSES } from '../../utils/constants';
import { dateOffset, formatDate, relativeTime, todayStr } from '../../utils/dates';
import { hasErrors, validateTask } from '../../utils/validators';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import ConfirmDialog from '../ui/ConfirmDialog';
import { Field, Input, Select, Textarea } from '../ui/Field';
import Modal from '../ui/Modal';

function defaultDeadline(project) {
  const week = dateOffset(7);
  if (project?.deadline && project.deadline < week) return project.deadline < todayStr() ? todayStr() : project.deadline;
  return week;
}

/**
 * Create a task in `project`, or edit `task` when provided.
 * `project` must include `members`, `memberIds`, `ownerId` and `deadline`.
 */
export default function TaskFormModal({ open, project, task, defaults, onClose, onSaved, onDeleted }) {
  const id = useId();
  const { user } = useAuth();
  const toast = useToast();
  const editing = Boolean(task);
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setForm(task
      ? { title: task.title, description: task.description, status: task.status, priority: task.priority, deadline: task.deadline ?? '', assigneeId: task.assigneeId ?? '' }
      : { title: '', description: '', status: 'todo', priority: 'medium', deadline: defaultDeadline(project), assigneeId: '', ...defaults });
  }, [open, task, project, defaults]);

  if (!project) return null;

  const canDelete = editing && (project.ownerId === user.id || task.createdById === user.id);

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors(({ [key]: _, ...rest }) => rest);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validateTask(form, { project, deadlineChanged: !editing || form.deadline !== task.deadline });
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;
    setSaving(true);
    try {
      const saved = editing ? await taskService.update(task.id, form) : await taskService.create(project.id, form);
      toast.success(editing ? 'Task updated' : 'Task created', saved.assignee && saved.assigneeId !== task?.assigneeId ? `Assigned to ${saved.assignee.name}` : undefined);
      onSaved?.(saved);
    } catch (err) {
      if (err.fields) setErrors(err.fields);
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    setDeleting(true);
    try {
      await taskService.remove(task.id);
      toast.success('Task deleted');
      setConfirming(false);
      onDeleted?.(task);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const fid = (k) => `${id}-${k}`;
  const busy = saving || deleting;

  return (
    <>
      <Modal
        open={open && !confirming}
        onClose={busy ? undefined : onClose}
        size="lg"
        title={editing ? 'Edit task' : 'New task'}
        description={project.name}
        footer={(
          <>
            {canDelete && (
              <Button variant="danger-ghost" onClick={() => setConfirming(true)} disabled={busy} className="sm:mr-auto">
                <Trash2 className="h-4 w-4" aria-hidden /> Delete task
              </Button>
            )}
            <Button variant="secondary" onClick={onClose} disabled={busy}>Cancel</Button>
            <Button type="submit" form={fid('form')} loading={saving}>{editing ? 'Save changes' : 'Create task'}</Button>
          </>
        )}
      >
        <form id={fid('form')} onSubmit={onSubmit} noValidate className="space-y-4">
          <Field label="Title" htmlFor={fid('title')} error={errors.title} required>
            <Input id={fid('title')} value={form.title ?? ''} onChange={set('title')} invalid={!!errors.title} placeholder="What needs to be done?" maxLength={200} />
          </Field>
          <Field label="Description" htmlFor={fid('description')} error={errors.description}>
            <Textarea id={fid('description')} value={form.description ?? ''} onChange={set('description')} invalid={!!errors.description} rows={3} placeholder="Add context, acceptance criteria, or links" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Status" htmlFor={fid('status')} error={errors.status} required>
              <Select id={fid('status')} value={form.status ?? 'todo'} onChange={set('status')} invalid={!!errors.status}>
                {TASK_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </Select>
            </Field>
            <Field label="Priority" htmlFor={fid('priority')} error={errors.priority} required>
              <Select id={fid('priority')} value={form.priority ?? 'medium'} onChange={set('priority')} invalid={!!errors.priority}>
                {TASK_PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </Select>
            </Field>
            <Field label="Assignee" htmlFor={fid('assigneeId')} error={errors.assigneeId} hint="Only project members can be assigned.">
              <Select id={fid('assigneeId')} value={form.assigneeId ?? ''} onChange={set('assigneeId')} invalid={!!errors.assigneeId}>
                <option value="">Unassigned</option>
                {project.members.map((m) => <option key={m.id} value={m.id}>{m.name}{m.id === user.id ? ' (you)' : ''}</option>)}
              </Select>
            </Field>
            <Field label="Deadline" htmlFor={fid('deadline')} error={errors.deadline} hint={project.deadline ? `Project ends ${formatDate(project.deadline)}` : undefined} required>
              <Input id={fid('deadline')} type="date" value={form.deadline ?? ''} onChange={set('deadline')} invalid={!!errors.deadline} max={project.deadline || undefined} />
            </Field>
          </div>
          {editing && (
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-500">
              <span className="inline-flex items-center gap-2">
                <Avatar user={task.createdBy} size="xs" />
                Created by <span className="font-medium text-slate-700">{task.createdBy?.name ?? 'Former member'}</span> · {formatDate(task.createdAt)}
              </span>
              <span>Last updated {relativeTime(task.updatedAt)}</span>
            </div>
          )}
        </form>
      </Modal>
      <ConfirmDialog
        open={confirming}
        title="Delete this task?"
        message={<>&ldquo;{task?.title}&rdquo; will be permanently removed from {project.name}.</>}
        confirmLabel="Delete task"
        loading={deleting}
        onConfirm={onDelete}
        onCancel={() => setConfirming(false)}
      />
    </>
  );
}
