import { useState, useEffect } from 'react';
import { 
  FileText, 
  Calendar, 
  FileCheck, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const Dashboard = () => {
  const [stats, setStats] = useState({
    suratMasukCount: 0,
    agendaCount: 0,
    disposisiCount: 0,
    pegawaiCount: 0,
  });

  const [recentDisposisi, setRecentDisposisi] = useState([]);
  const [loading, setLoading] = useState(true);

  // Real-time listener menggunakan onSnapshot untuk semua koleksi
  useEffect(() => {
    setLoading(true);

    // Listener Surat Masuk
    const unsubSurat = onSnapshot(collection(db, 'surat_masuk'), (snapshot) => {
      setStats((prev) => ({ ...prev, suratMasukCount: snapshot.size }));
    });

    // Listener Agenda
    const unsubAgenda = onSnapshot(collection(db, 'agenda'), (snapshot) => {
      setStats((prev) => ({ ...prev, agendaCount: snapshot.size }));
    });

    // Listener Disposisi (Sekaligus mengambil data terbaru untuk tabel ringkasan)
    const unsubDisposisi = onSnapshot(collection(db, 'disposisi'), (snapshot) => {
      const dataDisposisi = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStats((prev) => ({ ...prev, disposisiCount: snapshot.size }));
      
      // Ambil 5 disposisi terbaru untuk ditampilkan di dasbor
      setRecentDisposisi(dataDisposisi.slice(0, 5));
    });

    // Listener Pegawai
    const unsubPegawai = onSnapshot(collection(db, 'pegawai'), (snapshot) => {
      setStats((prev) => ({ ...prev, pegawaiCount: snapshot.size }));
      setLoading(false);
    });

    // Cleanup listener ketika komponen ditutup
    return () => {
      unsubSurat();
      unsubAgenda();
      unsubDisposisi();
      unsubPegawai();
    };
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Selesai':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
            <CheckCircle2 size={11} /> Selesai
          </span>
        );
      case 'Proses':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60">
            <Clock size={11} /> Proses
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
            <AlertCircle size={11} /> Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-200">
      {/* Header Sambutan (Bagian status sistem di kanan sudah dihapus bersih) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            Selamat Datang, <span className="text-emerald-600 dark:text-emerald-400">Linda Agustina.A.Md</span> 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Berikut adalah ringkasan sistem informasi arsip dan kegiatan Kecamatan Rancaekek secara real-time.
          </p>
        </div>
      </div>

      {/* Kartu Statistik Ringkasan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Surat Masuk */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Surat Masuk</p>
            <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white mt-1">
              {loading ? '...' : stats.suratMasukCount}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <FileText size={22} />
          </div>
        </div>

        {/* Agenda Kegiatan */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Agenda Kegiatan</p>
            <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white mt-1">
              {loading ? '...' : stats.agendaCount}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Calendar size={22} />
          </div>
        </div>

        {/* Disposisi */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Disposisi Surat</p>
            <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white mt-1">
              {loading ? '...' : stats.disposisiCount}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <FileCheck size={22} />
          </div>
        </div>

        {/* Pegawai */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Data Pegawai</p>
            <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white mt-1">
              {loading ? '...' : stats.pegawaiCount}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Users size={22} />
          </div>
        </div>
      </div>

      {/* Tabel Ringkasan Disposisi Terbaru */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-white">Disposisi Penugasan Terbaru</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Pembaruan langsung secara real-time dari aktivitas instansi.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-emerald-600"></div>
          </div>
        ) : recentDisposisi.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-xs">
            Belum ada data disposisi yang masuk.
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-800/40 text-slate-400 text-[11px] font-semibold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <th className="py-3 px-5">Nomor Surat</th>
                  <th className="py-3 px-5">Pegawai Ditugaskan</th>
                  <th className="py-3 px-5">Sifat</th>
                  <th className="py-3 px-5">Tanggal</th>
                  <th className="py-3 px-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {recentDisposisi.map((item) => {
                  const namaPegawai = item.pegawai?.nama || item.pegawai?.name || item.nama_pegawai || 'Tanpa Nama';
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                      <td className="py-3.5 px-5 font-bold text-slate-800 dark:text-slate-100">
                        {item.surat_masuk?.nomor_surat || 'N/A'}
                      </td>
                      <td className="py-3.5 px-5 font-medium text-slate-700 dark:text-slate-300">
                        {namaPegawai}
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="font-semibold text-slate-600 dark:text-slate-400">{item.sifat || 'Biasa'}</span>
                      </td>
                      <td className="py-3.5 px-5 text-slate-500">
                        {item.tanggal_disposisi || '-'}
                      </td>
                      <td className="py-3.5 px-5">
                        {getStatusBadge(item.status)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;