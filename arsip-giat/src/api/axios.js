import axios from 'axios';

const api = axios.create({
  // Gunakan URL domain production kamu
  baseURL: 'https://api.arsipgiatrancaekek.com/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Tambahkan interceptor untuk otomatis menyisipkan token di setiap request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;