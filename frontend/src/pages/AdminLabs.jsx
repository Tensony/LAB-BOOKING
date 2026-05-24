import { useEffect, useState } from 'react';
import { FlaskConical, Plus, Trash2, Edit2, X, MapPin, Users, CalendarPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/client';
import ConfirmDialog from '../components/ConfirmDialog';

const emptyLab = { name: '', location: '', capacity: '', description: '', image_url: '' };
const emptySlot = { date: '', start_time: '', end_time: '', max_bookings: 1 };

const AdminLabs = () => {
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [labModal, setLabModal] = useState(false);
  const [slotModal, setSlotModal] = useState(null); // holds lab id
  const [editLab, setEditLab] = useState(null);
  const [labForm, setLabForm] = useState(emptyLab);
  const [slotForm, setSlotForm] = useState(emptySlot);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchLabs = () => {
    api.get('/labs').then(r => setLabs(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchLabs(); }, []);

  const openAdd = () => { setEditLab(null); setLabForm(emptyLab); setLabModal(true); };
  const openEdit = (lab) => { setEditLab(lab); setLabForm({ name: lab.name, location: lab.location || '', capacity: lab.capacity, description: lab.description || '', image_url: lab.image_url || '' }); setLabModal(true); };

  const saveLab = async () => {
    if (!labForm.name || !labForm.capacity) return toast.error('Name and capacity are required');
    setSaving(true);
    try {
      if (editLab) {
        await api.put(`/labs/${editLab.id}`, labForm);
        toast.success('Lab updated');
      } else {
        await api.post('/labs', labForm);
        toast.success('Lab created');
      }
      setLabModal(false);
      fetchLabs();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save lab');
    } finally {
      setSaving(false);
    }
  };

  const deleteLab = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/labs/${deleteTarget.id}`);
      toast.success('Lab deleted');
      fetchLabs();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete lab');
    } finally {
      setDeleteTarget(null);
    }
  };

  const addSlot = async () => {
    if (!slotForm.date || !slotForm.start_time || !slotForm.end_time) return toast.error('All slot fields required');
    setSaving(true);
    try {
      await api.post(`/labs/${slotModal}/slots`, slotForm);
      toast.success('Slot added');
      setSlotForm(emptySlot);
      setSlotModal(null);
      fetchLabs();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add slot');
    } finally {
      setSaving(false);
    }
  };

  const Modal = ({ title, onClose, onSave, children }) => (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-surface-100">
          <h3 className="font-heading font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">{children}</div>
        <div className="flex gap-3 p-5 border-t border-surface-100">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={onSave} disabled={saving} className="btn-primary flex-1">
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete lab"
        message={`Delete "${deleteTarget?.name}" and all its slots? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={deleteLab}
        onCancel={() => setDeleteTarget(null)}
      />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-slate-900">Labs Management</h1>
          <p className="text-slate-500 mt-1">Create and manage lab spaces and booking slots</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Lab
        </button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-40 bg-surface-100 rounded-2xl animate-pulse" />)}</div>
      ) : labs.length === 0 ? (
        <div className="card p-12 text-center">
          <FlaskConical size={36} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 mb-4">No labs yet. Add your first lab.</p>
          <button onClick={openAdd} className="btn-primary inline-flex items-center gap-2"><Plus size={15} />Add Lab</button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {labs.map(lab => (
            <div key={lab.id} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FlaskConical size={18} className="text-brand-600" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-slate-900">{lab.name}</h3>
                    {lab.location && (
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin size={10} /> {lab.location}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(lab)} className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => setDeleteTarget(lab)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              {lab.description && <p className="text-xs text-slate-500 mb-3 line-clamp-2">{lab.description}</p>}
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-xs text-slate-500 bg-surface-100 px-2.5 py-1 rounded-full">
                  <Users size={11} /> Capacity: {lab.capacity}
                </span>
                <button onClick={() => { setSlotModal(lab.id); setSlotForm(emptySlot); }}
                  className="text-xs text-brand-600 flex items-center gap-1 hover:underline">
                  <CalendarPlus size={12} /> Add Slot
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {labModal && (
        <Modal title={editLab ? 'Edit Lab' : 'Add New Lab'} onClose={() => setLabModal(false)} onSave={saveLab}>
          {[
            { key: 'name', label: 'Lab Name *', type: 'text', placeholder: 'e.g. Computer Lab A' },
            { key: 'location', label: 'Location', type: 'text', placeholder: 'e.g. Block C, Room 104' },
            { key: 'capacity', label: 'Capacity *', type: 'number', placeholder: '30' },
            { key: 'image_url', label: 'Image URL', type: 'url', placeholder: 'https://…' },
          ].map(({ key, label, type, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
              <input type={type} value={labForm[key]} onChange={e => setLabForm({ ...labForm, [key]: e.target.value })}
                className="input" placeholder={placeholder} />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea rows={3} value={labForm.description} onChange={e => setLabForm({ ...labForm, description: e.target.value })}
              className="input resize-none" placeholder="Brief description of the lab…" />
          </div>
        </Modal>
      )}

      {slotModal && (
        <Modal title="Add Booking Slot" onClose={() => setSlotModal(null)} onSave={addSlot}>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Date *</label>
            <input type="date" min={new Date().toISOString().split('T')[0]} value={slotForm.date}
              onChange={e => setSlotForm({ ...slotForm, date: e.target.value })} className="input" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Start Time *</label>
              <input type="time" value={slotForm.start_time}
                onChange={e => setSlotForm({ ...slotForm, start_time: e.target.value })} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">End Time *</label>
              <input type="time" value={slotForm.end_time}
                onChange={e => setSlotForm({ ...slotForm, end_time: e.target.value })} className="input" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Max Bookings per Slot</label>
            <input type="number" min={1} max={50} value={slotForm.max_bookings}
              onChange={e => setSlotForm({ ...slotForm, max_bookings: parseInt(e.target.value) })} className="input" />
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminLabs;
