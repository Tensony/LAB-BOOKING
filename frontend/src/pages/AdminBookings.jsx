import { useEffect, useState } from 'react';
import { CalendarDays, Clock, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/client';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetch = () => {
    api.get('/bookings/admin/all').then(r => setBookings(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const handleStatus = async (id, status) => {
    try {
      await api.put(`/bookings/${id}/status`, { status });
      toast.success(`Booking ${status}`);
      fetch();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const filtered = bookings.filter(b => {
    const matchFilter = filter === 'all' || b.status === filter;
    const matchSearch = search === '' ||
      b.student_name.toLowerCase().includes(search.toLowerCase()) ||
      b.lab_name.toLowerCase().includes(search.toLowerCase()) ||
      b.student_email.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold text-slate-900">All Bookings</h1>
        <p className="text-slate-500 mt-1">Review and manage student booking requests</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by student or lab…" className="input pl-9" />
        </div>
        <div className="flex gap-2">
          {['all', 'pending', 'approved', 'rejected'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3.5 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                filter === f ? 'bg-brand-600 text-white' : 'bg-surface-100 text-slate-600 hover:bg-surface-200'
              }`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-20 bg-surface-100 rounded-2xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Filter size={32} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No bookings match your filters</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-50 border-b border-surface-200">
                <tr>
                  {['#', 'Student', 'Lab', 'Date & Time', 'Purpose', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-50">
                {filtered.map(b => (
                  <tr key={b.id} className="hover:bg-surface-50 transition-colors">
                    <td className="px-5 py-4 text-slate-400 font-mono text-xs">#{b.id}</td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-900">{b.student_name}</p>
                      <p className="text-xs text-slate-400">{b.student_email}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-700">{b.lab_name}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 text-slate-700">
                        <CalendarDays size={12} />
                        {new Date(b.date).toLocaleDateString('en-ZM', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                        <Clock size={11} /> {b.start_time.slice(0,5)} – {b.end_time.slice(0,5)}
                      </div>
                    </td>
                    <td className="px-5 py-4 max-w-[150px]">
                      <p className="text-xs text-slate-500 truncate">{b.purpose || '—'}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`badge-${b.status} capitalize`}>{b.status}</span>
                    </td>
                    <td className="px-5 py-4">
                      {b.status === 'pending' ? (
                        <div className="flex gap-1.5">
                          <button onClick={() => handleStatus(b.id, 'approved')}
                            className="text-xs bg-green-50 text-green-700 px-2.5 py-1.5 rounded-lg hover:bg-green-100 font-medium transition-colors">
                            Approve
                          </button>
                          <button onClick={() => handleStatus(b.id, 'rejected')}
                            className="text-xs bg-red-50 text-red-600 px-2.5 py-1.5 rounded-lg hover:bg-red-100 font-medium transition-colors">
                            Reject
                          </button>
                        </div>
                      ) : b.status === 'approved' ? (
                        <button onClick={() => handleStatus(b.id, 'rejected')}
                          className="text-xs bg-red-50 text-red-600 px-2.5 py-1.5 rounded-lg hover:bg-red-100 font-medium transition-colors">
                          Revoke
                        </button>
                      ) : (
                        <button onClick={() => handleStatus(b.id, 'approved')}
                          className="text-xs bg-green-50 text-green-700 px-2.5 py-1.5 rounded-lg hover:bg-green-100 font-medium transition-colors">
                          Re-approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;
