/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserRole } from '../types';
import { Shield, ShoppingBag, Clock, Coins, Wallet, Landmark, Menu, LogOut } from 'lucide-react';
import { formatRupiah } from '../utils/helpers';

interface HeaderProps {
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  totalKas: number;
  totalHutang: number;
  totalMargin: number;
  onToggleSidebar?: () => void;
  onLogout?: () => void;
}

export default function Header({
  currentRole,
  onChangeRole,
  totalKas,
  totalHutang,
  totalMargin,
  onToggleSidebar,
  onLogout,
}: HeaderProps) {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatTime = now.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      const formatDate = now.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      setCurrentTime(`${formatDate} | ${formatTime} WIB`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header
      id="app-header"
      className="bg-white border-b border-slate-100 sticky top-0 z-40 backdrop-blur-md bg-white/95"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 gap-4">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            {onToggleSidebar && (
              <button 
                onClick={onToggleSidebar}
                className="p-2 -ml-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Toggle Sidebar"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}
            <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-200">
              <Coins className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold font-display text-slate-800 tracking-tight">
                  Kantin Amanah
                </h1>
                <span className="bg-emerald-50 text-emerald-700 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Gapura Batu
                </span>
              </div>
              <p className="text-xs text-slate-400">Pencatatan Arus Kas & Konsinyasi Titipan</p>
            </div>
          </div>

          {/* Quick Header Stats for immediate visual context */}
          <div className="hidden lg:flex items-center gap-6 text-xs">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
              <Wallet className="h-4 w-4 text-emerald-600" />
              <div>
                <p className="text-slate-400 text-[10px] font-medium uppercase tracking-wider">Saldo Kas</p>
                <p className="font-semibold text-slate-700 font-mono">{formatRupiah(totalKas)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
              <Landmark className="h-4 w-4 text-rose-500" />
              <div>
                <p className="text-slate-400 text-[10px] font-medium uppercase tracking-wider">Hutang Penitip</p>
                <p className="font-semibold text-slate-700 font-mono">{formatRupiah(totalHutang)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
              <Coins className="h-4 w-4 text-amber-500" />
              <div>
                <p className="text-slate-400 text-[10px] font-medium uppercase tracking-wider">Margin Kantin</p>
                <p className="font-semibold text-slate-700 font-mono">{formatRupiah(totalMargin)}</p>
              </div>
            </div>
          </div>

          {/* Right Controls: Date/Time and Role Switcher */}
          <div className="flex flex-wrap items-center gap-4 sm:justify-between md:justify-end">
            
            {/* Live Clock */}
            <div className="flex items-center gap-2 text-slate-500 text-xs py-1 px-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span className="font-medium font-mono">{currentTime || 'Memuat waktu...'}</span>
            </div>

            {/* Role Switcher Button Group */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center shadow-inner border border-slate-200">
              <button
                id="role-btn-kasir"
                type="button"
                onClick={() => onChangeRole('kasir')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  currentRole === 'kasir'
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <ShoppingBag className={`h-3.5 w-3.5 ${currentRole === 'kasir' ? 'text-emerald-600' : ''}`} />
                Kasir
              </button>
              <button
                id="role-btn-admin"
                type="button"
                onClick={() => onChangeRole('admin')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  currentRole === 'admin'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Shield className={`h-3.5 w-3.5 ${currentRole === 'admin' ? 'text-slate-700' : ''}`} />
                Admin (Pengelola)
              </button>
            </div>

            {/* Logout Button */}
            {onLogout && (
              <button
                onClick={onLogout}
                className="p-2 ml-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                title="Keluar Aplikasi"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
