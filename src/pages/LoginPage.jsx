import { useId, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import Button from '../components/ui/Button';
import { Field, Input } from '../components/ui/Field';
import { useAuth } from '../context/AuthContext';
import { DEMO_ACCOUNTS } from '../data/fixtures';
import { hasErrors, validateLogin } from '../utils/validators';

export default function LoginPage() {
  const id = useId();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors(({ [key]: _, ...rest }) => rest);
    setFormError('');
  };

  const submit = async (credentials) => {
    const nextErrors = validateLogin(credentials);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;
    setLoading(true);
    try {
      await login(credentials);
      navigate(location.state?.from?.pathname ?? '/app', { replace: true });
    } catch (err) {
      setFormError(err.message);
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
      <p className="mt-1.5 text-sm text-slate-500">Sign in to pick up where your team left off.</p>

      <form onSubmit={(e) => { e.preventDefault(); submit(form); }} noValidate className="mt-8 space-y-4">
        {formError && <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">{formError}</div>}
        <Field label="Email" htmlFor={`${id}-email`} error={errors.email}>
          <Input id={`${id}-email`} type="email" autoComplete="email" value={form.email} onChange={set('email')} invalid={!!errors.email} placeholder="you@company.com" />
        </Field>
        <Field label="Password" htmlFor={`${id}-password`} error={errors.password}>
          <Input id={`${id}-password`} type="password" autoComplete="current-password" value={form.password} onChange={set('password')} invalid={!!errors.password} />
        </Field>
        <Button type="submit" size="lg" className="w-full" loading={loading}>Sign in</Button>
      </form>

      <div className="mt-6 rounded-xl border border-brand-100 bg-brand-50/60 p-4">
        <p className="flex items-center gap-1.5 text-sm font-medium text-brand-800"><Sparkles className="h-4 w-4" aria-hidden /> Explore the demo workspace</p>
        <p className="mt-1 text-xs text-brand-800/80">Sign in as a sample teammate to see projects, boards, and the dashboard filled in.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {DEMO_ACCOUNTS.map((a) => (
            <Button key={a.email} size="sm" variant="secondary" disabled={loading} onClick={() => submit({ email: a.email, password: 'demo-password-1' })}>
              {a.name.split(' ')[0]} · {a.title}
            </Button>
          ))}
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-slate-500">
        New to Cadence? <Link to="/register" className="font-medium text-brand-700 hover:text-brand-800">Create an account</Link>
      </p>
    </>
  );
}
