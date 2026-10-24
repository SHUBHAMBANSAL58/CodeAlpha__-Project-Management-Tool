import { useEffect, useId, useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { projectService } from '../../services';
import { PROJECT_STATUSES } from '../../utils/constants';
import { dateOffset, todayStr } from '../../utils/dates';
import { hasErrors, validateProject } from '../../utils/validators';
import Button from '../ui/Button';
import { Field, Input, Select, Textarea } from '../ui/Field';
import Modal from '../ui/Modal';

const emptyForm = () => ({ name: '', description: '', status: 'planning', startDate: todayStr(), deadline: dateOffset(30) });

/** Create a project, or edit one when `project` is provided. */
export default function ProjectFormModal({ open, project, onClose, onSaved }) {
  const id = useId();
  const toast = useToast();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const editing = Boolean(project);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setForm(project
      ? { name: project.name, description: project.description, status: project.status, startDate: project.startDate, deadline: project.deadline }
      : emptyForm());
  }, [open, project]);

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors(({ [key]: _, ...rest }) => rest);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validateProject(form);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;
    setSaving(true);
    try {
      const saved = editing ? await projectService.update(project.id, form) : await projectService.create(form);
      toast.success(editing ? 'Project updated' : 'Project created', editing ? undefined : 'Invite teammates from the Team tab.');
      onSaved?.(saved);
    } catch (err) {
      if (err.fields) setErrors(err.fields);
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const fid = (k) => `${id}-${k}`;

  return (
    <Modal
      open={open}
      onClose={saving ? undefined : onClose}
      title={editing ? 'Edit project' : 'Create a project'}
      description={editing ? 'Update the details your team sees.' : "You'll be the owner and can add members afterwards."}
      footer={(
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" form={fid('form')} loading={saving}>{editing ? 'Save changes' : 'Create project'}</Button>
        </>
      )}
    >
      <form id={fid('form')} onSubmit={onSubmit} noValidate className="space-y-4">
        <Field label="Project name" htmlFor={fid('name')} error={errors.name} required>
          <Input id={fid('name')} value={form.name} onChange={set('name')} invalid={!!errors.name} placeholder="e.g. Website Redesign" maxLength={100} />
        </Field>
        <Field label="Description" htmlFor={fid('description')} error={errors.description} hint="What does done look like?">
          <Textarea id={fid('description')} value={form.description} onChange={set('description')} invalid={!!errors.description} rows={3} maxLength={2000} />
        </Field>
        <Field label="Status" htmlFor={fid('status')} error={errors.status} required>
          <Select id={fid('status')} value={form.status} onChange={set('status')} invalid={!!errors.status}>
            {PROJECT_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </Select>
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Start date" htmlFor={fid('startDate')} error={errors.startDate} required>
            <Input id={fid('startDate')} type="date" value={form.startDate} onChange={set('startDate')} invalid={!!errors.startDate} />
          </Field>
          <Field label="Deadline" htmlFor={fid('deadline')} error={errors.deadline} required>
            <Input id={fid('deadline')} type="date" value={form.deadline} min={form.startDate || undefined} onChange={set('deadline')} invalid={!!errors.deadline} />
          </Field>
        </div>
      </form>
    </Modal>
  );
}
