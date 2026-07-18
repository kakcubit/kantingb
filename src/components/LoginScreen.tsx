/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { api } from '../lib/api';
import { AppSettings } from '../types';
import { Shield, ShoppingBag, Coins, Key, User, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginScreenProps {
  settings?: AppSettings;
  onLoginSuccess: (user: { id: string; username: string; role: 'admin' | 'kasir'; namaLengkap: string }) => void;
}

export default function LoginScreen({ onLoginSuccess, settings }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Username dan Password wajib diisi.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const result = await api.login(username, password);
      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setError(result.message || 'Username atau password salah!');
      }
    } catch (err) {
      setError('Tidak dapat terhubung ke server database. Pastikan koneksi internet aktif.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-800 relative overflow-hidden">
      {/* Decorative background gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-emerald-100 blur-3xl opacity-60"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-indigo-100 blur-3xl opacity-60"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-xl p-8 relative z-10 space-y-6"
      >
        {/* Header Logo */}
        <div className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-200">
            {settings?.logoUrl ? <img src={settings.logoUrl} alt="Logo" className="h-12 w-12 rounded-2xl object-cover" /> : <Coins className="h-6 w-6 animate-soft-pulse" />}
          </div>
          <div>
            <h2 className="text-2xl font-bold font-display text-slate-800 tracking-tight">
              {settings?.namaKantin || 'Kantin Amanah'}</h2>
            <p className="text-xs text-slate-400 mt-0.5">Sistem Keuangan & Konsinyasi {settings?.namaSekolah || 'SDN Gapura Barat I'}</p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs flex items-start gap-2.5"
          >
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-500" />
            <span className="font-semibold leading-relaxed">{error}</span>
          </motion.div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Username</label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-slate-400">
                <User className="h-4 w-4" />
              </span>
              <input
                id="login-username"
                type="text"
                required
                disabled={loading}
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Password</label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-slate-400">
                <Key className="h-4 w-4" />
              </span>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                disabled={loading}
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            id="btn-login"
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:scale-100"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                Memverifikasi...
              </span>
            ) : (
              'Masuk ke Sistem'
            )}
          </button>
        </form>

      </motion.div>
    </div>
  );
}
