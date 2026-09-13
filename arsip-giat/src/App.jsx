import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';

import DefaultLayout from './layouts/DefaultLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Agenda from './pages/Agenda';
import SuratMasuk from './pages/SuratMasuk';
import Disposisi from './pages/Disposisi';
import Notifikasi from './components/Notifikasi';

// Helper memeriksa autentikasi secara aman
const isAuthenticated = () => {
  try {
    const user = localStorage.getItem('user');
    return user !== null && user !== undefined && user !== "undefined";
  } catch (e) {
    return false;
  }
};

// 1. Guard Rute Terproteksi
const ProtectedRoute = () => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

// 2. Guard Rute Publik
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
        </Route> {/* Perhatikan penutup tag */}

        {/* Rute Terproteksi */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DefaultLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/surat-masuk" element={<SuratMasuk />} />
            <Route path="/disposisi" element={<Disposisi />} />
            <Route path="/notifikasi" element={<Notifikasi />} />
          </Route>
        </Route>

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;