import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FlaskConical, MapPin, Users, Clock, CalendarDays, ChevronLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/client';

const LabDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lab, setLab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [purpose, setPurpose] = useState('');
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    api.get(`/labs/${id}`).then(r => setLab(r.data)).catch(() => navigate('/labs')).finally(() => setLoading(false));
  }, [id]);

  const handleBook = async () => {
    if (!selectedSlot) return toast.error('Please select a slot');
    setBooking(true);
    try {
      await api.post('/bookings', { slot_id: selectedSlot.id, purpose });
      toast.success('Booking submitted! Awaiting admin approval.');
      navigate('/my-bookings');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  const groupByDate = (slots) => {
    return slots.reduce((acc, slot) => {
      const date = slot.date.split('T')[0];
      if (!acc[date]) acc[date] = [];
      acc[date].push(slot);
      return acc;
    }, {});
  };

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
      <div className="h-8 bg-surface-100 rounded-xl w-48 animate-pulse" />
      <div className="h-40 bg-surface-100 rounded-2xl animate-pulse" />
    </div>
  );

  if (!lab) return null;

  const grouped = groupByDate(lab.slots || []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button onClick={() => navigate('/labs')}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors">
        <ChevronLeft size={16} /> Back to labs
      </button>

      <div className="card p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <FlaskConical size={24} className="text-brand-600" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-heading font-bold text-slate-900">{lab.name}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-2">
              {lab.location && (
                <span className="flex items-center gap-1 text-sm text-slate-500">
                  <MapPin size={13} /> {lab.location}
                </span>
              )}
              <span className="flex items-center gap-1 text-sm text-slate-500">
                <Users size={13} /> Capacity: {lab.capacity}
              </span>
            </div>
            {lab.description && <p className="text-slate-500 text-sm mt-3">{lab.description}</p>}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <h2 className="font-heading font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <CalendarDays size={18} className="text-brand-600" /> Available Slots
          </h2>
          {Object.keys(grouped).length === 0 ? (
            <div className="card p-10 text-center">
              <CalendarDays size={32} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No available slots for this lab.</p>
              <p className="text-slate-400 text-xs mt-1">Check back later or contact admin.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {Object.entries(grouped).map(([date, slots]) => (
                <div key={date}>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                    {new Date(date + 'T00:00:00').toLocaleDateString('en-ZM', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {slots.map(slot => {
                      const full = parseInt(slot.booked_count) >= slot.max_bookings;
                      const selected = selectedSlot?.id === slot.id;
                      return (
                        <button key={slot.id} disabled={full}
                          onClick={() => setSelectedSlot(selected ? null : slot)}
                          className={`p-3.5 rounded-xl border text-left transition-all duration-150 ${
                            full ? 'opacity-50 cursor-not-allowed bg-surface-50 border-surface-200' :
                            selected ? 'bg-brand-600 border-brand-600 text-white shadow-lg shadow-brand-500/20' :
                            'bg-white border-surface-200 hover:border-brand-300 hover:bg-brand-50'
                          }`}>
                          <div className={`flex items-center gap-1.5 text-sm font-medium ${selected ? 'text-white' : 'text-slate-900'}`}>
                            <Clock size={13} />
                            {slot.start_time.slice(0,5)} – {slot.end_time.slice(0,5)}
                          </div>
                          <p className={`text-xs mt-0.5 ${selected ? 'text-brand-100' : full ? 'text-red-400' : 'text-slate-400'}`}>
                            {full ? 'Fully booked' : `${slot.max_bookings - slot.booked_count} spot(s) left`}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5 h-fit sticky top-24">
          <h3 className="font-heading font-semibold text-slate-900 mb-4">Booking Summary</h3>
          {selectedSlot ? (
            <div className="space-y-3 mb-4">
              <div className="bg-brand-50 rounded-xl p-3 border border-brand-100">
                <p className="text-xs text-brand-600 font-medium mb-1">{lab.name}</p>
                <p className="text-sm font-medium text-slate-900">
                  {new Date(selectedSlot.date + 'T00:00:00').toLocaleDateString('en-ZM', { day: 'numeric', month: 'short' })}
                </p>
                <p className="text-sm text-slate-600">
                  {selectedSlot.start_time.slice(0,5)} – {selectedSlot.end_time.slice(0,5)}
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Purpose (optional)</label>
                <textarea value={purpose} onChange={e => setPurpose(e.target.value)}
                  rows={3} placeholder="e.g. Research project, assignment work…"
                  className="input resize-none text-sm" />
              </div>
              <button onClick={handleBook} disabled={booking}
                className="btn-primary w-full flex items-center justify-center gap-2">
                <CheckCircle size={15} />
                {booking ? 'Submitting…' : 'Submit Booking'}
              </button>
            </div>
          ) : (
            <div className="text-center py-6">
              <CalendarDays size={28} className="text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-400">Select a slot to book</p>
            </div>
          )}
          <p className="text-xs text-slate-400 text-center">Bookings require admin approval</p>
        </div>
      </div>
    </div>
  );
};

export default LabDetail;
