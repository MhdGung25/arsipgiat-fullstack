import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Menu, Moon, Sun, Bell, Info } from "lucide-react";
import { 
  collection, 
  getDocs, 
  updateDoc, 
  doc, 
  query, 
  orderBy, 
  onSnapshot 
} from "firebase/firestore";
import { db } from "../firebase";

const Navbar = ({ onMenuClick, user }) => {
  const location = useLocation();

  // State Notifikasi & Dropdown
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // 1. Inisialisasi Mode Gelap dari localStorage
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  // 2. Efek Sinkronisasi Mode Gelap ke Tag <html>
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // 3. Fetch Data Notifikasi Real-time dari Firebase Firestore
  useEffect(() => {
    const q = query(collection(db, "notifikasi"), orderBy("created_at", "desc"));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const dataNotif = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotifications(dataNotif);
      
      // Hitung jumlah yang belum dibaca
      const unread = dataNotif.filter((item) => !item.is_read && !item.read_at).length;
      setUnreadCount(unread);
    }, (error) => {
      console.error("Gagal mengambil data notifikasi dari Firebase:", error);
    });

    return () => unsubscribe();
  }, []);

  // Tutup dropdown jika klik di luar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  // Fungsi menandai semua / satu notifikasi telah dibaca di Firebase
  const handleMarkAsRead = async (id = null) => {
    try {
      if (id) {
        const notifRef = doc(db, "notifikasi", id);
        await updateDoc(notifRef, {
          is_read: true,
          read_at: new Date().toISOString()
        });
      } else {
        const querySnapshot = await getDocs(collection(db, "notifikasi"));
        const updatePromises = querySnapshot.docs.map(async (document) => {
          const notifRef = doc(db, "notifikasi", document.id);
          return updateDoc(notifRef, {
            is_read: true,
            read_at: new Date().toISOString()
          });
        });
        await Promise.all(updatePromises);
      }
    } catch (error) {
      console.error("Gagal memperbarui status notifikasi di Firebase:", error);
    }
  };

  // Judul Halaman Dinamis
  const getPageTitle = (path) => {
    switch (path) {
      case "/":
        return "Dasbor";
      case "/agenda":
        return "Agenda Kegiatan";
      case "/surat-masuk":
        return "Surat Masuk";
      case "/disposisi":
        return "Disposisi Surat";
      case "/pegawai":
        return "Data Pegawai";
      case "/notifikasi":
        return "Pusat Notifikasi";
      case "/profil":
        return "Pengaturan Profil";
      default:
        return "Halaman";
    }
  };

  // Helper Inisial Nama
  const getInitials = (name) => {
    if (!name) return "US";
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const title = getPageTitle(location.pathname);
  
  // Mengambil data murni dari prop user (tanpa nilai dummy/statis)
  const userName = user?.nama || user?.name || "Pengguna";
  const userEmail = user?.email || "";
  const initials = getInitials(userName);

  return (
    <header className="h-16 bg-white dark:bg-[#0b0f19] border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 transition-colors duration-200 shrink-0">
      {/* Sisi Kiri: Tombol Menu (Mobile), Judul, & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          aria-label="Buka Menu"
        >
          <Menu size={20} />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white leading-tight">
            {title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 hidden sm:block">
            Beranda <span className="mx-1">&gt;</span>{" "}
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              {title}
            </span>
          </p>
        </div>
      </div>

      {/* Sisi Kanan: Tombol Mode Gelap, Notifikasi, & Profil */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Tombol Toggle Mode Terang/Gelap */}
        <button
          onClick={toggleDarkMode}
          className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/50 flex items-center justify-center text-slate-600 dark:text-amber-300 hover:bg-slate-200 dark:hover:bg-slate-700/80 transition-all cursor-pointer"
          title={darkMode ? "Ubah ke Mode Terang" : "Ubah ke Mode Gelap"}
          aria-label="Toggle Dark Mode"
        >
          {darkMode ? (
            <Sun size={18} className="text-amber-400" />
          ) : (
            <Moon size={18} className="text-slate-600 dark:text-amber-300" />
          )}
        </button>

        {/* Tombol & Dropdown Notifikasi */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="relative w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/50 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/80 transition-all cursor-pointer"
            aria-label="Notifikasi"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse"></span>
            )}
          </button>

          {/* Panel Dropdown Notifikasi */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden transition-all">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Notifikasi</h3>
                  {unreadCount > 0 && (
                    <span className="bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                      {unreadCount} baru
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={() => handleMarkAsRead()}
                    className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    Tandai semua dibaca
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                    Tidak ada notifikasi saat ini.
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleMarkAsRead(item.id)}
                      className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer flex gap-3 items-start ${
                        !item.is_read && !item.read_at ? "bg-emerald-50/40 dark:bg-emerald-950/20" : ""
                      }`}
                    >
                      <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                        <Info size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {item.title || item.judul || "Pemberitahuan"}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                          {item.message || item.pesan || item.keterangan}
                        </p>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                          {item.created_at ? new Date(item.created_at).toLocaleDateString("id-ID", { hour: '2-digit', minute: '2-digit' }) : "Baru saja"}
                        </span>
                      </div>
                      {!item.is_read && !item.read_at && (
                        <span className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 shrink-0"></span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Pembatas Garis */}
        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block mx-1"></div>

        {/* Profil Pengguna */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-md shrink-0">
            {initials}
          </div>

          <div className="hidden md:block text-left">
            <p className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider truncate max-w-[160px]">
              {userName}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
              {userEmail}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;