import React, { useState, useEffect } from 'react';
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Calendar, Mail, FileCheck, LogOut, X } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import logoRancaekek from "../assets/logo-rancaekek.png";

const Sidebar = ({ isOpen, onClose, user, onLogout }) => {
  // Sinkronisasi mode gelap/terang berbasis kelas 'dark' di elemen root (html) dan localStorage
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("theme") === "dark" || document.documentElement.classList.contains("dark");
  });

  // Memantau perubahan kelas 'dark' secara real-time ketika tombol toggle di Navbar ditekan
  useEffect(() => {
    const checkTheme = () => {
      const isDarkModeActive = document.documentElement.classList.contains("dark") || localStorage.getItem("theme") === "dark";
      setIsDark(isDarkModeActive);
    };

    // Jalankan pengecekan berkala untuk mendeteksi perubahan state dari Navbar
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    window.addEventListener("storage", checkTheme);

    return () => {
      observer.disconnect();
      window.removeEventListener("storage", checkTheme);
    };
  }, []);

  const menuItems = [
    { path: "/", label: "Dasbor", icon: LayoutDashboard },
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
          className="fixed inset-0 bg-black/65 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Container Sidebar Utama - Diubah ke md:sticky dan md:top-0 agar tetap diam di kiri */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 h-[100dvh] flex flex-col p-4 shadow-xl sm:shadow-none transition-transform duration-300 ease-in-out md:sticky md:top-0 md:translate-x-0 ${
          isDark 
            ? 'bg-[#0b0f19] text-slate-200 border-r border-slate-800/80' 
            : 'bg-white text-slate-700 border-r border-slate-200/80'
        } ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Tombol Ikon Tutup (✕) Khusus Tampilan HP */}
        <button
          onClick={onClose}
          className={`md:hidden absolute top-4 right-4 p-2 rounded-xl text-sm font-bold transition-colors cursor-pointer ${
            isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
          aria-label="Close menu"
        >
          <X size={18} />
        </button>

        {/* Header Logo */}
        <div className={`flex items-center gap-3 px-2 py-3 mb-4 sm:mb-6 overflow-hidden mt-2 sm:mt-0 border-b pb-4 ${
          isDark ? 'border-slate-800/80' : 'border-slate-100'
        }`}>
          <div className="w-10 h-10 bg-white rounded-xl p-1.5 flex items-center justify-center shadow-md shrink-0">
            <img
              src={logoRancaekek}
              alt="Logo Rancaekek"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="truncate pr-8 sm:pr-0">
            <h2 className={`font-bold text-sm tracking-tight uppercase leading-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
              Arsip Giat
            </h2>
            <p className={`text-[10px] font-semibold tracking-wider uppercase mt-0.5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
              Kecamatan Rancaekek
            </p>
          </div>
        </div>

        {/* Menu Navigasi - Scrollable Area */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto mb-2 no-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-3.5 py-3 text-xs sm:text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-[#00a86b] text-white font-semibold shadow-lg shadow-emerald-900/20"
                      : isDark 
                        ? "text-slate-400 hover:bg-slate-800/60 hover:text-white" 
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`
                }
              >
                <Icon size={20} />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Profile & Logout Section - Fixed at Bottom */}
        <div className={`mt-auto pt-4 pb-4 sm:pb-0 border-t ${isDark ? 'border-slate-800/80' : 'border-slate-100'}`}>
          
          {/* Kartu Profil & Tombol Logout dalam Satu Baris yang Rapi */}
          <div className={`p-3 rounded-2xl flex items-center gap-3 shadow-inner ${
            isDark ? 'bg-slate-900/80 border border-slate-800/80' : 'bg-slate-50 border border-slate-100'
          }`}>
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-9 h-9 rounded-full object-cover shrink-0 shadow-md border border-slate-700"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-md uppercase">
                {getInitials(displayName)}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-slate-800'}`} title={displayName}>
                {displayName}
              </p>
              <p className="text-[9px] font-semibold text-emerald-400 tracking-wider uppercase truncate mt-0.5" title={displaySub}>
                {displaySub}
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className={`p-2 rounded-xl transition-colors shrink-0 cursor-pointer ${
                isDark ? 'text-slate-400 hover:text-red-400 hover:bg-slate-800' : 'text-slate-500 hover:text-red-600 hover:bg-slate-200/80'
              }`}
              title="Keluar"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Tambahan CSS global untuk menyembunyikan scrollbar */}
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </>
  );
};

export default Sidebar;