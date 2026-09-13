import { useState, useEffect } from 'react';
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
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const Dashboard = () => {
  const [data, setData] = useState({
    counters: {
      total_surat_masuk: 0,
      total_disposisi: 0,
      total_agenda: 0,
      total_pegawai: 0,
    },
    disposisi_status: {
      pending: 0,
      proses: 0,
      selesai: 0,
    },
    recent_surat_masuk: [],
    recent_disposisi: [],
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Gagal membaca data user dari storage:', e);
      }
    }

    const fetchDashboardData = async () => {
      try {
        const [suratSnapshot, disposisiSnapshot, agendaSnapshot, pegawaiSnapshot] = await Promise.all([
          getDocs(collection(db, 'surat_masuk')).catch(() => ({ docs: [] })),
          getDocs(collection(db, 'disposisi')).catch(() => ({ docs: [] })),
          getDocs(collection(db, 'agenda')).catch(() => ({ docs: [] })),
          getDocs(collection(db, 'pegawai')).catch(() => ({ docs: [] })),
        ]);

        const suratList = suratSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const disposisiList = disposisiSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const agendaList = agendaSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const pegawaiList = pegawaiSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        let pendingCount = 0;
        let prosesCount = 0;
        let selesaiCount = 0;

        disposisiList.forEach(item => {
          const statusVal = (item.status || '').toLowerCase();
          if (statusVal.includes('pending')) pendingCount++;
          else if (statusVal.includes('proses')) prosesCount++;
          else if (statusVal.includes('selesai')) selesaiCount++;
        });

        setData({
          counters: {
            total_surat_masuk: suratList.length,
            total_disposisi: disposisiList.length,
            total_agenda: agendaList.length,
            total_pegawai: pegawaiList.length,
          },
          disposisi_status: {
            pending: pendingCount,
            proses: prosesCount,
            selesai: selesaiCount,
          },
          recent_surat_masuk: suratList.slice(0, 5),
          recent_disposisi: disposisiList.slice(0, 5),
        });
      } catch (error) {
        console.error('Gagal mengambil data dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 dark:border-emerald-400"></div>
      </div>
    );
  }

  const counters = data.counters;
  const status = data.disposisi_status;

  return (
    <div className="space-y-6 p-4 md:p-6 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-200">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 dark:from-emerald-700 dark:to-teal-900 rounded-2xl p-6 text-white shadow-lg shadow-emerald-900/10">
        <h1 className="text-2xl font-bold">
          Selamat Datang Kembali, {user?.name || user?.nama || 'Admin Rancaekek'}! 👋
        </h1>
        <p className="text-emerald-100 text-sm mt-1">
          Berikut adalah ringkasan analitik dan aktivitas terkini di Aplikasi ArsipGiat Kecamatan Rancaekek.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Surat Masuk</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{counters.total_surat_masuk}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center">
            <Mail size={24} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Disposisi</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{counters.total_disposisi}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
            <FileText size={24} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Agenda Kegiatan</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{counters.total_agenda}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center">
            <Calendar size={24} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Pegawai</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{counters.total_pegawai}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center">
            <Users size={24} />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-xs">
        <h2 className="text-base font-bold text-slate-800 dark:text-white mb-4">Status Penugasan Disposisi</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-amber-600" size={20} />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Pending</span>
            </div>
            <span className="text-lg font-bold text-amber-700">{status.pending}</span>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="text-blue-600" size={20} />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Dalam Proses</span>
            </div>
            <span className="text-lg font-bold text-blue-700">{status.proses}</span>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-emerald-600" size={20} />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Selesai</span>
            </div>
            <span className="text-lg font-bold text-emerald-700">{status.selesai}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;