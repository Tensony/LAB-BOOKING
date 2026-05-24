import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, FlaskConical, Users, Clock, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import api from '../api/client';

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className="card p-5">
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm text-slate-500">{label}</span>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={16} className="text-white" />
      </div>
    </div>
    <p className="text-3xl font-heading font-bold text-slate-900">{value ?? '—'}</p>
    {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/bookings/admin/stats'),
      api.get('/bookings/admin/all'),
    ]).then(([s, b]) => {
      setStats(s.data);
      setRecent(b.data.slice(0, 6));
    }).finally(() => setLoading(false));
  }, []);

  const handleStatus = async (id, status) => {
    await api.put(`/bookings/${id}/status`, { status });
    const [s, b] = await Promise.all([api.get('/bookings/admin/stats'), api.get('/bookings/admin/all')]);
    setStats(s.data);
    setRecent(b.data.slice(0, 6));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-heading font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-500 mt-1">Overview of the lab booking system</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="col-span-2 md:col-span-1 lg:col-span-2">
          <StatCard icon={BookOpen} label="Total Bookings" value={stats?.total} color="bg-brand-600" />
        </div>
        <StatCard icon={Clock} label="Pending" value={stats?.pending} color="bg-amber-500" sub="Needs review" />
        <StatCard icon={CheckCircle} label="Approved" value={stats?.approved} color="bg-green-500" />
        <StatCard icon={XCircle} label="Rejected" value={stats?.rejected} color="bg-red-500" />
        <StatCard icon={FlaskConical} label="Labs" value={stats?.labs} color="bg-violet-500" />
        <StatCard icon={Users} label="Students" value={stats?.students} color="bg-sky-500" />
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading font-semibold text-slate-900">Recent Bookings</h2>
          <Link to="/admin/bookings" className="text-sm text-brand-600 flex items-center gap-1 hover:gap-2 transition-all">
            View all <ArrowRight size={13} />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-16 bg-surface-100 rounded-xl animate-pulse" />)}</div>
        ) : recent.length === 0 ? (
          <p className="text-center text-slate-400 py-8 text-sm">No bookings yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-100">
                  {['Student', 'Lab', 'Date & Time', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider pb-3 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-50">
                {recent.map(b => (
                  <tr key={b.id} className="hover:bg-surface-50 transition-colors">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-slate-900">{b.student_name}</p>
                      <p className="text-xs text-slate-400">{b.student_email}</p>
                    </td>
                    <td className="py-3 pr-4 text-slate-700">{b.lab_name}</td>
                    <td className="py-3 pr-4">
                      <p className="text-slate-700">{new Date(b.date).toLocaleDateString('en-ZM', { day: 'numeric', month: 'short' })}</p>
                      <p className="text-xs text-slate-400">{b.start_time.slice(0,5)} – {b.end_time.slice(0,5)}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`badge-${b.status}`}>{b.status}</span>
                    </td>
                    <td className="py-3">
                      {b.status === 'pending' && (
                        <div className="flex gap-1.5">
                          <button onClick={() => handleStatus(b.id, 'approved')}
                            className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-lg hover:bg-green-100 transition-colors">
                            Approve
                          </button>
                          <button onClick={() => handleStatus(b.id, 'rejected')}
                            className="text-xs bg-red-50 text-red-600 px-2.5 py-1 rounded-lg hover:bg-red-100 transition-colors">
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
