import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FlaskConical, Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const PublicHeader = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/60 dark:border-surface-800 bg-white/70 dark:bg-surface-950/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-2.5 group shrink-0" onClick={() => setOpen(false)}>
          <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center shadow-md shadow-brand-500/25 group-hover:scale-105 transition-transform">
            <FlaskConical size={18} className="text-white" />
          </div>
          <span className="font-heading font-bold text-lg text-slate-900 dark:text-white">LabBook</span>
        </Link>

        <nav className="hidden sm:flex items-center gap-8 text-sm text-slate-600 dark:text-slate-400">
          <Link to="/#features" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Features</Link>
          <Link to="/#how-it-works" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">How it works</Link>
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle />
          <Link
            to="/login"
            className="hidden sm:inline px-3.5 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-brand-600 transition-colors"
          >
            Sign in
          </Link>
          <Link to="/register" className="hidden sm:inline btn-primary text-sm py-2 px-4 shadow-md shadow-brand-500/20">
            Get started
          </Link>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="sm:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-surface-100 dark:hover:bg-surface-800"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="sm:hidden border-t border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-950 px-4 py-4 space-y-1">
          <Link to="/#features" onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-xl text-sm text-slate-600 dark:text-slate-400 hover:bg-surface-100 dark:hover:bg-surface-800">
            Features
          </Link>
          <Link to="/#how-it-works" onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-xl text-sm text-slate-600 dark:text-slate-400 hover:bg-surface-100 dark:hover:bg-surface-800">
            How it works
          </Link>
          <Link to="/login" onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-xl text-sm text-slate-700 dark:text-slate-300 hover:bg-surface-100 dark:hover:bg-surface-800">
            Sign in
          </Link>
          <Link to="/register" onClick={() => setOpen(false)} className="block btn-primary text-sm text-center py-2.5 mt-2">
            Get started
          </Link>
        </div>
      )}
    </header>
  );
};

export default PublicHeader;
