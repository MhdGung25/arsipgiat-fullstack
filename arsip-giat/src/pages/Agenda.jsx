import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, Calendar as CalendarIcon, MapPin, Edit3, Trash2, X, ChevronLeft, ChevronRight, FileText } from 'lucide-react';

const Agenda = () => {
  const [kegiatan, setKegiatan] = useState([]);
  const [suratList, setSuratList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Form State
  const [formData, setFormData] = useState({
    id_surat: '',
    nama_acara: '',
    tanggal_giat: '',
    waktu_mulai: '',
    waktu_selesai: '',
    tempat: '',
    keterangan: '',
  });

  const [formErrors, setFormErrors] = useState({});

  // Fetch Data Kegiatan
  const fetchKegiatan = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://127.0.0.1:8000/api/kegiatan');
      setKegiatan(response.data.data || []);
    } catch (error) {
      console.error('Gagal mengambil data kegiatan:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Data Surat Masuk untuk Opsi Pilihan Otomatis
  const fetchSuratMasuk = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/surat-masuk');
      setSuratList(response.data.data || []);
    } catch (error) {
      console.error('Gagal mengambil data surat masuk:', error);
    }
  };

  useEffect(() => {
    fetchKegiatan();
    fetchSuratMasuk();
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
    setFormErrors({});
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
      const selectedSurat = suratList.find((s) => s.id === parseInt(value));
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
    setFormErrors({});

    const payload = {
      ...formData,
      id_surat: formData.id_surat ? parseInt(formData.id_surat) : null,
    };

    try {
      if (editId) {
        await axios.put(`http://127.0.0.1:8000/api/kegiatan/${editId}`, payload);
      } else {
        await axios.post('http://127.0.0.1:8000/api/kegiatan', payload);
      }
      setIsModalOpen(false);
      resetForm();
      fetchKegiatan();
    } catch (error) {
      if (error.response && error.response.status === 422) {
        setFormErrors(error.response.data.errors);
      } else {
        alert('Terjadi kesalahan pada server.');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus agenda ini?')) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/kegiatan/${id}`);
        fetchKegiatan();
      } catch (error) {
        alert('Gagal menghapus data.');
      }
    }
  };

  const filteredKegiatan = kegiatan.filter((item) =>
    item.nama_acara.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.tempat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredKegiatan.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredKegiatan.length / itemsPerPage) || 1;

  return (
    <div className="space-y-6 p-4 md:p-6 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-200">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Kelola Agenda Kegiatan</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Pantau dan kelola seluruh jadwal agenda kegiatan secara real-time.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-md shadow-emerald-900/10 active:scale-95 shrink-0 cursor-pointer"
        >
          <Plus size={18} />
          <span>Tambah Agenda</span>
        </button>
      </div>

      {/* Kontainer Tabel */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-xs overflow-hidden transition-colors">
        {/* Top bar dengan Pencarian */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
          <h2 className="text-base font-bold text-slate-800 dark:text-white">Daftar Agenda Masuk</h2>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Cari agenda atau tempat..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 dark:border-emerald-400"></div>
          </div>
        ) : filteredKegiatan.length === 0 ? (
          <div className="p-12 text-center">
            <CalendarIcon className="mx-auto text-slate-300 dark:text-slate-600 mb-2" size={48} />
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Belum ada agenda kegiatan yang dicatat.</p>
          </div>
        ) : (
          <>
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50/70 dark:bg-slate-800/40 text-slate-400 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
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
                      <td className="py-4 px-6 text-center text-slate-400 dark:text-slate-500 font-medium text-xs">
                        {indexOfFirstItem + index + 1}
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-800 dark:text-slate-100">{item.nama_acara}</td>
                      <td className="py-4 px-6 text-xs">
                        {item.surat_masuk ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-md font-medium border border-emerald-200 dark:border-emerald-800/60">
                            <FileText size={12} /> {item.surat_masuk.nomor_surat}
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500">Input Manual</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-300">
                        <div>{item.tanggal_giat}</div>
                        <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                          {item.waktu_mulai?.substring(0, 5)} - {item.waktu_selesai ? item.waktu_selesai.substring(0, 5) : 'Selesai'} WIB
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-300 font-medium">{item.tempat}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenModal(item)}
                            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginasi */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span>Tampilkan</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
                <span>Data dari total {filteredKegiatan.length} data</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition text-slate-600 dark:text-slate-300"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="font-bold text-slate-700 dark:text-slate-300 px-2">{currentPage} / {totalPages}</span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition text-slate-600 dark:text-slate-300"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal Form dengan Perbaikan Jarak Atas-Bawah & Posisi Tengah */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl transition-colors my-auto">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-800 dark:text-white">
                {editId ? 'Ubah Agenda Kegiatan' : 'Tambah Agenda Baru'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Hubungkan ke Surat Masuk (Opsional)
                </label>
                <select
                  name="id_surat"
                  value={formData.id_surat}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-emerald-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                >
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
                <input
                  type="text"
                  name="nama_acara"
                  value={formData.nama_acara}
                  onChange={handleChange}
                  placeholder="Contoh: Rapat Koordinasi Wilayah"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
                  required
                />
                {formErrors.nama_acara && <p className="text-red-500 text-xs mt-1">{formErrors.nama_acara[0]}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Tanggal</label>
                  <input
                    type="date"
                    name="tanggal_giat"
                    value={formData.tanggal_giat}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Jam Mulai</label>
                  <input
                    type="time"
                    name="waktu_mulai"
                    value={formData.waktu_mulai}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Jam Selesai</label>
                  <input
                    type="time"
                    name="waktu_selesai"
                    value={formData.waktu_selesai}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Tempat / Lokasi</label>
                <input
                  type="text"
                  name="tempat"
                  value={formData.tempat}
                  onChange={handleChange}
                  placeholder="Contoh: Aula Kecamatan"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Keterangan (Opsional)</label>
                <textarea
                  name="keterangan"
                  rows="3"
                  value={formData.keterangan}
                  onChange={handleChange}
                  placeholder="Catatan tambahan..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 resize-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-semibold transition"
                >
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