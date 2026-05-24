import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, FlaskConical, CheckCircle, Clock, XCircle, ArrowRight } from 'lucide-react';
import api from '../api/client';
import useAuthStore from '../store/authStore';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="card p-5">
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
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/bookings/my').then(r => setBookings(r.data)).finally(() => setLoading(false));
  }, []);

  const stats = {
    total: bookings.length,
    approved: bookings.filter(b => b.status === 'approved').length,
    pending: bookings.filter(b => b.status === 'pending').length,
    rejected: bookings.filter(b => b.status === 'rejected').length,
  };

  const upcoming = bookings.filter(b => b.status === 'approved' && new Date(b.date) >= new Date()).slice(0, 4);

  const statusBadge = (s) => ({
    approved: <span className="badge-approved"><CheckCircle size={11} className="mr-1" />Approved</span>,
    pending: <span className="badge-pending"><Clock size={11} className="mr-1" />Pending</span>,
    rejected: <span className="badge-rejected"><XCircle size={11} className="mr-1" />Rejected</span>,
  }[s]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-heading font-bold text-slate-900">
          Good morning, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-500 mt-1">Here's an overview of your lab bookings.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={CalendarDays} label="Total Bookings" value={stats.total} color="bg-brand-600" />
        <StatCard icon={CheckCircle} label="Approved" value={stats.approved} color="bg-green-500" />
        <StatCard icon={Clock} label="Pending" value={stats.pending} color="bg-amber-500" />
        <StatCard icon={XCircle} label="Rejected" value={stats.rejected} color="bg-red-500" />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-heading font-semibold text-slate-900">Upcoming Sessions</h2>
            <Link to="/my-bookings" className="text-sm text-brand-600 flex items-center gap-1 hover:gap-2 transition-all">
              View all <ArrowRight size={13} />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-14 bg-surface-100 rounded-xl animate-pulse" />)}</div>
          ) : upcoming.length === 0 ? (
            <div className="text-center py-10">
              <FlaskConical size={32} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No upcoming sessions</p>
              <Link to="/labs" className="btn-primary text-sm mt-3 inline-block">Browse Labs</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map(b => (
                <div key={b.id} className="flex items-center justify-between p-4 bg-surface-50 rounded-xl border border-surface-200">
                  <div>
                    <p className="font-medium text-slate-900 text-sm">{b.lab_name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {new Date(b.date).toLocaleDateString('en-ZM', { weekday: 'short', day: 'numeric', month: 'short' })} · {b.start_time.slice(0,5)} – {b.end_time.slice(0,5)}
                    </p>
                  </div>
                  {statusBadge(b.status)}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6 flex flex-col gap-4">
          <h2 className="font-heading font-semibold text-slate-900">Quick Actions</h2>
          <Link to="/labs" className="flex items-center gap-3 p-4 bg-brand-50 rounded-xl border border-brand-100 hover:border-brand-200 transition-colors group">
            <div className="w-9 h-9 bg-brand-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <FlaskConical size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">Browse Labs</p>
              <p className="text-xs text-slate-500">Find & book a session</p>
            </div>
            <ArrowRight size={14} className="ml-auto text-brand-400 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to="/my-bookings" className="flex items-center gap-3 p-4 bg-surface-50 rounded-xl border border-surface-200 hover:border-surface-300 transition-colors group">
            <div className="w-9 h-9 bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
              <CalendarDays size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">My Bookings</p>
              <p className="text-xs text-slate-500">View booking history</p>
            </div>
            <ArrowRight size={14} className="ml-auto text-slate-400 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
