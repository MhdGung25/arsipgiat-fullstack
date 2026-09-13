import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const DefaultLayout = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Ambil data user dengan aman dari localStorage
  let user = {};
  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      user = JSON.parse(storedUser);
    }
  } catch (e) {
    console.error("Gagal parse data user:", e);
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex h-[100dvh] w-screen bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 overflow-hidden">
      {/* Sidebar untuk Mobile & Desktop */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        onLogout={handleLogout}
      />

      {/* Area Utama */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(true)} user={user} />

        {/* Konten Utama dengan penanganan scroll aman untuk HP */}
        <main className="flex-1 overflow-y-auto bg-slate-100 dark:bg-slate-900 transition-colors duration-200">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DefaultLayout;