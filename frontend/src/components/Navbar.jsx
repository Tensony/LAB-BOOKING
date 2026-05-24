import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FlaskConical,
  LayoutDashboard,
  CalendarDays,
  LogOut,
  Users,
  BookOpen,
  Menu,
  X,
  UserCircle,
} from 'lucide-react';
import useAuthStore from '../store/authStore';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileOpen(false);
  };

  const isActive = (path) =>
    location.pathname === path
      ? 'text-brand-600 bg-brand-50 font-medium'
      : 'text-slate-600 hover:text-brand-600 hover:bg-surface-100';

  const studentLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/labs', label: 'Labs', icon: FlaskConical },
    { to: '/my-bookings', label: 'My Bookings', icon: CalendarDays },
    { to: '/profile', label: 'Profile', icon: UserCircle },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/bookings', label: 'Bookings', icon: BookOpen },
    { to: '/admin/labs', label: 'Labs', icon: FlaskConical },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/profile', label: 'Profile', icon: UserCircle },
  ];

  const links = user?.role === 'admin' ? adminLinks : studentLinks;
  const homeTo = user?.role === 'admin' ? '/admin/dashboard' : '/dashboard';

  const NavLink = ({ to, label, icon: Icon, mobile = false }) => (
    <Link
      to={to}
      onClick={() => mobile && setMobileOpen(false)}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all duration-150 ${isActive(to)} ${
        mobile ? 'w-full' : ''
      }`}
    >
      <Icon size={15} />
      {label}
    </Link>
  );

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-surface-200">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to={homeTo} className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
            <FlaskConical size={16} className="text-white" />
          </div>
          <span className="font-heading font-700 text-lg text-slate-900">LabBook</span>
        </Link>

        {user && (
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <NavLink key={link.to} {...link} />
            ))}
          </div>
        )}

        {user && (
          <div className="flex items-center gap-2">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-slate-900 leading-none">{user.name}</p>
              <p className="text-xs text-slate-400 capitalize mt-0.5">{user.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-500 transition-colors px-3 py-2 rounded-xl hover:bg-red-50"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">Logout</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-surface-100"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        )}
      </div>

      {user && mobileOpen && (
        <div className="md:hidden border-t border-surface-200 bg-white px-4 py-4 space-y-1">
          {links.map((link) => (
            <NavLink key={link.to} {...link} mobile />
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-red-600 hover:bg-red-50 mt-2"
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
