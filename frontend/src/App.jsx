import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';
import Navbar from './components/Navbar';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Labs from './pages/Labs';
import LabDetail from './pages/LabDetail';
import MyBookings from './pages/MyBookings';
import AdminDashboard from './pages/AdminDashboard';
import AdminBookings from './pages/AdminBookings';
import AdminLabs from './pages/AdminLabs';
import AdminUsers from './pages/AdminUsers';
import Profile from './pages/Profile';

const Layout = ({ children }) => (
  <>
    <Navbar />
    <main>{children}</main>
  </>
);

function App() {
  const { init } = useAuthStore();
  useEffect(() => { init(); }, []);

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{
        style: { borderRadius: '12px', fontFamily: 'DM Sans, sans-serif', fontSize: '14px' },
        success: { iconTheme: { primary: '#16a34a', secondary: '#fff' } },
      }} />
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/labs" element={<ProtectedRoute><Layout><Labs /></Layout></ProtectedRoute>} />
        <Route path="/labs/:id" element={<ProtectedRoute><Layout><LabDetail /></Layout></ProtectedRoute>} />
        <Route path="/my-bookings" element={<ProtectedRoute><Layout><MyBookings /></Layout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
        <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly><Layout><AdminDashboard /></Layout></ProtectedRoute>} />
        <Route path="/admin/bookings" element={<ProtectedRoute adminOnly><Layout><AdminBookings /></Layout></ProtectedRoute>} />
        <Route path="/admin/labs" element={<ProtectedRoute adminOnly><Layout><AdminLabs /></Layout></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute adminOnly><Layout><AdminUsers /></Layout></ProtectedRoute>} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
