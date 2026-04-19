'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, Eye, EyeOff, Loader2, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import axios from 'axios';

const loginSchema = z.object({
  username: z.string().min(4, 'Username too short').max(30),
  password: z.string().min(8, 'Password too short'),
});

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AdminLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/management-portal-x1/login`, data);
      const token = res.data.token;

      // Store in both sessionStorage (for axios interceptor) and cookie (for middleware)
      sessionStorage.setItem('adminToken', token);
      // Set cookie with 8h expiry (matches JWT expiry)
      Cookies.set('AdminToken', token, { expires: 1 / 3, sameSite: 'strict' });

      toast.success('Welcome back!', { description: res.data.admin.username });
      router.push('/dashboard');
    } catch (err) {
      setAttempts((a) => a + 1);
      const msg = err.response?.data?.error || err.message || 'Login failed';
      toast.error('Authentication failed', { description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(220,25%,8%)] flex items-center justify-center px-4">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(hsl(22,92%,52%) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative w-full max-w-sm animate-slide-up">
        {/* Logo/Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl items-center justify-center mb-4">
            <ShieldAlert className="w-8 h-8 text-primary" strokeWidth={1.5} />
          </div>
          <h1 className="font-display text-3xl text-white">Restricted Access</h1>
          <p className="text-white/40 text-sm mt-1 font-mono">Management Console v1</p>
        </div>

        {/* Form */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-7 backdrop-blur-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-white/50 mb-2">
                Username
              </label>
              <input
                {...register('username')}
                autoComplete="username"
                className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:ring-2 transition-all ${
                  errors.username
                    ? 'border-red-500/50 focus:ring-red-500/20'
                    : 'border-white/10 focus:ring-primary/30 focus:border-primary/50'
                }`}
                placeholder="username"
              />
              {errors.username && (
                <p className="text-xs text-red-400 mt-1.5">{errors.username.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-white/50 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:ring-2 transition-all pr-11 ${
                    errors.password
                      ? 'border-red-500/50 focus:ring-red-500/20'
                      : 'border-white/10 focus:ring-primary/30 focus:border-primary/50'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-400 mt-1.5">{errors.password.message}</p>
              )}
            </div>

            {/* Lockout warning */}
            {attempts >= 3 && (
              <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl p-3 animate-fade-in">
                <Lock className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-400">
                  Warning: {5 - attempts} attempt{5 - attempts !== 1 ? 's' : ''} remaining before lockout.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Authenticating…</>
              ) : (
                <><Lock className="w-4 h-4" /> Sign In</>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-white/20 text-xs mt-6 font-mono">
          Unauthorized access attempts are logged.
        </p>
      </div>
    </div>
  );
}
