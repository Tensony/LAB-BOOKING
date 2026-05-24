import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FlaskConical } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created! Welcome aboard.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-surface-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-500/30">
            <FlaskConical size={26} className="text-white" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-slate-900">Create account</h1>
          <p className="text-slate-500 mt-1.5">Join LabBook to book lab sessions</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {[
              { key: 'name', label: 'Full name', type: 'text', placeholder: 'Tenson Mulenga' },
              { key: 'email', label: 'Email address', type: 'email', placeholder: 'you@zut.ac.zm' },
              { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
              { key: 'confirm', label: 'Confirm password', type: 'password', placeholder: '••••••••' },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
                <input type={type} required value={form[key]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  className="input" placeholder={placeholder} />
              </div>
            ))}
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-sm">
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
