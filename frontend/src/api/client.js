import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
});

// แนบ JWT จาก localStorage
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// ถ้า 401 ให้เด้งไปหน้า login
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err?.response?.status === 401) {
            localStorage.removeItem('token');
            if (!location.pathname.startsWith('/admin/login')) {
                window.location.href = '/admin/login';
            }
        }
        return Promise.reject(err);
    }
);

export default api;
