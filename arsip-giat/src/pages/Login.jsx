import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Eye, EyeOff, Loader2 } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import logo from "../assets/logo-rancaekek.png";

const Login = () => {
  const navigate = useNavigate();
  
  // State form & UI
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Proses autentikasi murni menggunakan Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Simpan sesi user ke localStorage
      localStorage.setItem('user', JSON.stringify({
        uid: user.uid,
        email: user.email,
        name: 'Linda Agustina.A.Md',
        jabatan: 'ARSIPARIS TERAMPIL',
        role: 'admin'
      }));

      // Redirect ke halaman utama/dashboard setelah berhasil login
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Gagal login:', err);
      // Tangani pesan error Firebase yang umum
      switch (err.code) {
        case 'auth/invalid-email':
          setError('Format email tidak valid.');
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setError('Email atau password salah.');
          break;
        case 'auth/too-many-requests':
          setError('Terlalu banyak percobaan gagal. Silakan coba lagi nanti.');
          break;
        default:
          setError('Gagal masuk ke sistem. Pastikan akun sudah terdaftar di Firebase Auth.');
          break;
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 overflow-y-auto transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl dark:shadow-slate-950/50 border border-gray-100 dark:border-slate-800 p-6 sm:p-8 overflow-hidden relative transition-colors duration-300 my-auto">
        
        {/* Dekorasi Background */}
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-emerald-50 dark:bg-emerald-950/30 rounded-full opacity-50 pointer-events-none"></div>
        <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-emerald-50 dark:bg-emerald-950/30 rounded-full opacity-50 pointer-events-none"></div>

        <div className="relative z-10">
          {/* Logo & Judul */}
          <div className="text-center mb-8">
            <img 
              src={logo} 
              alt="Logo Rancaekek" 
              className="w-20 h-20 object-contain mx-auto rounded-full bg-white dark:bg-slate-800 p-1 border border-gray-100 dark:border-slate-700 shadow-sm mb-3" 
            />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              ARSIP<span className="text-emerald-600 dark:text-emerald-400">GIAT</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Sistem Informasi Agenda & Surat Kecamatan Rancaekek
            </p>
          </div>

          {/* Pesan Error */}
          {error && (
            <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-sm p-3 rounded-xl mb-5 font-medium text-center">
              {error}
            </div>
          )}

          {/* Form Login */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Input Email */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 pl-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Mail size={18} />
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@rancaekek.com"
                  required
                  disabled={loading}
                  className="w-full pl-11 pr-4 py-2.5 sm:py-3 bg-white dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700/80 rounded-xl focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-950 focus:border-emerald-500 dark:focus:border-emerald-500 transition outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 disabled:bg-slate-100 dark:disabled:bg-slate-800 text-sm"
                />
              </div>
            </div>

            {/* Input Password */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 pl-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Lock size={18} />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="w-full pl-11 pr-12 py-2.5 sm:py-3 bg-white dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700/80 rounded-xl focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-950 focus:border-emerald-500 dark:focus:border-emerald-500 transition outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 disabled:bg-slate-100 dark:disabled:bg-slate-800 text-sm"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Tombol Masuk */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 bg-emerald-600 dark:bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors shadow-md shadow-emerald-200 dark:shadow-none active:scale-[0.98] mt-3 disabled:bg-emerald-400 dark:disabled:bg-emerald-800 cursor-pointer text-sm"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Masuk ke Akun
                </>
              )}
            </button>
          </form>
          
          <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-8">
            &copy; 2026 Kecamatan Rancaekek. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;