import { useEffect, useMemo, useState } from 'react';
import { BookOpen, CalendarDays, Clock, Search, Filter, RefreshCw, CheckCircle, XCircle, Download, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/client';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import { downloadCsv } from '../utils/exportCsv';
import { uploadsUrl } from '../utils/uploads';
import usePageTitle from '../hooks/usePageTitle';
import Pagination from '../components/Pagination';

const PAGE_SIZE = 10;

const StatCard = ({ icon: Icon, iconClass, label, value, note, color }) => (
  <div className="card rounded-3xl border-surface-200 p-5 shadow-sm">
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-3 text-3xl font-heading font-bold text-slate-900">{value ?? '—'}</p>
      </div>
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${color}`}>
        <Icon size={20} className={iconClass} />
      </div>
    </div>
    {note && <p className="text-xs text-slate-400 mt-4">{note}</p>}
  </div>
);

const AdminBookings = () => {
  usePageTitle('All Bookings');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortDirection, setSortDirection] = useState('desc');
  const [error, setError] = useState(null);
  const [statusConfirm, setStatusConfirm] = useState(null);
  const [page, setPage] = useState(1);

  const loadBookings = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/bookings/admin/all');
      setBookings(response.data);
    } catch (err) {
      console.error(err);
      setError('Unable to load bookings. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, sortDirection]);

  const handleStatus = async (id, status) => {
    setLoading(true);
    setError(null);

    try {
      await api.put(`/bookings/${id}/status`, { status });
      toast.success(`Booking ${status}`);
      await loadBookings();
    } catch (err) {
      console.error(err);
      toast.error('Unable to update booking status.');
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

  const exportBookings = () => {
    const headers = ['ID', 'Student', 'Email', 'Lab', 'Date', 'Start', 'End', 'Status', 'Purpose', 'Report'];
    const rows = [
      headers,
      ...filteredBookings.map((b) => [
        b.id,
        b.student_name,
        b.student_email,
        b.lab_name,
        new Date(b.date).toISOString().split('T')[0],
        b.start_time?.slice(0, 5),
        b.end_time?.slice(0, 5),
        b.status,
        b.purpose || '',
        b.file_path || '',
      ]),
    ];
    downloadCsv(`labbookings-${new Date().toISOString().split('T')[0]}.csv`, rows);
    toast.success('Export downloaded');
  };

  const stats = useMemo(() => {
    const approved = bookings.filter((b) => b.status === 'approved').length;
    const pending = bookings.filter((b) => b.status === 'pending').length;
    const rejected = bookings.filter((b) => b.status === 'rejected').length;
    return {
      total: bookings.length,
      approved,
      pending,
      rejected,
      approvalRate: bookings.length ? `${Math.round((approved / bookings.length) * 100)}%` : '—',
    };
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    const query = search.trim().toLowerCase();

    return bookings
      .filter((booking) => {
        const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
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
  }, [bookings, search, statusFilter, sortDirection]);

  const visibleCount = filteredBookings.length;
  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / PAGE_SIZE));
  const paginatedBookings = filteredBookings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-slate-900">All Bookings</h1>
          <p className="text-slate-500 mt-1">Review student booking requests and manage approvals.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={exportBookings}
            disabled={!filteredBookings.length}
            className="inline-flex items-center gap-2 rounded-xl border border-surface-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 disabled:opacity-50"
          >
            <Download size={16} />
            Export CSV
          </button>
          <button
            type="button"
            onClick={loadBookings}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-surface-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <StatCard
          icon={BookOpen}
          iconClass="text-brand-600"
          label="Total Bookings"
          value={stats.total}
          note={`${visibleCount} matching`}
          color="bg-brand-100"
        />
        <StatCard
          icon={Clock}
          iconClass="text-amber-700"
          label="Pending"
          value={stats.pending}
          note="Requires review"
          color="bg-amber-100"
        />
        <StatCard
          icon={CheckCircle}
          iconClass="text-green-700"
          label="Approved"
          value={stats.approved}
          note="Ready for sessions"
          color="bg-green-100"
        />
        <StatCard
          icon={XCircle}
          iconClass="text-red-700"
          label="Rejected"
          value={stats.rejected}
          note="Declined requests"
          color="bg-red-100"
        />
      </div>

      {error && (
        <div className="card mb-6 rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="card rounded-3xl border-surface-200 p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="font-heading text-xl font-semibold text-slate-900">Booking requests</h2>
            <p className="text-sm text-slate-500">Search, filter, and process booking requests quickly.</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative min-w-[220px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by student, lab, or email"
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
              <RefreshCw size={16} className={sortDirection === 'desc' ? 'rotate-0' : 'rotate-180 transition-transform'} />
              {sortDirection === 'desc' ? 'Newest first' : 'Oldest first'}
            </button>
          </div>
        </div>

        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Showing <span className="font-semibold text-slate-900">{visibleCount}</span> of <span className="font-semibold text-slate-900">{bookings.length}</span> bookings
          </p>
          <div className="inline-flex items-center gap-2 rounded-full border border-surface-200 bg-surface-100 px-3 py-2 text-xs text-slate-500">
            <Filter size={14} />
            {statusFilter === 'all' ? 'All statuses' : `Filtered by ${statusFilter}`}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((index) => (
              <div key={index} className="h-20 rounded-3xl bg-surface-100 animate-pulse" />
            ))}
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
            <p className="text-base font-medium text-slate-700">No bookings match the current filters.</p>
            <p className="mt-2 text-sm">Try a different search term or status filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-50 border-b border-surface-200">
                <tr>
                  {['#', 'Student', 'Lab', 'Date & Time', 'Purpose', 'Report', 'Status', 'Actions'].map((heading) => (
                    <th
                      key={heading}
                      className="text-left text-xs font-medium uppercase tracking-wider text-slate-400 px-5 py-3.5"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-50">
                {paginatedBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-surface-50 transition-colors">
                    <td className="px-5 py-4 text-slate-400 font-mono text-xs">#{booking.id}</td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-900">{booking.student_name}</p>
                      <p className="text-xs text-slate-400">{booking.student_email}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-700">{booking.lab_name}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-slate-700">
                        <CalendarDays size={12} />
                        <span>{new Date(booking.date).toLocaleDateString('en-ZM', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                        <Clock size={11} />
                        <span>{booking.start_time.slice(0, 5)} – {booking.end_time.slice(0, 5)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 max-w-[200px]">
                      <p className="text-xs text-slate-500 truncate">{booking.purpose || 'No purpose provided'}</p>
                    </td>
                    <td className="px-5 py-4">
                      {booking.file_path ? (
                        <a
                          href={uploadsUrl(booking.file_path)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-brand-600 hover:underline"
                        >
                          View <ExternalLink size={10} />
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4"><StatusBadge status={booking.status} /></td>
                    <td className="px-5 py-4">
                      {booking.status === 'pending' ? (
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => requestStatusChange(booking, 'approved')}
                            className="rounded-xl bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 transition hover:bg-green-100"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => requestStatusChange(booking, 'rejected')}
                            className="rounded-xl bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                          >
                            Reject
                          </button>
                        </div>
                      ) : booking.status === 'approved' ? (
                        <button
                          type="button"
                          onClick={() => requestStatusChange(booking, 'rejected')}
                          className="rounded-xl bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                        >
                          Revoke
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => requestStatusChange(booking, 'approved')}
                          className="rounded-xl bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 transition hover:bg-green-100"
                        >
                          Re-approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              totalItems={filteredBookings.length}
              pageSize={PAGE_SIZE}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBookings;
