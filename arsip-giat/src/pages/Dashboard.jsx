import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Mail, 
  FileText, 
  Calendar, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight 
} from 'lucide-react';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const API_URL = 'http://127.0.0.1:8000/api';

  useEffect(() => {
    // 1. Ambil data nama pengguna terdaftar yang sedang login
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Gagal membaca data user dari storage:', e);
      }
    }

    // 2. Fetch data analytics dari backend Laravel
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setData(response.data.data);
      } catch (error) {
        console.error('Gagal mengambil data dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 dark:border-emerald-400"></div>
      </div>
    );
  }

  const counters = data?.counters || {};
  const status = data?.disposisi_status || {};

  return (
    <div className="space-y-6 p-4 md:p-6 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-200">
      {/* Banner Sapaan Pengguna Terdaftar */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 dark:from-emerald-700 dark:to-teal-900 rounded-2xl p-6 text-white shadow-lg shadow-emerald-900/10">
        <h1 className="text-2xl font-bold">
          Selamat Datang Kembali, {user?.name || user?.nama || 'Admin Rancaekek'}! 👋
        </h1>
        <p className="text-emerald-100 text-sm mt-1">
          Berikut adalah ringkasan analitik dan aktivitas terkini di Aplikasi ArsipGiat Kecamatan Rancaekek.
        </p>
      </div>

      {/* Counter Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-xs flex items-center justify-between transition-colors">
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Surat Masuk</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{counters.total_surat_masuk ?? 0}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Mail size={24} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-xs flex items-center justify-between transition-colors">
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Total Disposisi</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{counters.total_disposisi ?? 0}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <FileText size={24} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-xs flex items-center justify-between transition-colors">
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Agenda Kegiatan</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{counters.total_agenda ?? 0}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Calendar size={24} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-xs flex items-center justify-between transition-colors">
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Total Pegawai</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{counters.total_pegawai ?? 0}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Users size={24} />
          </div>
        </div>
      </div>

      {/* Breakdown Status Disposisi */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-xs transition-colors">
        <h2 className="text-base font-bold text-slate-800 dark:text-white mb-4">Status Penugasan Disposisi</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-amber-600 dark:text-amber-400" size={20} />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Pending</span>
            </div>
            <span className="text-lg font-bold text-amber-700 dark:text-amber-400">{status.pending ?? 0}</span>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="text-blue-600 dark:text-blue-400" size={20} />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Dalam Proses</span>
            </div>
            <span className="text-lg font-bold text-blue-700 dark:text-blue-400">{status.proses ?? 0}</span>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-emerald-600 dark:text-emerald-400" size={20} />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Selesai</span>
            </div>
            <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{status.selesai ?? 0}</span>
          </div>
        </div>
      </div>

      {/* Section Data Terbaru */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Surat Masuk Terbaru */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-xs p-5 transition-colors">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-bold text-slate-800 dark:text-white">Surat Masuk Terbaru</h2>
            <a href="/surat-masuk" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-semibold">
              Lihat Semua <ArrowRight size={14} />
            </a>
          </div>
          <div className="space-y-3">
            {data?.recent_surat_masuk?.length > 0 ? (
              data.recent_surat_masuk.map((surat) => (
                <div key={surat.id} className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{surat.nomor_surat}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{surat.perihal}</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Pengirim: {surat.pengirim || '-'}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-6">Belum ada data surat masuk.</p>
            )}
          </div>
        </div>

        {/* Disposisi Terbaru */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-xs p-5 transition-colors">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-bold text-slate-800 dark:text-white">Disposisi Penugasan Terbaru</h2>
            <a href="/disposisi" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-semibold">
              Lihat Semua <ArrowRight size={14} />
            </a>
          </div>
          <div className="space-y-3">
            {data?.recent_disposisi?.length > 0 ? (
              data.recent_disposisi.map((disp) => (
                <div key={disp.id} className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      {disp.surat_masuk?.nomor_surat || 'N/A'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      Ditugaskan Ke: <span className="font-semibold text-slate-700 dark:text-slate-200">{disp.pegawai?.name || `User ID: ${disp.user_id}`}</span>
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 italic">
                      "{disp.catatan || 'Tanpa catatan'}"
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    disp.status === 'Selesai' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400' :
                    disp.status === 'Proses' ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400' : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                  }`}>
                    {disp.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-6">Belum ada penugasan disposisi.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;