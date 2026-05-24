import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FlaskConical, MapPin, Users, ArrowRight, Search } from 'lucide-react';
import api from '../api/client';

const Labs = () => {
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/labs').then(r => setLabs(r.data)).finally(() => setLoading(false));
  }, []);

  const filtered = labs.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.location?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-heading font-bold text-slate-900">Available Labs</h1>
          <p className="text-slate-500 mt-1">Browse and book lab sessions</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search labs..." className="input pl-9 text-sm" />
        </div>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-52 bg-surface-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <FlaskConical size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No labs found</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(lab => (
            <Link key={lab.id} to={`/labs/${lab.id}`}
              className="card p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
              <div className="w-11 h-11 bg-brand-50 border border-brand-100 rounded-xl flex items-center justify-center mb-4">
                <FlaskConical size={20} className="text-brand-600" />
              </div>
              <h3 className="font-heading font-semibold text-slate-900 text-lg mb-1">{lab.name}</h3>
              {lab.location && (
                <p className="text-sm text-slate-500 flex items-center gap-1.5 mb-2">
                  <MapPin size={12} /> {lab.location}
                </p>
              )}
              <p className="text-sm text-slate-500 flex items-center gap-1.5 mb-3">
                <Users size={12} /> Capacity: {lab.capacity}
              </p>
              {lab.description && (
                <p className="text-sm text-slate-500 line-clamp-2 mb-4">{lab.description}</p>
              )}
              <div className="flex items-center text-brand-600 text-sm font-medium gap-1 group-hover:gap-2 transition-all mt-auto">
                View slots <ArrowRight size={13} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Labs;
