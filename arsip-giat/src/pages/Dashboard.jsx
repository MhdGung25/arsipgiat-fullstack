import { useState, useEffect } from 'react';
import { 
  Mail, 
  FileText, 
  Calendar, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
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

    let suratList = [];
    let disposisiList = [];
    let agendaList = [];
    let pegawaiList = [];

    const updateDashboardState = () => {
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
      setLoading(false);
    };

    const unsubSurat = onSnapshot(collection(db, 'surat_masuk'), (snapshot) => {
      suratList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      updateDashboardState();
    }, (error) => {
      console.warn("Koneksi real-time surat_masuk disesuaikan ulang:", error.code);
    });

    const unsubDisposisi = onSnapshot(collection(db, 'disposisi'), (snapshot) => {
      disposisiList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      updateDashboardState();
    }, (error) => {
      console.warn("Koneksi real-time disposisi disesuaikan ulang:", error.code);
    });

    const unsubAgenda = onSnapshot(collection(db, 'agenda'), (snapshot) => {
      agendaList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      updateDashboardState();
    }, (error) => {
      console.warn("Koneksi real-time agenda disesuaikan ulang:", error.code);
    });

    const unsubPegawai = onSnapshot(collection(db, 'pegawai'), (snapshot) => {
      pegawaiList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      updateDashboardState();
    }, (error) => {
      console.warn("Koneksi real-time pegawai disesuaikan ulang:", error.code);
    });

    return () => {
      unsubSurat();
      unsubDisposisi();
      unsubAgenda();
      unsubPegawai();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 dark:border-emerald-400"></div>
      </div>
    );
  }

  const counters = data.counters;
  const status = data.disposisi_status;
  const displayName = user?.nama || user?.name || 'Linda Agustina.A.Md';

  return (
    <div className="p-4 lg:p-6 space-y-5 bg-slate-50 dark:bg-slate-950 min-h-full transition-colors duration-200">
      {/* Banner Selamat Datang */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 dark:from-emerald-700 dark:to-teal-900 rounded-2xl p-5 lg:p-6 text-white shadow-md">
        <h1 className="text-xl lg:text-2xl font-bold tracking-tight">
          Selamat Datang Kembali, {displayName}! 👋
        </h1>
        <p className="text-emerald-100 text-xs lg:text-sm mt-1">
          Berikut adalah ringkasan analitik dan aktivitas terkini di Aplikasi ArsipGiat Kecamatan Rancaekek.
        </p>
      </div>

      {/* Grid Kartu Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 lg:p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Surat Masuk</p>
            <h3 className="text-xl lg:text-2xl font-extrabold text-slate-800 dark:text-white mt-1">{counters.total_surat_masuk}</h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center shrink-0">
            <Mail size={22} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 lg:p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Disposisi</p>
            <h3 className="text-xl lg:text-2xl font-extrabold text-slate-800 dark:text-white mt-1">{counters.total_disposisi}</h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center shrink-0">
            <FileText size={22} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 lg:p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Agenda Kegiatan</p>
            <h3 className="text-xl lg:text-2xl font-extrabold text-slate-800 dark:text-white mt-1">{counters.total_agenda}</h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center shrink-0">
            <Calendar size={22} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 lg:p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Pegawai</p>
            <h3 className="text-xl lg:text-2xl font-extrabold text-slate-800 dark:text-white mt-1">{counters.total_pegawai}</h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center shrink-0">
            <Users size={22} />
          </div>
        </div>
      </div>

      {/* Bagian Status Penugasan Disposisi */}
      <div className="bg-white dark:bg-slate-900 p-5 lg:p-6 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-xs">
        <h2 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wide mb-4">Status Penugasan Disposisi</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="text-amber-600" size={18} />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Pending</span>
            </div>
            <span className="text-base font-extrabold text-amber-700">{status.pending}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Clock className="text-blue-600" size={18} />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Dalam Proses</span>
            </div>
            <span className="text-base font-extrabold text-blue-700">{status.proses}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="text-emerald-600" size={18} />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Selesai</span>
            </div>
            <span className="text-base font-extrabold text-emerald-700">{status.selesai}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;