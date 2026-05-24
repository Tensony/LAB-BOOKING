import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  FlaskConical,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  RefreshCw,
  Search,
} from 'lucide-react';
import api from '../api/client';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';

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
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortDirection, setSortDirection] = useState('desc');
  const [statusConfirm, setStatusConfirm] = useState(null);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);

    try {
      const [s, b] = await Promise.all([
        api.get('/bookings/admin/stats'),
        api.get('/bookings/admin/all'),
      ]);
      setStats(s.data);
      setRecent(b.data);
    } catch (err) {
      setError('Unable to load dashboard. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleStatus = async (id, status) => {
    setLoading(true);
    try {
      await api.put(`/bookings/${id}/status`, { status });
      await loadDashboard();
    } catch (err) {
      setError('Failed to update booking status.');
      console.error(err);
      setLoading(false);
    } finally {
      setStatusConfirm(null);
    }
  };

  const requestStatusChange = (booking, status) => {
    if (status === 'rejected') {
      setStatusConfirm({
        id: booking.id,
        status,
        message: `Reject ${booking.student_name}'s booking for ${booking.lab_name}?`,
      });
      return;
    }
    handleStatus(booking.id, status);
  };

  const filteredRecent = useMemo(() => {
    return recent
      .filter((booking) => {
        const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
        const query = search.trim().toLowerCase();
        if (!query) return matchesStatus;
        return (
          booking.student_name.toLowerCase().includes(query)
          || booking.lab_name.toLowerCase().includes(query)
          || booking.student_email.toLowerCase().includes(query)
        ) && matchesStatus;
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.start_time}`);
        const dateB = new Date(`${b.date}T${b.start_time}`);
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      });
  }, [recent, search, statusFilter, sortDirection]);

  const topRecent = filteredRecent.slice(0, 8);
  const approvalRate = stats?.total ? `${Math.round((stats.approved / stats.total) * 100)}%` : '—';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <ConfirmDialog
        open={!!statusConfirm}
        title="Reject booking"
        message={statusConfirm?.message}
        confirmLabel="Reject"
        danger
        onConfirm={() => handleStatus(statusConfirm.id, statusConfirm.status)}
        onCancel={() => setStatusConfirm(null)}
      />
      <div className="mb-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-slate-500 mt-1">Overview of lab bookings, approvals, and system activity.</p>
          </div>
          <button
            type="button"
            onClick={loadDashboard}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-surface-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 disabled:opacity-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="card mb-6 rounded-2xl border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="col-span-2 md:col-span-1 lg:col-span-2">
          <StatCard
            icon={BookOpen}
            label="Total Bookings"
            value={stats?.total}
            color="bg-brand-600"
            sub={stats ? `${approvalRate} approval rate` : undefined}
          />
        </div>
        <StatCard icon={Clock} label="Pending" value={stats?.pending} color="bg-amber-500" sub="Needs review" />
        <StatCard icon={CheckCircle} label="Approved" value={stats?.approved} color="bg-green-500" />
        <StatCard icon={XCircle} label="Rejected" value={stats?.rejected} color="bg-red-500" />
        <StatCard icon={FlaskConical} label="Labs" value={stats?.labs} color="bg-violet-500" />
        <StatCard icon={Users} label="Students" value={stats?.students} color="bg-sky-500" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3 mb-8">
        <Link
          to="/admin/bookings"
          className="card flex flex-col rounded-3xl border border-surface-200 bg-white p-5 transition hover:border-brand-200 hover:shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-900">Manage Bookings</span>
            <BookOpen size={20} className="text-brand-600" />
          </div>
          <p className="text-sm text-slate-500">Review, approve, and reject pending booking requests.</p>
        </Link>

        <Link
          to="/admin/labs"
          className="card flex flex-col rounded-3xl border border-surface-200 bg-white p-5 transition hover:border-brand-200 hover:shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-900">Manage Labs</span>
            <FlaskConical size={20} className="text-violet-600" />
          </div>
          <p className="text-sm text-slate-500">Update lab availability, equipment, and room details.</p>
        </Link>

        <Link
          to="/admin/users"
          className="card flex flex-col rounded-3xl border border-surface-200 bg-white p-5 transition hover:border-brand-200 hover:shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-900">Manage Users</span>
            <Users size={20} className="text-sky-600" />
          </div>
          <p className="text-sm text-slate-500">View student accounts, roles, and recent activity.</p>
        </Link>
      </div>

      <div className="card p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between mb-5">
          <div>
            <h2 className="font-heading font-semibold text-slate-900">Recent Bookings</h2>
            <p className="text-sm text-slate-500">Search and sort the latest booking submissions.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-72">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search student, lab, or email"
                className="input w-full pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {['all', 'pending', 'approved', 'rejected'].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-xl px-3.5 py-2 text-sm font-medium transition ${
                    statusFilter === status
                      ? 'bg-brand-600 text-white'
                      : 'bg-surface-100 text-slate-600 hover:bg-surface-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setSortDirection((dir) => (dir === 'desc' ? 'asc' : 'desc'))}
              className="inline-flex items-center gap-2 rounded-xl border border-surface-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300"
            >
              <RefreshCw size={16} className={sortDirection === 'desc' ? 'rotate-0' : 'rotate-180 transition'} />
              {sortDirection === 'desc' ? 'Newest first' : 'Oldest first'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">{[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-surface-100 rounded-xl animate-pulse" />
          ))}</div>
        ) : topRecent.length === 0 ? (
          <div className="text-center py-10 text-slate-500">
            No recent bookings match this filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-100">
                  {['Student', 'Lab', 'Date & Time', 'Status', 'Actions'].map((heading) => (
                    <th
                      key={heading}
                      className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider pb-3 pr-4"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-50">
                {topRecent.map((booking) => (
                  <tr key={booking.id} className="hover:bg-surface-50 transition-colors">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-slate-900">{booking.student_name}</p>
                      <p className="text-xs text-slate-400">{booking.student_email}</p>
                    </td>
                    <td className="py-3 pr-4 text-slate-700">{booking.lab_name}</td>
                    <td className="py-3 pr-4">
                      <p className="text-slate-700">
                        {new Date(booking.date).toLocaleDateString('en-ZM', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                      <p className="text-xs text-slate-400">
                        {booking.start_time.slice(0, 5)} – {booking.end_time.slice(0, 5)}
                      </p>
                    </td>
                    <td className="py-3 pr-4"><StatusBadge status={booking.status} /></td>
                    <td className="py-3">
                      {booking.status === 'pending' ? (
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => requestStatusChange(booking, 'approved')}
                            className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-lg hover:bg-green-100 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => requestStatusChange(booking, 'rejected')}
                            className="text-xs bg-red-50 text-red-600 px-2.5 py-1 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">No action</span>
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
