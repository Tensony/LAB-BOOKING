import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import usePageTitle from '../hooks/usePageTitle';
import {
  FlaskConical,
  CalendarDays,
  ShieldCheck,
  Upload,
  ArrowRight,
  CheckCircle2,
  Clock,
  Users,
  Sparkles,
} from 'lucide-react';
import PublicHeader from '../components/PublicHeader';

const features = [
  {
    icon: CalendarDays,
    title: 'Book lab slots',
    description: 'Browse available labs, pick a date and time, and submit your booking in seconds.',
    color: 'bg-brand-100 text-brand-700',
  },
  {
    icon: ShieldCheck,
    title: 'Admin approval',
    description: 'Every request is reviewed by lab staff so rooms stay organized and fairly allocated.',
    color: 'bg-sky-100 text-sky-700',
  },
  {
    icon: Upload,
    title: 'Upload reports',
    description: 'Attach lab reports or documents to approved sessions — all in one place.',
    color: 'bg-violet-100 text-violet-700',
  },
  {
    icon: Users,
    title: 'Built for ZUT',
    description: 'Designed for students and administrators at Zambia University of Technology.',
    color: 'bg-amber-100 text-amber-700',
  },
];

const steps = [
  { step: '01', title: 'Create your account', text: 'Register with your university email and sign in.' },
  { step: '02', title: 'Choose a lab & slot', text: 'Pick a room, date, and time that fits your schedule.' },
  { step: '03', title: 'Get approved & go', text: 'Once approved, show up for your session and upload your work.' },
];

const Landing = () => {
  const { hash } = useLocation();
  usePageTitle(null);

  useEffect(() => {
    if (!hash) return;
    const el = document.querySelector(hash);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [hash]);

  return (
  <div className="min-h-screen bg-surface-50 dark:bg-surface-950 text-slate-800 dark:text-slate-200">
    <PublicHeader />

    {/* Hero */}
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-brand-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-sky-100/60 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-800 mb-6">
              <Sparkles size={14} />
              ZUT Lab Booking System
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-slate-900 dark:text-white leading-[1.1] tracking-tight">
              Book lab time.
              <span className="block text-brand-600 mt-1">Without the hassle.</span>
            </h1>
            <p className="mt-6 text-lg text-slate-600 max-w-xl leading-relaxed">
              LabBook helps students reserve computer labs, track approvals, and upload session reports — 
              while admins manage rooms, slots, and bookings from one dashboard.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Link to="/register" className="btn-primary inline-flex items-center justify-center gap-2 py-3 px-6 text-base shadow-lg shadow-brand-500/25">
                Get started free
                <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn-secondary inline-flex items-center justify-center gap-2 py-3 px-6 text-base">
                Sign in
              </Link>
            </div>
            <ul className="mt-10 flex flex-col sm:flex-row gap-4 sm:gap-8 text-sm text-slate-600">
              {['Free for students', 'Real-time slot availability', 'Admin-reviewed bookings'].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-brand-600 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative animate-slide-up lg:pl-4">
            <div className="card p-6 md:p-8 shadow-xl shadow-slate-200/60 border-slate-200/80">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Upcoming session</p>
                  <p className="font-heading font-bold text-xl text-slate-900 mt-1">Computer Lab A</p>
                </div>
                <span className="badge-approved">
                  <CheckCircle2 size={11} className="mr-1" />
                  Approved
                </span>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Date', value: 'Mon, 26 May 2026' },
                  { label: 'Time', value: '10:00 – 12:00' },
                  { label: 'Location', value: 'Block C, Room 101' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center py-3 border-b border-surface-100 last:border-0">
                    <span className="text-sm text-slate-500">{label}</span>
                    <span className="text-sm font-medium text-slate-900">{value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3">
                {[
                  { icon: FlaskConical, label: '4 Labs' },
                  { icon: Clock, label: 'Fast booking' },
                  { icon: CalendarDays, label: 'Live slots' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="rounded-xl bg-surface-50 p-3 text-center">
                    <Icon size={18} className="text-brand-600 mx-auto mb-1.5" />
                    <p className="text-xs font-medium text-slate-600">{label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 hidden md:block card px-4 py-3 shadow-lg animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <p className="text-xs text-slate-500">Pending review</p>
              <p className="text-sm font-semibold text-slate-900">Software Engineering Lab</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Features */}
    <section id="features" className="py-20 md:py-28 bg-white dark:bg-surface-900 border-y border-surface-200 dark:border-surface-800 scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600 mb-3">Features</p>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-slate-900">
            Everything you need to manage lab time
          </h2>
          <p className="mt-4 text-slate-600">
            A simple flow for students and powerful tools for administrators.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map(({ icon: Icon, title, description, color }) => (
            <div
              key={title}
              className="group card p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                <Icon size={20} />
              </div>
              <h3 className="font-heading font-semibold text-slate-900 mb-2">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* How it works */}
    <section id="how-it-works" className="py-20 md:py-28 scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600 mb-3">How it works</p>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-slate-900">
            Three steps to your next session
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map(({ step, title, text }) => (
            <div key={step} className="relative text-center md:text-left">
              <span className="font-heading text-5xl font-bold text-brand-100">{step}</span>
              <h3 className="font-heading font-semibold text-lg text-slate-900 mt-2 mb-2">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-brand-700 px-8 py-14 md:px-16 md:py-16 text-center md:text-left">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-white">
                Ready to book your next lab session?
              </h2>
              <p className="mt-3 text-brand-100 text-sm md:text-base max-w-md">
                Join LabBook today — browse labs, reserve a slot, and track your bookings from one place.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row md:justify-end gap-3">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 bg-white text-brand-700 font-medium px-6 py-3 rounded-xl hover:bg-brand-50 transition-colors shadow-lg"
              >
                Create account
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 border border-white/30 text-white font-medium px-6 py-3 rounded-xl hover:bg-white/10 transition-colors"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Footer */}
    <footer className="border-t border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 py-10">
      <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
            <FlaskConical size={14} className="text-white" />
          </div>
          <span className="font-heading font-semibold text-slate-900">LabBook</span>
        </div>
        <p className="text-sm text-slate-500 text-center">
          Zambia University of Technology · Lab Booking System
        </p>
        <div className="flex gap-4 text-sm text-slate-500">
          <Link to="/login" className="hover:text-brand-600 transition-colors">Sign in</Link>
          <Link to="/register" className="hover:text-brand-600 transition-colors">Register</Link>
        </div>
      </div>
    </footer>
  </div>
  );
};

export default Landing;
