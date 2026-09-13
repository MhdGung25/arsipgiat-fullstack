import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import axios from 'axios';

import DefaultLayout from './layouts/DefaultLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Agenda from './pages/Agenda';
import SuratMasuk from './pages/SuratMasuk';
import Disposisi from './pages/Disposisi';
import Notifikasi from './components/Notifikasi';

// 1. Konfigurasi Interceptor Axios Global
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Helper mengecek status autentikasi
const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

// 2. Guard Rute Terautentikasi (Hanya untuk pengguna yang sudah login)
const ProtectedRoute = () => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

// 3. Guard Rute Publik (Mencegah pengguna yang sudah login ke halaman /login)
const PublicRoute = () => {
  if (isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Rute Publik */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Rute Terproteksi (Admin) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DefaultLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="agenda" element={<Agenda />} />
            <Route path="surat-masuk" element={<SuratMasuk />} />
            <Route path="disposisi" element={<Disposisi />} />
            <Route path="notifikasi" element={<Notifikasi />} />
          </Route>
        </Route>

        {/* Fallback Route jika URL tidak ditemukan */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;