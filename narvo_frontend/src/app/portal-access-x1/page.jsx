'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, Eye, EyeOff, Loader2, ShieldAlert, Fingerprint } from 'lucide-react';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import axios from 'axios';

const loginSchema = z.object({
  username: z.string().min(4, 'اسم المستخدم قصير جداً').max(30),
  password: z.string().min(8, 'كلمة المرور قصيرة جداً'),
});

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AdminLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [ipSuffix, setIpSuffix] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    setIpSuffix(Math.floor(Math.random() * 255));
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/management-portal-x1/login`, data);
      const token = res.data.token;

      sessionStorage.setItem('adminToken', token);
      Cookies.set('AdminToken', token, { expires: 1 / 3, sameSite: 'strict' });

      toast.success('مرحباً بك مجدداً!', { description: res.data.admin.username });
      router.push('/dashboard');
    } catch (err) {
      setAttempts((a) => a + 1);
      const msg = err.response?.data?.error || err.message || 'فشل تسجيل الدخول';
      toast.error('خطأ في المصادقة', { description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06080a] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 opacity-10" 
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #f97316 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }} 
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative w-full max-w-sm z-10 animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-10">
          <div className="inline-flex relative mb-6">
            <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full animate-pulse" />
            <div className="relative w-16 h-16 bg-zinc-900/80 border border-orange-500/30 rounded-2xl flex items-center justify-center shadow-2xl">
              <ShieldAlert className="w-8 h-8 text-orange-500" strokeWidth={1.5} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Admin Panal </h1>
          <p className="text-zinc-500 text-xs mt-2 font-mono uppercase tracking-[0.3em]">
            Login To Admin Panal 
          </p>
        </div>

        <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-8 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">
                Admin Name
              </label>
              <div className="relative group">
                <input
                  {...register('username')}
                  autoComplete="username"
                  className={`w-full px-4 py-3.5 bg-black/20 border rounded-xl text-white text-sm placeholder:text-zinc-700 focus:outline-none focus:ring-2 transition-all duration-300 ${
                    errors.username
                      ? 'border-red-500/50 focus:ring-red-500/10'
                      : 'border-white/10 focus:ring-orange-500/20 focus:border-orange-500/40'
                  }`}
                  placeholder="Username"
                />
              </div>
              {errors.username && (
                <p className="text-[10px] text-red-400 font-medium ml-1">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">
                Password
              </label>
              <div className="relative group">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={`w-full px-4 py-3.5 bg-black/20 border rounded-xl text-white text-sm placeholder:text-zinc-700 focus:outline-none focus:ring-2 transition-all duration-300 pr-12 ${
                    errors.password
                      ? 'border-red-500/50 focus:ring-red-500/10'
                      : 'border-white/10 focus:ring-orange-500/20 focus:border-orange-500/40'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[10px] text-red-400 font-medium ml-1">{errors.password.message}</p>
              )}
            </div>

            {attempts >= 3 && (
              <div className="flex items-center gap-3 bg-red-500/5 border border-red-500/20 rounded-xl p-3 animate-in fade-in slide-in-from-top-2">
                <Lock className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-[11px] text-red-200/80 leading-snug">
                  Security Alert: <span className="font-bold text-red-500">{5 - attempts}</span> attempts remaining.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full relative group overflow-hidden bg-orange-600 hover:bg-orange-500 text-white rounded-xl py-4 font-bold text-sm transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(234,88,12,0.2)]"
            >
              <div className="flex items-center justify-center gap-2">
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    
                    <span>Login</span>
                  </>
                )}
              </div>
            </button>
          </form>
        </div>

        <div className="mt-8 text-center space-y-2">
          <p className="text-zinc-600 text-[10px] font-mono tracking-wider uppercase">
            ممنوع الدخول 
          </p>
          <p className="text-zinc-800 text-[9px] font-mono">
            
          </p>
        </div>
      </div>
    </div>
  );
}