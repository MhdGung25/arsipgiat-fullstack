import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  Calendar, 
  Edit3, 
  X,
  UserCheck
} from 'lucide-react';

const DisposisiPegawai = () => {
  const [disposisiList, setDisposisiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [formData, setFormData] = useState({
    status: 'Pending',
    catatan: '',
  });

  const API_URL = 'http://127.0.0.1:8000/api';

  const fetchDisposisiSaya = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/pegawai/disposisi`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDisposisiList(response.data.data || []);
    } catch (error) {
      console.error('Gagal memuat data disposisi:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisposisiSaya();
  }, []);

  const handleOpenModal = (item) => {
    setSelectedItem(item);
    setFormData({
      status: item.status || 'Pending',
      catatan: item.catatan || '',
    });
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/pegawai/disposisi/${selectedItem.id}/status`, 
        formData, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsModalOpen(false);
      fetchDisposisiSaya();
    } catch (error) {
      alert('Gagal memperbarui status penugasan.');
    }
  };

  const filteredData = disposisiList.filter((item) => {
    const perihal = item.surat_masuk?.perihal || '';
    const nomorSurat = item.surat_masuk?.nomor_surat || '';
    const search = searchTerm.toLowerCase();

    return (
      perihal.toLowerCase().includes(search) ||
      nomorSurat.toLowerCase().includes(search) ||
      (item.catatan && item.catatan.toLowerCase().includes(search))
    );
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Selesai':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={13} /> Selesai
          </span>
        );
      case 'Proses':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock size={13} /> Dalam Proses
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertCircle size={13} /> Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6 bg-slate-50/50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tugas Disposisi Saya</h1>
          <p className="text-sm text-slate-500 mt-1">
            Daftar penugasan surat yang perlu ditindaklanjuti oleh Anda.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Cari perihal atau nomor surat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <UserCheck className="mx-auto mb-2 text-slate-300" size={48} />
            <p className="text-sm font-medium">Tidak ada tugas disposisi untuk Anda saat ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
            {filteredData.map((item) => (
              <div key={item.id} className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between hover:shadow-md transition">
                <div>
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-lg">
                      Sifat: {item.sifat}
                    </span>
                    {getStatusBadge(item.status)}
                  </div>

                  <h3 className="font-bold text-slate-800 text-sm mb-1">
                    {item.surat_masuk?.nomor_surat || 'Nomor Surat N/A'}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium mb-3 line-clamp-2">
                    {item.surat_masuk?.perihal || 'Tidak ada perihal'}
                  </p>

                  <div className="bg-white p-3 rounded-xl border border-slate-100 mb-4">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Instruksi Pimpinan:</p>
                    <p className="text-xs text-slate-700 italic">"{item.catatan || 'Segera tindak lanjuti.'}"</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center text-xs text-slate-400 gap-1 mb-4">
                    <Calendar size={13} />
                    <span>Tanggal: {item.tanggal_disposisi}</span>
                  </div>

                  <button
                    onClick={() => handleOpenModal(item)}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-xs font-semibold transition"
                  >
                    <Edit3 size={14} /> Update Progress Status
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Update Progress Pegawai */}
      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-800">Update Progress Penugasan</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Status Pengerjaan</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 bg-white"
                >
                  <option value="Pending">Pending (Belum Dikerjakan)</option>
                  <option value="Proses">Proses (Sedang Dikerjakan)</option>
                  <option value="Selesai">Selesai (Sudah Ditindaklanjuti)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Catatan Progress / Balasan</label>
                <textarea
                  rows="3"
                  value={formData.catatan}
                  onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                  placeholder="Tambahkan penjelasan atau tindak lanjut yang telah dilakukan..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 resize-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700"
                >
                  Simpan Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisposisiPegawai;