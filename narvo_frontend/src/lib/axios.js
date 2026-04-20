import axios from 'axios';
import { getSession } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ─── Public API (User JWT attached via NextAuth session) ──────────────────────
export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
  withCredentials: true,
});

// ✅ تعديل: جلب التوكن من sessionStorage أو من جلسة NextAuth مباشرة
api.interceptors.request.use(async (config) => {
  if (typeof window !== 'undefined') {
    // 1. البحث في sessionStorage أولاً
    let token = sessionStorage.getItem('userToken');

    // 2. إذا لم يكن موجوداً، نجلبه من جلسة NextAuth
    if (!token) {
      const session = await getSession();
      // يتم سحب التوكن حسب المسمى الذي حفظته به في إعدادات NextAuth
      token = session?.accessToken || session?.user?.token || session?.token;
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// ─── Admin API (Admin JWT from cookie / sessionStorage) ───────────────────────
export const adminApi = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
  withCredentials: true,
});

adminApi.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token =
      sessionStorage.getItem('adminToken') ||
      document.cookie
        .split('; ')
        .find((row) => row.startsWith('AdminToken='))
        ?.split('=')[1];

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // Redirect to home on 401 (expired admin token)
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      sessionStorage.removeItem('adminToken');
      window.location.href = '/';
    }
    const message =
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export default api;
