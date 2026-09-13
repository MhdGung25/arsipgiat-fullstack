import { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Info, 
  Calendar 
} from 'lucide-react';
import { 
  collection, 
  getDocs, 
  updateDoc, 
  doc, 
  query, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../firebase'; // Sesuaikan path file firebase.js kamu

const Notifikasi = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Menggunakan Firebase real-time listener (onSnapshot) untuk update otomatis
  useEffect(() => {
    const q = query(collection(db, 'notifikasi'), orderBy('created_at', 'desc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const notifData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotifications(notifData);
      setLoading(false);
    }, (error) => {
      console.error('Gagal memuat notifikasi dari Firebase:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Tandai satu notifikasi terbaca
  const handleMarkAsRead = async (id) => {
    try {
      const notifRef = doc(db, 'notifikasi', id);
      await updateDoc(notifRef, {
        is_read: true,
        read_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Gagal memperbarui notifikasi:', error);
    }
  };

  // Tandai semua terbaca
  const handleMarkAllAsRead = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'notifikasi'));
      const updatePromises = querySnapshot.docs.map(async (document) => {
        const notifRef = doc(db, 'notifikasi', document.id);
        return updateDoc(notifRef, {
          is_read: true,
          read_at: new Date().toISOString()
        });
      });
      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Gagal memperbarui semua notifikasi:', error);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-200">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Pusat Notifikasi</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Kelola dan lihat seluruh riwayat pemberitahuan sistem Anda secara real-time.
          </p>
        </div>
        <button
          onClick={handleMarkAllAsRead}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-md shadow-emerald-900/10 active:scale-95 shrink-0 cursor-pointer"
        >
          <CheckCheck size={18} />
          <span>Tandai Semua Dibaca</span>
        </button>
      </div>

      {/* Daftar Notifikasi */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-xs overflow-hidden transition-colors">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-base font-bold text-slate-800 dark:text-white">Semua Pemberitahuan</h2>
          <span className="text-xs text-slate-400 dark:text-slate-500">Pembaruan otomatis aktif (Firebase)</span>
        </div>

        {loading && notifications.length === 0 ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 dark:border-emerald-400"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="mx-auto text-slate-300 dark:text-slate-600 mb-2" size={48} />
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Tidak ada notifikasi saat ini.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {notifications.map((item) => {
              const isUnread = !item.is_read && !item.read_at;
              return (
                <div
                  key={item.id}
                  onClick={() => isUnread && handleMarkAsRead(item.id)}
                  className={`p-4 md:p-5 flex items-start gap-4 transition cursor-pointer hover:bg-slate-50/60 dark:hover:bg-slate-800/40 ${
                    isUnread ? 'bg-emerald-50/30 dark:bg-emerald-950/20' : ''
                  }`}
                >
                  <div className={`p-3 rounded-2xl shrink-0 mt-0.5 ${
                    isUnread 
                      ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                  }`}>
                    <Info size={20} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className={`text-sm font-bold truncate ${isUnread ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                        {item.title}
                      </h3>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 shrink-0 flex items-center gap-1">
                        <Calendar size={12} />
                        {item.created_at ? new Date(item.created_at).toLocaleString('id-ID') : 'Baru saja'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      {item.message}
                    </p>
                  </div>

                  {isUnread && (
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0 self-center"></span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifikasi;