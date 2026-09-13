import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

const DefaultLayout = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const auth = useAuth ? useAuth() : null;
  const user = auth?.user || JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    if (auth?.logout) {
      auth.logout();
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 overflow-hidden transition-colors duration-200">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        onLogout={handleLogout}
      />

      {/* Area Utama */}
      <div className="flex-1 flex flex-col min-w-0 w-full h-full overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(true)} user={user} />

        {/* Konten Utama (Berubah warna bg sesuai mode) */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto bg-slate-100 dark:bg-slate-900 transition-colors duration-200">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DefaultLayout;