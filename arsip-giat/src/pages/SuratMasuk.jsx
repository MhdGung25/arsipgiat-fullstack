import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, 
  Search, 
  FileText, 
  Calendar, 
  Paperclip, 
  Edit3, 
  Trash2, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink,
  Download
} from 'lucide-react';

const SuratMasuk = () => {
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
    nomor_surat: '',
    pengirim: '',
    perihal: '',
    tanggal_surat: '',
    tanggal_diterima: '',
    keterangan: '',
    file_surat: null,
  });

  const [existingFileName, setExistingFileName] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // Base URL Storage
  const STORAGE_URL = 'http://127.0.0.1:8000/storage';

  // 1. Fetch Data Surat Masuk
  const fetchSuratMasuk = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://127.0.0.1:8000/api/surat-masuk');
      setSuratList(response.data.data || []);
    } catch (error) {
      console.error('Gagal mengambil data surat masuk:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuratMasuk();
  }, []);

  const resetForm = () => {
    setFormData({
      nomor_surat: '',
      pengirim: '',
      perihal: '',
      tanggal_surat: '',
      tanggal_diterima: '',
      keterangan: '',
      file_surat: null,
    });
    setExistingFileName('');
    setFormErrors({});
    setEditId(null);
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditId(item.id);
      setFormData({
        nomor_surat: item.nomor_surat || '',
        pengirim: item.pengirim || '',
        perihal: item.perihal || '',
        tanggal_surat: item.tanggal_surat || '',
        tanggal_diterima: item.tanggal_diterima || '',
        keterangan: item.keterangan || '',
        file_surat: null,
      });
      setExistingFileName(item.file_surat || '');
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file_surat') {
      setFormData((prev) => ({ ...prev, file_surat: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // 2. Submit Form (Create & Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});

    // Gunakan FormData untuk upload file
    const data = new FormData();
    data.append('nomor_surat', formData.nomor_surat);
    data.append('pengirim', formData.pengirim);
    data.append('perihal', formData.perihal);
    data.append('tanggal_surat', formData.tanggal_surat);
    data.append('tanggal_diterima', formData.tanggal_diterima);
    if (formData.keterangan) data.append('keterangan', formData.keterangan);
    if (formData.file_surat) data.append('file_surat', formData.file_surat);

    try {
      if (editId) {
        // Trik Laravel Multipart PUT
        data.append('_method', 'PUT');
        await axios.post(`http://127.0.0.1:8000/api/surat-masuk/${editId}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await axios.post('http://127.0.0.1:8000/api/surat-masuk', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      setIsModalOpen(false);
      resetForm();
      fetchSuratMasuk();
    } catch (error) {
      if (error.response && error.response.status === 422) {
        setFormErrors(error.response.data.errors);
      } else {
        alert('Terjadi kesalahan pada server.');
      }
    }
  };

  // 3. Delete Data
  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus surat masuk ini?')) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/surat-masuk/${id}`);
        fetchSuratMasuk();
      } catch (error) {
        alert('Gagal menghapus data surat masuk.');
      }
    }
  };

  // Filter Data
  const filteredSurat = suratList.filter(
    (item) =>
      item.nomor_surat.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.pengirim.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.perihal.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSurat.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSurat.length / itemsPerPage) || 1;

  return (
    <div className="space-y-6 p-4 md:p-6 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-200">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Kelola Surat Masuk</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Arsip dan tata kelola surat masuk instansi secara rapi dan terstruktur.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-md shadow-emerald-900/10 active:scale-95 shrink-0 cursor-pointer"
        >
          <Plus size={18} />
          <span>Tambah Surat Masuk</span>
        </button>
      </div>

      {/* Kontainer Tabel */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-xs overflow-hidden transition-colors">
        {/* Top bar pencarian */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
          <h2 className="text-base font-bold text-slate-800 dark:text-white">Daftar Arsip Surat</h2>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Cari no. surat, pengirim, perihal..."
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
        ) : filteredSurat.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="mx-auto text-slate-300 dark:text-slate-600 mb-2" size={48} />
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Belum ada dokumen surat masuk tersimpan.</p>
          </div>
        ) : (
          <>
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50/70 dark:bg-slate-800/40 text-slate-400 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                    <th className="py-4 px-6 w-16 text-center">NO</th>
                    <th className="py-4 px-6">NOMOR & PERIHAL SURAT</th>
                    <th className="py-4 px-6">PENGIRIM</th>
                    <th className="py-4 px-6">TANGGAL SURAT / TERIMA</th>
                    <th className="py-4 px-6">FILE LAMPIRAN</th>
                    <th className="py-4 px-6 text-center">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  {currentItems.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                      <td className="py-4 px-6 text-center text-slate-400 dark:text-slate-500 font-medium text-xs">
                        {indexOfFirstItem + index + 1}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-800 dark:text-slate-100">{item.nomor_surat}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{item.perihal}</div>
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-700 dark:text-slate-300">{item.pengirim}</td>
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-300">
                        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tgl: {item.tanggal_surat}</div>
                        <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Diterima: {item.tanggal_diterima}</div>
                      </td>
                      <td className="py-4 px-6 text-xs">
                        {item.file_surat ? (
                          <a
                            href={`${STORAGE_URL}/${item.file_surat}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 px-3 py-1.5 rounded-lg font-semibold border border-emerald-200 dark:border-emerald-800/60 transition"
                          >
                            <Paperclip size={13} />
                            <span>Lihat File</span>
                            <ExternalLink size={11} className="ml-0.5" />
                          </a>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500 italic">Tidak Ada File</span>
                        )}
                      </td>
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
                <span>Data dari total {filteredSurat.length} data</span>
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

      {/* Modal Form dengan Perbaikan Posisi Tengah, Jarak Atas-Bawah & Scroll */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl transition-colors my-auto">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-800 dark:text-white">
                {editId ? 'Ubah Data Surat Masuk' : 'Tambah Surat Masuk Baru'}
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
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Nomor Surat</label>
                <input
                  type="text"
                  name="nomor_surat"
                  value={formData.nomor_surat}
                  onChange={handleChange}
                  placeholder="Contoh: 005/DISDIK/2026"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
                  required
                />
                {formErrors.nomor_surat && <p className="text-red-500 text-xs mt-1">{formErrors.nomor_surat[0]}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Pengirim</label>
                  <input
                    type="text"
                    name="pengirim"
                    value={formData.pengirim}
                    onChange={handleChange}
                    placeholder="Contoh: Dinas Pendidikan"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
                    required
                  />
                  {formErrors.pengirim && <p className="text-red-500 text-xs mt-1">{formErrors.pengirim[0]}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Perihal</label>
                  <input
                    type="text"
                    name="perihal"
                    value={formData.perihal}
                    onChange={handleChange}
                    placeholder="Contoh: Undangan Rapat"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
                    required
                  />
                  {formErrors.perihal && <p className="text-red-500 text-xs mt-1">{formErrors.perihal[0]}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Tanggal Surat</label>
                  <input
                    type="date"
                    name="tanggal_surat"
                    value={formData.tanggal_surat}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
                    required
                  />
                  {formErrors.tanggal_surat && <p className="text-red-500 text-xs mt-1">{formErrors.tanggal_surat[0]}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Tanggal Diterima</label>
                  <input
                    type="date"
                    name="tanggal_diterima"
                    value={formData.tanggal_diterima}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
                    required
                  />
                  {formErrors.tanggal_diterima && <p className="text-red-500 text-xs mt-1">{formErrors.tanggal_diterima[0]}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Upload File Surat (PDF, JPG, PNG - Max 5MB)
                </label>
                <input
                  type="file"
                  name="file_surat"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleChange}
                  className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 dark:file:bg-emerald-950 dark:file:text-emerald-400 file:text-emerald-700 hover:file:bg-emerald-100 dark:hover:file:bg-emerald-900 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer bg-white dark:bg-slate-800"
                />
                {existingFileName && !formData.file_surat && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    File saat ini: <span className="font-semibold text-slate-600 dark:text-slate-300">{existingFileName.split('/').pop()}</span>
                  </p>
                )}
                {formErrors.file_surat && <p className="text-red-500 text-xs mt-1">{formErrors.file_surat[0]}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Keterangan (Opsional)</label>
                <textarea
                  name="keterangan"
                  rows="3"
                  value={formData.keterangan}
                  onChange={handleChange}
                  placeholder="Tambahkan catatan khusus bila ada..."
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
                  {editId ? 'Simpan Perubahan' : 'Tambah Surat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuratMasuk;