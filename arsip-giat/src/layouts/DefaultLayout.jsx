import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const DefaultLayout = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    // Simpan dulu status tema saat ini sebelum clear storage
    const currentTheme = localStorage.getItem("theme");

    // Bersihkan sesi dan token autentikasi saja
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // JANGAN gunakan localStorage.clear() agar pengaturan tema tidak ikut terhapus!
    sessionStorage.clear();

    // Kembalikan status tema ke localStorage jika sebelumnya diset
    if (currentTheme) {
      localStorage.setItem("theme", currentTheme);
    }

    navigate("/login", { replace: true });
  };

  return (
    /* PERBAIKAN UTAMA: 
       1. Ubah min-h-screen menjadi h-screen (atau h-[100dvh]) agar tinggi terkunci selebar layar.
       2. Tambahkan overflow-hidden agar halaman utama tidak ikut scroll gelondongan. */
    <div className="flex h-screen w-full bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 overflow-hidden">
      
      {/* Sidebar untuk Mobile & Desktop */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        onLogout={handleLogout}
      />

      {/* Area Utama */}
      {/* PERBAIKAN KEDUA: Berikan h-full dan overflow-y-auto di sini agar hanya area kanan ini yang bisa di-scroll ke bawah */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
        <Navbar onMenuClick={() => setSidebarOpen(true)} user={user} />

        {/* Konten Utama */}
        <main className="flex-1 bg-slate-100 dark:bg-slate-900 transition-colors duration-200">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DefaultLayout;