import { NavLink } from "react-router-dom";
import { LayoutDashboard, Calendar, Mail, FileCheck, LogOut, X } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import logoRancaekek from "../assets/logo-rancaekek.png";

const Sidebar = ({ isOpen, onClose, user, onLogout }) => {
  const menuItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/agenda", label: "Agenda Kegiatan", icon: Calendar },
    { path: "/surat-masuk", label: "Surat Masuk", icon: Mail },
    { path: "/disposisi", label: "Disposisi", icon: FileCheck },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Gagal sign out dari Firebase:", error);
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.clear();
    sessionStorage.clear();

    if (typeof onLogout === "function") {
      onLogout();
    }

    window.location.href = "/login";
  };

  const getInitials = (name) => {
    if (!name) return "LA";
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const displayName = user?.nama || user?.name || "Linda Agustina.A.Md";
  const displaySub = user?.jabatan || user?.role || "ARSIPARIS TERAMPIL";
  const avatarUrl = user?.avatar;

  return (
    <>
      {/* Overlay Gelap Mode Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Container Sidebar Utama dengan tinggi layar penuh yang aman */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#111827] text-slate-300 flex flex-col justify-between h-[100dvh] transition-transform duration-300 ease-in-out border-r border-slate-800/50 md:static md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Bagian Atas: Header Logo & Menu Navigasi (Bisa di-scroll jika menu banyak) */}
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
          {/* Header */}
          <div className="p-4 border-b border-slate-800/60 flex items-center justify-between shrink-0 bg-[#111827] sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl p-1.5 flex items-center justify-center shadow-md shrink-0">
                <img
                  src={logoRancaekek}
                  alt="Logo Rancaekek"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h2 className="text-sm font-bold tracking-wide text-white uppercase leading-tight">
                  Arsip Giat
                </h2>
                <p className="text-[10px] font-semibold text-emerald-400 tracking-wider uppercase mt-0.5">
                  Kecamatan Rancaekek
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>

          {/* Menu Navigasi */}
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                      isActive
                        ? "bg-[#00a86b] text-white font-semibold shadow-lg shadow-emerald-900/20"
                        : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                    }`
                  }
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bagian Bawah (Footer): Profil User & Tombol Logout (Terkunci rapi tidak akan terpotong) */}
        <div className="p-4 border-t border-slate-800/60 flex items-center justify-between shrink-0 bg-[#111827]">
          <div className="flex items-center gap-3 overflow-hidden">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-10 h-10 rounded-full object-cover shrink-0 shadow-md border border-slate-700"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-md uppercase">
                {getInitials(displayName)}
              </div>
            )}

            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate" title={displayName}>
                {displayName}
              </p>
              <p className="text-[10px] font-semibold text-emerald-400 tracking-wider uppercase truncate" title={displaySub}>
                {displaySub}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800/60 rounded-lg transition-colors shrink-0 ml-1 cursor-pointer"
            title="Keluar"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;