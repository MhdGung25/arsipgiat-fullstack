import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Calendar, 
  Edit3, 
  Trash2, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Send,
  UserCheck,
  UserPlus
} from 'lucide-react';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const Disposisi = () => {
  const [disposisiList, setDisposisiList] = useState([]);
  const [suratOptions, setSuratOptions] = useState([]);
  const [userOptions, setUserOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  
  // Mode Input Pegawai (Dropdown DB vs Manual Nama)
  const [isManualUser, setIsManualUser] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Form State
  const [formData, setFormData] = useState({
    id_surat: '',
    user_id: '',
    nama_pegawai: '',
    sifat: 'Biasa',
    catatan: '',
    tanggal_disposisi: new Date().toISOString().split('T')[0],
    status: 'Pending',
  });

  const [formErrors, setFormErrors] = useState({});

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resDisposisi, resSurat, resUser] = await Promise.all([
        axios.get(`${API_BASE_URL}/disposisi`).catch(() => ({ data: { data: [] } })),
        axios.get(`${API_BASE_URL}/surat-masuk`).catch(() => ({ data: { data: [] } })),
        axios.get(`${API_BASE_URL}/users`).catch(() => ({ data: { data: [] } }))
      ]);

      setDisposisiList(resDisposisi.data.data || []);
      setSuratOptions(resSurat.data.data || []);
      setUserOptions(resUser.data.data || []);
    } catch (error) {
      console.error('Gagal mengambil data:', error);
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
      user_id: '',
      nama_pegawai: '',
      sifat: 'Biasa',
      catatan: '',
      tanggal_disposisi: new Date().toISOString().split('T')[0],
      status: 'Pending',
    });
    setFormErrors({});
    setEditId(null);
    setIsManualUser(false);
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditId(item.id);
      const isManual = !item.user_id && Boolean(item.nama_pegawai);
      setIsManualUser(isManual);

      setFormData({
        id_surat: item.id_surat || '',
        user_id: item.user_id || '',
        nama_pegawai: item.nama_pegawai || '',
        sifat: item.sifat || 'Biasa',
        catatan: item.catatan || '',
        tanggal_disposisi: item.tanggal_disposisi || '',
        status: item.status || 'Pending',
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});

    // Siapkan payload berdasarkan mode input
    const payload = {
      ...formData,
      user_id: isManualUser ? null : formData.user_id,
      nama_pegawai: isManualUser ? formData.nama_pegawai : null,
    };

    try {
      if (editId) {
        await axios.put(`${API_BASE_URL}/disposisi/${editId}`, payload);
      } else {
        await axios.post(`${API_BASE_URL}/disposisi`, payload);
      }
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      if (error.response && error.response.status === 422) {
        setFormErrors(error.response.data.errors);
      } else {
        alert('Terjadi kesalahan server saat menyimpan disposisi.');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data disposisi ini?')) {
      try {
        await axios.delete(`${API_BASE_URL}/disposisi/${id}`);
        fetchData();
      } catch (error) {
        alert('Gagal menghapus data disposisi.');
      }
    }
  };

  const filteredDisposisi = disposisiList.filter((item) => {
    const perihal = item.surat_masuk?.perihal || '';
    const nomorSurat = item.surat_masuk?.nomor_surat || '';
    const pegawaiNama = item.pegawai?.nama || item.pegawai?.name || item.nama_pegawai || '';
    const pegawaiJabatan = item.pegawai?.jabatan || '';
    const catatan = item.catatan || '';
    const search = searchTerm.toLowerCase();

    return (
      perihal.toLowerCase().includes(search) ||
      nomorSurat.toLowerCase().includes(search) ||
      pegawaiNama.toLowerCase().includes(search) ||
      pegawaiJabatan.toLowerCase().includes(search) ||
      catatan.toLowerCase().includes(search)
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDisposisi.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDisposisi.length / itemsPerPage) || 1;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Selesai':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
            <CheckCircle2 size={12} /> Selesai
          </span>
        );
      case 'Proses':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60">
            <Clock size={12} /> Dalam Proses
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
            <AlertCircle size={12} /> Pending
          </span>
        );
    }
  };

  const getSifatBadge = (sifat) => {
    switch (sifat) {
      case 'Sangat Segera':
        return <span className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-800/60">Sangat Segera</span>;
      case 'Segera':
        return <span className="text-xs font-semibold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/60 px-2 py-0.5 rounded-md border border-orange-200 dark:border-orange-800/60">Segera</span>;
      default:
        return <span className="text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">Biasa</span>;
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">Disposisi Surat</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Halaman penugasan pegawai dan tindak lanjut instruksi surat masuk.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-sm active:scale-95 shrink-0 cursor-pointer"
        >
          <Plus size={18} />
          <span>Buat Disposisi</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden transition-colors">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
          <h2 className="text-sm sm:text-base font-bold text-slate-800 dark:text-white">Daftar Penugasan Disposisi</h2>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Cari surat, pegawai, catatan..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 transition"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 dark:border-emerald-400"></div>
          </div>
        ) : filteredDisposisi.length === 0 ? (
          <div className="p-12 text-center">
            <Send className="mx-auto text-slate-300 dark:text-slate-600 mb-2" size={48} />
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Belum ada disposisi penugasan tercatat.</p>
          </div>
        ) : (
          <>
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50/70 dark:bg-slate-800/40 text-slate-400 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                    <th className="py-4 px-6 w-16 text-center">NO</th>
                    <th className="py-4 px-6">SURAT MASUK</th>
                    <th className="py-4 px-6">PEGAWAI DITUGASKAN</th>
                    <th className="py-4 px-6">SIFAT & TANGGAL</th>
                    <th className="py-4 px-6">CATATAN / INSTRUKSI</th>
                    <th className="py-4 px-6">STATUS</th>
                    <th className="py-4 px-6 text-center">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  {currentItems.map((item, index) => {
                    const namaPegawai = item.pegawai?.nama || item.pegawai?.name || item.nama_pegawai || 'Tanpa Nama';
                    const jabatanPegawai = item.pegawai?.jabatan || (item.nama_pegawai ? 'Manual Input' : 'Pegawai');

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                        <td className="py-4 px-6 text-center text-slate-400 dark:text-slate-500 font-medium text-xs">
                          {indexOfFirstItem + index + 1}
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-800 dark:text-slate-100">
                            {item.surat_masuk?.nomor_surat || 'N/A'}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                            {item.surat_masuk?.perihal || 'Tidak ada perihal'}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 uppercase">
                              {namaPegawai.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800 dark:text-slate-100 leading-tight">
                                {namaPegawai}
                              </p>
                              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                                {jabatanPegawai}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div>{getSifatBadge(item.sifat)}</div>
                          <div className="text-xs text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                            <Calendar size={12} />
                            <span>{item.tanggal_disposisi}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 max-w-xs">
                          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 italic">
                            "{item.catatan || 'Tidak ada catatan'}"
                          </p>
                        </td>
                        <td className="py-4 px-6">{getStatusBadge(item.status)}</td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleOpenModal(item)}
                              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition cursor-pointer"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition cursor-pointer"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
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
                <span>Data dari total {filteredDisposisi.length} data</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 transition cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="font-bold text-slate-700 dark:text-slate-300 px-2">{currentPage} / {totalPages}</span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 transition cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal Form dengan Perbaikan Posisi Tengah, Jarak Aman, & Scroll */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl transition-colors my-auto">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-800 dark:text-white">
                {editId ? 'Ubah Disposisi Penugasan' : 'Buat Disposisi Baru'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Pilih Surat Masuk</label>
                <select
                  name="id_surat"
                  value={formData.id_surat}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
                  required
                >
                  <option value="">-- Pilih Surat --</option>
                  {suratOptions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nomor_surat} - {s.perihal}
                    </option>
                  ))}
                </select>
                {formErrors.id_surat && <p className="text-red-500 text-xs mt-1">{formErrors.id_surat[0]}</p>}
              </div>

              {/* Pegawai Assignment Field */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {isManualUser ? 'Input Nama Pegawai Manual' : 'Pilih Pegawai (Database)'}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsManualUser(!isManualUser);
                      setFormData((prev) => ({ ...prev, user_id: '', nama_pegawai: '' }));
                    }}
                    className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    {isManualUser ? (
                      <>
                        <UserCheck size={14} /> Pilih dari Daftar
                      </>
                    ) : (
                      <>
                        <UserPlus size={14} /> Input Nama Manual
                      </>
                    )}
                  </button>
                </div>

                {!isManualUser ? (
                  <select
                    name="user_id"
                    value={formData.user_id}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
                    required
                  >
                    <option value="">-- Pilih Pegawai --</option>
                    {userOptions.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nama || u.name} {u.jabatan ? `(${u.jabatan})` : ''}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    name="nama_pegawai"
                    value={formData.nama_pegawai}
                    onChange={handleChange}
                    placeholder="Masukkan Nama Pegawai"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
                    required
                  />
                )}
                {formErrors.user_id && <p className="text-red-500 text-xs mt-1">{formErrors.user_id[0]}</p>}
                {formErrors.nama_pegawai && <p className="text-red-500 text-xs mt-1">{formErrors.nama_pegawai[0]}</p>}
              </div>

              {/* Sifat & Tanggal Disposisi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Sifat Disposisi</label>
                  <select
                    name="sifat"
                    value={formData.sifat}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Biasa">Biasa</option>
                    <option value="Segera">Segera</option>
                    <option value="Sangat Segera">Sangat Segera</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Tanggal Disposisi</label>
                  <input
                    type="date"
                    name="tanggal_disposisi"
                    value={formData.tanggal_disposisi}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
                    required
                  />
                  {formErrors.tanggal_disposisi && <p className="text-red-500 text-xs mt-1">{formErrors.tanggal_disposisi[0]}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Status Penugasan</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="Proses">Proses</option>
                  <option value="Selesai">Selesai</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Catatan / Instruksi Pimpinan</label>
                <textarea
                  name="catatan"
                  rows="3"
                  value={formData.catatan}
                  onChange={handleChange}
                  placeholder="Instruksi penugasan untuk pegawai..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 resize-none"
                ></textarea>
                {formErrors.catatan && <p className="text-red-500 text-xs mt-1">{formErrors.catatan[0]}</p>}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-semibold transition cursor-pointer"
                >
                  {editId ? 'Simpan Perubahan' : 'Kirim Disposisi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Disposisi;