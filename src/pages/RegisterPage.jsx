import { useId, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { Field, Input } from '../components/ui/Field';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { hasErrors, validateRegistration } from '../utils/validators';

export default function RegisterPage() {
  const id = useId();
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors(({ [key]: _, ...rest }) => rest);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validateRegistration(form);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;
    setLoading(true);
    try {
      const user = await register({ name: form.name, email: form.email, password: form.password });
      toast.success(`Welcome to Cadence, ${user.name.split(' ')[0]}!`, 'Create your first project to get started.');
      navigate('/app', { replace: true });
    } catch (err) {
      if (err.fields) setErrors(err.fields);
      else toast.error(err.message);
      setLoading(false);
    }
  };

  const fid = (k) => `${id}-${k}`;

  return (
    <>
      <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
      <p className="mt-1.5 text-sm text-slate-500">Start organizing projects with your team in minutes.</p>
      <form onSubmit={onSubmit} noValidate className="mt-8 space-y-4">
        <Field label="Full name" htmlFor={fid('name')} error={errors.name}>
          <Input id={fid('name')} autoComplete="name" value={form.name} onChange={set('name')} invalid={!!errors.name} placeholder="Jordan Lee" />
        </Field>
        <Field label="Work email" htmlFor={fid('email')} error={errors.email}>
          <Input id={fid('email')} type="email" autoComplete="email" value={form.email} onChange={set('email')} invalid={!!errors.email} placeholder="you@company.com" />
        </Field>
        <Field label="Password" htmlFor={fid('password')} error={errors.password} hint="At least 8 characters, including a letter and a number.">
          <Input id={fid('password')} type="password" autoComplete="new-password" value={form.password} onChange={set('password')} invalid={!!errors.password} />
        </Field>
        <Field label="Confirm password" htmlFor={fid('confirmPassword')} error={errors.confirmPassword}>
          <Input id={fid('confirmPassword')} type="password" autoComplete="new-password" value={form.confirmPassword} onChange={set('confirmPassword')} invalid={!!errors.confirmPassword} />
        </Field>
        <Button type="submit" size="lg" className="w-full" loading={loading}>Create account</Button>
      </form>
      <p className="mt-8 text-center text-sm text-slate-500">
        Already have an account? <Link to="/login" className="font-medium text-brand-700 hover:text-brand-800">Sign in</Link>
      </p>
    </>
  );
}
