import { Link } from 'react-router-dom';
import { FlaskConical } from 'lucide-react';

const PublicHeader = () => (
  <header className="sticky top-0 z-50 border-b border-white/60 bg-white/70 backdrop-blur-xl">
    <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2.5 group">
        <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center shadow-md shadow-brand-500/25 group-hover:scale-105 transition-transform">
          <FlaskConical size={18} className="text-white" />
        </div>
        <span className="font-heading font-bold text-lg text-slate-900">LabBook</span>
      </Link>

      <nav className="hidden sm:flex items-center gap-8 text-sm text-slate-600">
        <Link to="/#features" className="hover:text-brand-600 transition-colors">Features</Link>
        <Link to="/#how-it-works" className="hover:text-brand-600 transition-colors">How it works</Link>
      </nav>

      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          to="/login"
          className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-brand-600 transition-colors"
        >
          Sign in
        </Link>
        <Link to="/register" className="btn-primary text-sm py-2 px-4 shadow-md shadow-brand-500/20">
          Get started
        </Link>
      </div>
    </div>
  </header>
);

export default PublicHeader;
