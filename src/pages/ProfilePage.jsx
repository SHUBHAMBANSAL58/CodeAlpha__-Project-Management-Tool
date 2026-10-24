import { useEffect, useId, useState } from 'react';
import { CalendarDays, KeyRound, LogOut, RotateCcw, UserRound } from 'lucide-react';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { Field, Input } from '../components/ui/Field';
import { Skeleton } from '../components/ui/Spinner';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useAsync } from '../hooks/useAsync';
import { resetDemoData, userService } from '../services';
import { formatDate } from '../utils/dates';
import { hasErrors, validatePassword, validateProfile } from '../utils/validators';

function Section({ icon: Icon, title, description, children }) {
  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600"><Icon className="h-4 w-4" aria-hidden /></span>
        <div>
          <h2 className="font-semibold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </div>
      {children}
    </Card>
  );
}

function ProfileForm() {
  const id = useId();
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ name: user.name, email: user.email, title: user.title ?? '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const dirty = form.name !== user.name || form.email !== user.email || form.title !== (user.title ?? '');

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors(({ [key]: _, ...rest }) => rest);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validateProfile(form);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;
    setSaving(true);
    try {
      const { user: updated } = await userService.updateProfile(form);
      setUser(updated);
      setForm({ name: updated.name, email: updated.email, title: updated.title ?? '' });
      toast.success('Profile saved');
    } catch (err) {
      if (err.fields) setErrors(err.fields);
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" htmlFor={`${id}-name`} error={errors.name} required>
          <Input id={`${id}-name`} value={form.name} onChange={set('name')} invalid={!!errors.name} autoComplete="name" />
        </Field>
        <Field label="Job title" htmlFor={`${id}-title`} error={errors.title}>
          <Input id={`${id}-title`} value={form.title} onChange={set('title')} invalid={!!errors.title} placeholder="e.g. Product Designer" />
        </Field>
      </div>
      <Field label="Email" htmlFor={`${id}-email`} error={errors.email} hint="Teammates use this email to add you to projects." required>
        <Input id={`${id}-email`} type="email" value={form.email} onChange={set('email')} invalid={!!errors.email} autoComplete="email" />
      </Field>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" disabled={!dirty || saving} onClick={() => { setForm({ name: user.name, email: user.email, title: user.title ?? '' }); setErrors({}); }}>Discard</Button>
        <Button type="submit" loading={saving} disabled={!dirty}>Save profile</Button>
      </div>
    </form>
  );
}

function PasswordForm() {
  const id = useId();
  const toast = useToast();
  const empty = { currentPassword: '', newPassword: '', confirmPassword: '' };
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors(({ [key]: _, ...rest }) => rest);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!form.currentPassword) nextErrors.currentPassword = 'Current password is required';
    const pw = validatePassword(form.newPassword);
    if (pw) nextErrors.newPassword = pw;
    if (form.confirmPassword !== form.newPassword) nextErrors.confirmPassword = 'Passwords do not match';
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;
    setSaving(true);
    try {
      await userService.changePassword(form);
      setForm(empty);
      toast.success('Password updated');
    } catch (err) {
      if (err.fields) setErrors(err.fields);
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <Field label="Current password" htmlFor={`${id}-current`} error={errors.currentPassword} required>
        <Input id={`${id}-current`} type="password" value={form.currentPassword} onChange={set('currentPassword')} invalid={!!errors.currentPassword} autoComplete="current-password" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="New password" htmlFor={`${id}-new`} error={errors.newPassword} hint="8+ characters with a letter and a number." required>
          <Input id={`${id}-new`} type="password" value={form.newPassword} onChange={set('newPassword')} invalid={!!errors.newPassword} autoComplete="new-password" />
        </Field>
        <Field label="Confirm new password" htmlFor={`${id}-confirm`} error={errors.confirmPassword} required>
          <Input id={`${id}-confirm`} type="password" value={form.confirmPassword} onChange={set('confirmPassword')} invalid={!!errors.confirmPassword} autoComplete="new-password" />
        </Field>
      </div>
      <div className="flex justify-end">
        <Button type="submit" variant="secondary" loading={saving}>Update password</Button>
      </div>
    </form>
  );
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const summary = useAsync(() => userService.summary(), [user.id]);
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => { document.title = 'Profile · Cadence'; return () => { document.title = 'Cadence — Project Management'; }; }, []);

  const onReset = async () => {
    setResetting(true);
    try {
      await resetDemoData();
      toast.success('Demo workspace restored');
      // The signed-in account may not exist in the fresh seed data.
      window.location.assign('/app');
    } catch (err) {
      toast.error(err.message);
      setResetting(false);
    }
  };

  const stats = summary.data;

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Profile & Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your account details and security.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Section icon={UserRound} title="Profile" description="How you appear to teammates on tasks and projects.">
            <ProfileForm />
          </Section>
          <Section icon={KeyRound} title="Password" description="Use a unique password you don't use elsewhere.">
            <PasswordForm />
          </Section>
        </div>

        <div className="space-y-6">
          <Card className="p-6 text-center">
            <Avatar user={user} size="lg" className="mx-auto" />
            <p className="mt-3 font-semibold text-slate-900">{user.name}</p>
            <p className="text-sm text-slate-500">{user.title || user.email}</p>
            <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-400"><CalendarDays className="h-3.5 w-3.5" aria-hidden /> Member since {formatDate(user.createdAt)}</p>
            <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5 text-left">
              {[
                ['Projects owned', stats?.projectsOwned],
                ['Projects joined', stats?.projectsJoined],
                ['Tasks assigned', stats?.tasksAssigned],
                ['Tasks completed', stats?.tasksCompleted],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-slate-50 p-3">
                  <dt className="text-xs text-slate-500">{label}</dt>
                  <dd className="mt-0.5 font-display text-lg font-bold tabular-nums text-slate-900">{value ?? <Skeleton className="h-6 w-8" />}</dd>
                </div>
              ))}
            </dl>
            <Button variant="secondary" className="mt-5 w-full" onClick={logout}><LogOut className="h-4 w-4" aria-hidden /> Sign out</Button>
          </Card>

          <Card className="p-5">
            <h2 className="flex items-center gap-2 font-semibold text-slate-900"><RotateCcw className="h-4 w-4 text-slate-500" aria-hidden /> Demo workspace</h2>
            <p className="mt-1 text-sm text-slate-500">This preview stores data in your browser. Restore the original sample projects and tasks at any time.</p>
            <Button variant="danger-ghost" className="mt-3 -ml-3" onClick={() => setConfirmReset(true)}>Reset demo data</Button>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={confirmReset}
        title="Reset demo data?"
        message="All projects, tasks, and accounts created in this browser will be replaced with the original sample workspace."
        confirmLabel="Reset data"
        loading={resetting}
        onConfirm={onReset}
        onCancel={() => setConfirmReset(false)}
      />
    </>
  );
}
