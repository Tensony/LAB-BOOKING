import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, FlaskConical, CheckCircle, Clock, XCircle, ArrowRight, Sparkles } from 'lucide-react';
import api from '../api/client';
import useAuthStore from '../store/authStore';
import StatusBadge from '../components/StatusBadge';
import usePageTitle from '../hooks/usePageTitle';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="card p-5 transition-transform duration-300 ease-out hover:-translate-y-1 hover:shadow-lg animate-slide-up">
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm text-slate-500">{label}</span>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={16} className="text-white" />
      </div>
    </div>
    <p className="text-3xl font-heading font-bold text-slate-900">{value}</p>
  </div>
);

const Dashboard = () => {
  usePageTitle('Dashboard');
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    api.get('/bookings/my').then(r => setBookings(r.data)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  const stats = {
    total: bookings.length,
    approved: bookings.filter(b => b.status === 'approved').length,
    pending: bookings.filter(b => b.status === 'pending').length,
    rejected: bookings.filter(b => b.status === 'rejected').length,
  };

  const upcoming = bookings.filter(b => b.status === 'approved' && new Date(b.date) >= new Date()).slice(0, 4);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-8 rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-100 p-8 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Live dashboard</p>
            <h1 className="mt-3 text-3xl md:text-4xl font-heading font-bold text-slate-900 leading-tight">
              Welcome back, {user?.name?.split(' ')[0]}.
            </h1>
            <p className="mt-3 text-slate-500 max-w-2xl">Your latest booking stats and upcoming sessions are refreshed automatically.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm text-white shadow-sm ring-1 ring-slate-300/20">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <Sparkles size={16} className="text-white" />
            Live as of {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={CalendarDays} label="Total Bookings" value={stats.total} color="bg-brand-600" />
        <StatCard icon={CheckCircle} label="Approved" value={stats.approved} color="bg-green-500" />
        <StatCard icon={Clock} label="Pending" value={stats.pending} color="bg-amber-500" />
        <StatCard icon={XCircle} label="Rejected" value={stats.rejected} color="bg-red-500" />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 card p-6 border border-slate-200 shadow-sm transition hover:-translate-y-1 hover:shadow-lg duration-300">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-heading font-semibold text-slate-900">Upcoming Sessions</h2>
              <p className="text-sm text-slate-500">A snapshot of approved sessions coming up soon.</p>
            </div>
            <Link to="/my-bookings" className="text-sm text-brand-600 flex items-center gap-1 hover:gap-2 transition-all">
              View all <ArrowRight size={13} />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="h-14 rounded-2xl bg-surface-100 animate-pulse" />
              ))}
            </div>
          ) : upcoming.length === 0 ? (
            <div className="text-center py-10">
              <FlaskConical size={32} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No upcoming sessions</p>
              <Link to="/labs" className="btn-primary text-sm mt-3 inline-block">Browse Labs</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {upcoming.map(b => (
                <div key={b.id} className="group flex items-center justify-between gap-3 rounded-3xl border border-surface-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{b.lab_name}</p>
                    <p className="mt-2 text-xs text-slate-500">
                      {new Date(b.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{b.start_time.slice(0,5)} – {b.end_time.slice(0,5)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-[0.25em] text-slate-400">Status</span>
                    <StatusBadge status={b.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6 flex flex-col gap-4">
          <h2 className="font-heading font-semibold text-slate-900">Quick Actions</h2>
          <Link to="/labs" className="flex items-center gap-3 p-4 rounded-3xl border border-brand-100 bg-gradient-to-r from-brand-50 via-white to-brand-50 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-lg group">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow">
              <FlaskConical size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Browse Labs</p>
              <p className="text-xs text-slate-500">Find your next session</p>
            </div>
            <ArrowRight size={14} className="ml-auto text-brand-400 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link to="/my-bookings" className="flex items-center gap-3 p-4 rounded-3xl border border-surface-200 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-lg group">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-white shadow">
              <CalendarDays size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">My Bookings</p>
              <p className="text-xs text-slate-500">See all your sessions</p>
            </div>
            <ArrowRight size={14} className="ml-auto text-slate-400 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
