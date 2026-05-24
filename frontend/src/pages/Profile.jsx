import { useState } from 'react';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/client';
import useAuthStore from '../store/authStore';

const Profile = () => {
  const { user, setUser } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [profileLoading, setProfileLoading] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirm: '',
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Name is required');
    setProfileLoading(true);
    try {
      const { data } = await api.put('/auth/profile', { name: name.trim() });
      setUser(data);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirm)
      return toast.error('New passwords do not match');
    if (passwordForm.newPassword.length < 6)
      return toast.error('Password must be at least 6 characters');

    setPasswordLoading(true);
    try {
      await api.put('/auth/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password changed');
      setPasswordForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-heading font-bold text-slate-900">Profile</h1>
        <p className="text-slate-500 mt-1">Manage your account details and password</p>
      </div>

      <div className="card p-6 mb-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
            <User size={18} className="text-brand-600" />
          </div>
          <div>
            <h2 className="font-heading font-semibold text-slate-900">Account details</h2>
            <p className="text-xs text-slate-400">{user?.email}</p>
          </div>
        </div>
        <form onSubmit={saveProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Full name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
            <input
              type="text"
              disabled
              value={user?.role || ''}
              className="input bg-surface-50 capitalize cursor-not-allowed"
            />
          </div>
          <button type="submit" disabled={profileLoading} className="btn-primary">
            {profileLoading ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
            <Lock size={18} className="text-slate-600" />
          </div>
          <h2 className="font-heading font-semibold text-slate-900">Change password</h2>
        </div>
        <form onSubmit={changePassword} className="space-y-4">
          {[
            { key: 'currentPassword', label: 'Current password' },
            { key: 'newPassword', label: 'New password' },
            { key: 'confirm', label: 'Confirm new password' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
              <div className="relative">
                <input
                  type={showPasswords ? 'text' : 'password'}
                  required
                  value={passwordForm[key]}
                  onChange={(e) => setPasswordForm({ ...passwordForm, [key]: e.target.value })}
                  className="input pr-10"
                />
                {key === 'currentPassword' && (
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                )}
              </div>
            </div>
          ))}
          <button type="submit" disabled={passwordLoading} className="btn-primary">
            {passwordLoading ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
