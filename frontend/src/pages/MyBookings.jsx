import { useEffect, useState, useRef } from 'react';
import { CalendarDays, Clock, MapPin, CheckCircle, XCircle, Trash2, Upload, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/client';

const StatusBadge = ({ status }) => ({
  approved: <span className="badge-approved"><CheckCircle size={11} className="mr-1" />Approved</span>,
  pending: <span className="badge-pending"><Clock size={11} className="mr-1" />Pending</span>,
  rejected: <span className="badge-rejected"><XCircle size={11} className="mr-1" />Rejected</span>,
}[status]);

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const fileInputs = useRef({});

  const fetchBookings = () => {
    api.get('/bookings/my').then(r => setBookings(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async (id) => {
    if (!confirm('Cancel this booking?')) return;
    try {
      await api.delete(`/bookings/${id}`);
      toast.success('Booking cancelled');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to cancel');
    }
  };

  const handleUpload = async (id, file) => {
    const form = new FormData();
    form.append('file', file);
    try {
      await api.post(`/bookings/${id}/upload`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('File uploaded successfully');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed');
    }
  };

  const filters = ['all', 'pending', 'approved', 'rejected'];
  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold text-slate-900">My Bookings</h1>
        <p className="text-slate-500 mt-1">Track and manage your lab sessions</p>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-xl text-sm font-medium capitalize transition-all ${
              filter === f ? 'bg-brand-600 text-white' : 'bg-surface-100 text-slate-600 hover:bg-surface-200'
            }`}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 bg-surface-100 rounded-2xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <CalendarDays size={36} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No {filter !== 'all' ? filter : ''} bookings found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(b => (
            <div key={b.id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="font-heading font-semibold text-slate-900 truncate">{b.lab_name}</h3>
                    <StatusBadge status={b.status} />
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <CalendarDays size={11} />
                      {new Date(b.date).toLocaleDateString('en-ZM', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} /> {b.start_time.slice(0,5)} – {b.end_time.slice(0,5)}
                    </span>
                    {b.location && (
                      <span className="flex items-center gap-1">
                        <MapPin size={11} /> {b.location}
                      </span>
                    )}
                  </div>
                  {b.purpose && <p className="text-xs text-slate-400 mt-2 italic">"{b.purpose}"</p>}
                  {b.file_path && (
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-brand-600">
                      <FileText size={11} /> {b.file_path}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {b.status === 'approved' && !b.file_path && (
                    <>
                      <input type="file" ref={el => fileInputs.current[b.id] = el} className="hidden"
                        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                        onChange={e => e.target.files[0] && handleUpload(b.id, e.target.files[0])} />
                      <button onClick={() => fileInputs.current[b.id]?.click()}
                        className="btn-secondary text-xs flex items-center gap-1.5 py-1.5 px-3">
                        <Upload size={12} /> Upload Report
                      </button>
                    </>
                  )}
                  {b.status === 'pending' && (
                    <button onClick={() => handleCancel(b.id)}
                      className="btn-danger text-xs flex items-center gap-1.5 py-1.5 px-3">
                      <Trash2 size={12} /> Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
