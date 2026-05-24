import { useEffect, useState } from 'react';
import { Users, Trash2, Search, ShieldCheck, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/client';
import useAuthStore from '../store/authStore';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { user: me } = useAuthStore();

  const fetchUsers = () => {
    api.get('/users').then(r => setUsers(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const deleteUser = async (id) => {
    if (!confirm('Delete this user and all their bookings?')) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('User deleted');
      fetchUsers();
    } catch {
      toast.error('Failed to delete user');
    }
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-slate-900">Users</h1>
          <p className="text-slate-500 mt-1">Manage registered students and admins</p>
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search users…" className="input pl-9 w-56" />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-16 bg-surface-100 rounded-2xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Users size={32} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No users found</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-50 border-b border-surface-200">
              <tr>
                {['User', 'Email', 'Role', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-50">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-surface-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold ${u.role === 'admin' ? 'bg-violet-500' : 'bg-brand-500'}`}>
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-slate-900">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">{u.email}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      u.role === 'admin' ? 'bg-violet-100 text-violet-700' : 'bg-brand-100 text-brand-700'
                    }`}>
                      {u.role === 'admin' ? <ShieldCheck size={10} /> : <GraduationCap size={10} />}
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-400 text-xs">
                    {new Date(u.created_at).toLocaleDateString('en-ZM', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-3.5">
                    {u.id !== me?.id && u.role !== 'admin' && (
                      <button onClick={() => deleteUser(u.id)}
                        className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
