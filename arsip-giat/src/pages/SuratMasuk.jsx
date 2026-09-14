import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  FileText, 
  Paperclip, 
  Edit3, 
  Trash2, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink,
  Upload,
  Loader2,
  Eye,
  Download
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

const SuratMasuk = () => {
  const [suratList, setSuratList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  // State untuk Modal Preview File
  const [previewFile, setPreviewFile] = useState(null);

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
    file_url: '',
  });

  const [selectedFile, setSelectedFile] = useState(null);

  // 1. Fetch Data Surat Masuk dari Firestore
  const fetchSuratMasuk = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'surat_masuk'));
      const suratData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSuratList(suratData);
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
      file_url: '',
    });
    setSelectedFile(null);
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
        file_url: item.file_url || '',
      });
      setSelectedFile(null);
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Konversi file lokal menjadi Base64 string dengan kompresi aman
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      // Batasi ukuran file maksimal 1.5 MB agar tidak melebihi kapasitas dokumen Firestore (1MB limit per doc)
      if (file.size > 1.5 * 1024 * 1024) {
        alert('Ukuran file terlalu besar! Maksimal 1.5 MB agar aman disimpan ke database.');
        e.target.value = null;
        return;
      }
      setSelectedFile(file);
    }
  };

  // 2. Submit Form (Simpan ke Firestore dengan Proteksi Error Terpisah)
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setUploading(true);
      let fileUrl = formData.file_url;

      if (selectedFile) {
        fileUrl = await convertFileToBase64(selectedFile);
      }

      const payload = {
        nomor_surat: formData.nomor_surat || '',
        pengirim: formData.pengirim || '',
        perihal: formData.perihal || '',
        tanggal_surat: formData.tanggal_surat || '',
        tanggal_diterima: formData.tanggal_diterima || '',
        keterangan: formData.keterangan || '',
        file_url: fileUrl || '',
      };

      if (editId) {
        const docRef = doc(db, 'surat_masuk', editId);
        await updateDoc(docRef, payload);
      } else {
        await addDoc(collection(db, 'surat_masuk'), payload);
      }

      // Kirim notifikasi secara independen (jika gagal, tidak akan menggagalkan penyimpanan surat)
      try {
        await addDoc(collection(db, 'notifikasi'), {
          title: editId ? 'Surat Masuk Diperbarui' : 'Surat Masuk Baru',
          message: `Surat nomor ${formData.nomor_surat} dari ${formData.pengirim} telah ${editId ? 'diperbarui' : 'ditambahkan'}.`,
          is_read: false,
          created_at: new Date().toISOString()
        });
      } catch (notifErr) {
        console.warn('Gagal mengirim log notifikasi, tetapi surat utama berhasil disimpan:', notifErr);
      }

      setIsModalOpen(false);
      resetForm();
      fetchSuratMasuk();
    } catch (error) {
      console.error('Gagal menyimpan data surat masuk:', error);
      alert('Terjadi kesalahan saat menyimpan data ke database. Pastikan koneksi stabil dan ukuran file tidak melebihi batas.');
    } finally {
      setUploading(false);
    }
  };

  // 3. Delete Data dari Firestore
  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus surat masuk ini?')) {
      try {
        await deleteDoc(doc(db, 'surat_masuk', id));
        fetchSuratMasuk();
      } catch (error) {
        console.error('Gagal menghapus data:', error);
        alert('Gagal menghapus data surat masuk.');
      }
    }
  };

  // Filter Data
  const filteredSurat = suratList.filter(
    (item) =>
      (item.nomor_surat || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.pengirim || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.perihal || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSurat.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSurat.length / itemsPerPage) || 1;

  return (
    <div className="space-y-6 p-4 md:p-6 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Kelola Surat Masuk</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Arsip dan tata kelola surat masuk instansi secara rapi dan terstruktur dengan lampiran dokumen.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-md shadow-emerald-900/10 active:scale-95 shrink-0 cursor-pointer"
        >
          <Plus size={18} />
          <span>Tambah Surat Masuk</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-xs overflow-hidden transition-colors">
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
                    <th className="py-4 px-6">LAMPIRAN FILE</th>
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
                        {item.file_url ? (
                          <button
                            onClick={() => setPreviewFile(item)}
                            className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 px-3 py-1.5 rounded-lg font-semibold border border-emerald-200 dark:border-emerald-800/60 transition cursor-pointer"
                          >
                            <Eye size={14} />
                            <span>Lihat Berkas</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500 italic">Tidak Ada File</span>
                        )}
                      </td>
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
                  ))}
                </tbody>
              </table>
            </div>

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
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="font-bold text-slate-700 dark:text-slate-300 px-2">{currentPage} / {totalPages}</span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal Preview File */}
      {previewFile && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Pratinjau Berkas Surat</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">No: {previewFile.nomor_surat} - {previewFile.perihal}</p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewFile.file_url}
                  download={`Surat_${previewFile.nomor_surat || 'Arsip'}`}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition"
                >
                  <Download size={14} />
                  <span>Download</span>
                </a>
                <button 
                  onClick={() => setPreviewFile(null)} 
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-slate-100 dark:bg-slate-950 p-4 flex items-center justify-center overflow-auto">
              {previewFile.file_url.startsWith('data:image/') ? (
                <img 
                  src={previewFile.file_url} 
                  alt="Pratinjau Surat" 
                  className="max-h-full max-w-full object-contain rounded-lg shadow-md"
                />
              ) : (
                <iframe
                  src={previewFile.file_url}
                  title="Pratinjau PDF"
                  className="w-full h-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white"
                ></iframe>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Form Tambah/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl transition-colors my-auto">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-800 dark:text-white">
                {editId ? 'Ubah Data Surat Masuk' : 'Tambah Surat Masuk Baru'}
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
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Upload Berkas (PDF, JPG, PNG - Maks 1.5MB)
                </label>
                <div className="flex items-center gap-2">
                  <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold cursor-pointer transition">
                    <Upload size={16} />
                    <span>{selectedFile ? selectedFile.name : (formData.file_url ? 'Ganti File Lampiran' : 'Pilih File Dokumen')}</span>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
                {formData.file_url && !selectedFile && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
                    * Berkas saat ini sudah terlampir. Biarkan kosong jika tidak ingin mengubah.
                  </p>
                )}
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
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                >
                  {uploading && <Loader2 size={14} className="animate-spin" />}
                  <span>{uploading ? 'Menyimpan...' : (editId ? 'Simpan Perubahan' : 'Tambah Surat')}</span>
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