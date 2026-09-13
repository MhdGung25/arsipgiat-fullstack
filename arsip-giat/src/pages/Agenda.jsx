import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Calendar as CalendarIcon, 
  Edit3, 
  Trash2, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  FileText 
} from 'lucide-react';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';
import { db } from '../firebase';

const Agenda = () => {
  const [kegiatan, setKegiatan] = useState([]);
  const [suratList, setSuratList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [formData, setFormData] = useState({
    id_surat: '',
    nama_acara: '',
    tanggal_giat: '',
    waktu_mulai: '',
    waktu_selesai: '',
    tempat: '',
    keterangan: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resKegiatan, resSurat] = await Promise.all([
        getDocs(collection(db, 'agenda')).catch(() => ({ docs: [] })),
        getDocs(collection(db, 'surat_masuk')).catch(() => ({ docs: [] }))
      ]);

      setKegiatan(resKegiatan.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setSuratList(resSurat.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Gagal mengambil data kegiatan:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setFormData({
      id_surat: '',
      nama_acara: '',
      tanggal_giat: '',
      waktu_mulai: '',
      waktu_selesai: '',
      tempat: '',
      keterangan: '',
    });
    setEditId(null);
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditId(item.id);
      setFormData({
        id_surat: item.id_surat || '',
        nama_acara: item.nama_acara || '',
        tanggal_giat: item.tanggal_giat || '',
        waktu_mulai: item.waktu_mulai ? item.waktu_mulai.substring(0, 5) : '',
        waktu_selesai: item.waktu_selesai ? item.waktu_selesai.substring(0, 5) : '',
        tempat: item.tempat || '',
        keterangan: item.keterangan || '',
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'id_surat' && value !== '') {
      const selectedSurat = suratList.find((s) => s.id === value);
      if (selectedSurat) {
        setFormData((prev) => ({
          ...prev,
          id_surat: value,
          nama_acara: prev.nama_acara || selectedSurat.perihal,
          tanggal_giat: prev.tanggal_giat || selectedSurat.tanggal_surat,
        }));
        return;
      }
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const selectedSurat = suratList.find((s) => s.id === formData.id_surat);

    const payload = {
      ...formData,
      id_surat: formData.id_surat || null,
      surat_masuk: selectedSurat ? { nomor_surat: selectedSurat.nomor_surat, perihal: selectedSurat.perihal } : null,
    };

    try {
      if (editId) {
        await updateDoc(doc(db, 'agenda', editId), payload);
      } else {
        await addDoc(collection(db, 'agenda'), payload);
      }
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Gagal menyimpan agenda:', error);
      alert('Terjadi kesalahan pada server/database.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus agenda ini?')) {
      try {
        await deleteDoc(doc(db, 'agenda', id));
        fetchData();
      } catch (error) {
        console.error('Gagal menghapus data:', error);
      }
    }
  };

  const filteredKegiatan = kegiatan.filter((item) => {
    const namaAcara = item.nama_acara || '';
    const tempat = item.tempat || '';
    return (
      namaAcara.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tempat.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredKegiatan.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredKegiatan.length / itemsPerPage) || 1;

  return (
    <div className="space-y-6 p-4 md:p-6 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Kelola Agenda Kegiatan</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Pantau dan kelola seluruh jadwal agenda kegiatan.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer"
        >
          <Plus size={18} />
          <span>Tambah Agenda</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-base font-bold text-slate-800 dark:text-white">Daftar Agenda Masuk</h2>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Cari agenda atau tempat..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : filteredKegiatan.length === 0 ? (
          <div className="p-12 text-center">
            <CalendarIcon className="mx-auto text-slate-300 mb-2" size={48} />
            <p className="text-slate-500 text-sm">Belum ada agenda kegiatan yang dicatat.</p>
          </div>
        ) : (
          <>
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-400 text-xs font-semibold uppercase border-b border-slate-100 dark:border-slate-800">
                    <th className="py-4 px-6 w-16 text-center">NO</th>
                    <th className="py-4 px-6">NAMA KEGIATAN</th>
                    <th className="py-4 px-6">REFERENSI SURAT</th>
                    <th className="py-4 px-6">TANGGAL & WAKTU</th>
                    <th className="py-4 px-6">LOKASI / TEMPAT</th>
                    <th className="py-4 px-6 text-center">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  {currentItems.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                      <td className="py-4 px-6 text-center text-slate-400 text-xs">{indexOfFirstItem + index + 1}</td>
                      <td className="py-4 px-6 font-bold text-slate-800 dark:text-slate-100">{item.nama_acara}</td>
                      <td className="py-4 px-6 text-xs">
                        {item.surat_masuk ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md border border-emerald-200">
                            <FileText size={12} /> {item.surat_masuk.nomor_surat}
                          </span>
                        ) : (
                          <span className="text-slate-400">Input Manual</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-300">
                        <div>{item.tanggal_giat}</div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {item.waktu_mulai ? item.waktu_mulai.substring(0, 5) : ''} - {item.waktu_selesai ? item.waktu_selesai.substring(0, 5) : 'Selesai'} WIB
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-300 font-medium">{item.tempat}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => handleOpenModal(item)} className="p-2 rounded-lg text-slate-500 hover:text-emerald-600 cursor-pointer">
                            <Edit3 size={16} />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg text-slate-500 hover:text-red-600 cursor-pointer">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span>Tampilkan</span>
                <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="bg-slate-50 dark:bg-slate-800 border rounded-lg px-2.5 py-1">
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
                <span>Data dari total {filteredKegiatan.length} data</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-1.5 rounded-lg border disabled:opacity-40 cursor-pointer">
                  <ChevronLeft size={16} />
                </button>
                <span className="font-bold px-2">{currentPage} / {totalPages}</span>
                <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="p-1.5 rounded-lg border disabled:opacity-40 cursor-pointer">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl my-auto">
            <div className="flex justify-between items-center px-6 py-4 border-b dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-800 dark:text-white">
                {editId ? 'Ubah Agenda Kegiatan' : 'Tambah Agenda Baru'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Hubungkan ke Surat Masuk (Opsional)</label>
                <select name="id_surat" value={formData.id_surat} onChange={handleChange} className="w-full px-3.5 py-2 rounded-xl border bg-white dark:bg-slate-800 text-sm">
                  <option value="">-- Tanpa Surat (Input Manual) --</option>
                  {suratList.map((surat) => (
                    <option key={surat.id} value={surat.id}>
                      {surat.nomor_surat} - {surat.perihal}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Nama Acara / Kegiatan</label>
                <input type="text" name="nama_acara" value={formData.nama_acara} onChange={handleChange} placeholder="Contoh: Rapat Koordinasi" className="w-full px-3.5 py-2 rounded-xl border bg-white dark:bg-slate-800 text-sm" required />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Tanggal</label>
                  <input type="date" name="tanggal_giat" value={formData.tanggal_giat} onChange={handleChange} className="w-full px-3 py-2 rounded-xl border bg-white dark:bg-slate-800 text-sm" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Jam Mulai</label>
                  <input type="time" name="waktu_mulai" value={formData.waktu_mulai} onChange={handleChange} className="w-full px-3 py-2 rounded-xl border bg-white dark:bg-slate-800 text-sm" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Jam Selesai</label>
                  <input type="time" name="waktu_selesai" value={formData.waktu_selesai} onChange={handleChange} className="w-full px-3 py-2 rounded-xl border bg-white dark:bg-slate-800 text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Tempat / Lokasi</label>
                <input type="text" name="tempat" value={formData.tempat} onChange={handleChange} placeholder="Aula Kecamatan" className="w-full px-3.5 py-2 rounded-xl border bg-white dark:bg-slate-800 text-sm" required />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Keterangan (Opsional)</label>
                <textarea name="keterangan" rows="3" value={formData.keterangan} onChange={handleChange} placeholder="Catatan tambahan..." className="w-full px-3.5 py-2 rounded-xl border bg-white dark:bg-slate-800 text-sm resize-none"></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t dark:border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl border text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer">Batal</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer">
                  {editId ? 'Simpan Perubahan' : 'Tambah Agenda'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agenda;