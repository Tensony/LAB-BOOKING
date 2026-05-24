import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FlaskConical, LayoutDashboard, CalendarDays, LogOut, Users, BookOpen } from 'lucide-react';
import useAuthStore from '../store/authStore';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/login'); };

  const isActive = (path) => location.pathname === path
    ? 'text-brand-600 bg-brand-50 font-medium'
    : 'text-slate-600 hover:text-brand-600 hover:bg-surface-100';

  const studentLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/labs', label: 'Labs', icon: FlaskConical },
    { to: '/my-bookings', label: 'My Bookings', icon: CalendarDays },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/bookings', label: 'Bookings', icon: BookOpen },
    { to: '/admin/labs', label: 'Labs', icon: FlaskConical },
    { to: '/admin/users', label: 'Users', icon: Users },
  ];

  const links = user?.role === 'admin' ? adminLinks : studentLinks;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-surface-200">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
            <FlaskConical size={16} className="text-white" />
          </div>
          <span className="font-heading font-700 text-lg text-slate-900">LabBook</span>
        </Link>

        {user && (
          <div className="hidden md:flex items-center gap-1">
            {links.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all duration-150 ${isActive(to)}`}>
                <Icon size={15} />
                {label}
              </Link>
            ))}
          </div>
        )}

        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-slate-900 leading-none">{user.name}</p>
              <p className="text-xs text-slate-400 capitalize mt-0.5">{user.role}</p>
            </div>
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-500 transition-colors px-3 py-2 rounded-xl hover:bg-red-50">
              <LogOut size={15} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
