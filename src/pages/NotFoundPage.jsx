import { Link } from 'react-router-dom';
import Logo from '../components/layout/Logo';
import { buttonClasses } from '../components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <Logo />
      <p className="mt-10 font-display text-6xl font-extrabold text-slate-200">404</p>
      <h1 className="mt-2 text-xl font-bold text-slate-900">This page doesn&apos;t exist</h1>
      <p className="mt-1 text-sm text-slate-500">The link may be broken, or the page may have moved.</p>
      <Link to="/app" className={buttonClasses('primary', 'md', 'mt-6')}>Go to dashboard</Link>
    </div>
  );
}
