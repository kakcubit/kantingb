/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { UserRole, Penitip, Transaksi, AppSettings, UserAccount } from './types';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import KasirPanel from './components/KasirPanel';
import AdminPanel from './components/AdminPanel';
import LoginScreen from './components/LoginScreen';
import { api } from './lib/api';
import { LayoutDashboard, ShoppingBag, Shield, HelpCircle, RefreshCcw, LogOut, Utensils, Coins, BookOpen, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Main database state loaded from backend API
  const [penitip, setPenitip] = useState<Penitip[]>([]);
  const [transaksi, setTransaksi] = useState<Transaksi[]>([]);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ persenPotongan: 10 });

  useEffect(() => {
    if (settings?.temaWarna) {
      document.body.className = 'theme-' + settings.temaWarna;
    } else {
      document.body.className = '';
    }
  }, [settings?.temaWarna]);

  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean, message: string, onConfirm: () => void}>({isOpen: false, message: '', onConfirm: () => {}});

  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

  // Active Tab state
  const [activeTab, setActiveTab] = useState<string>('kasir');
  // Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(window.innerWidth >= 768);

  // Auto hide sidebar on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNavClick = (tab: string) => {
    setActiveTab(tab);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  // Load user from sessionStorage on mount
  useEffect(() => {
    const savedUser = sessionStorage.getItem('kantin_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setCurrentUser(parsed);
        // Set default active tab based on role
        if (parsed.role === 'kasir') {
          setActiveTab('kasir');
        } else {
          setActiveTab('dashboard');
        }
      } catch (e) {
        sessionStorage.removeItem('kantin_user');
      }
    }
  }, []);

  // Fetch online data from backend
  const fetchState = async () => {
    try {
      const data = await api.getState();
      setPenitip(data.penitip || []);
      setTransaksi(data.transaksi || []);
      setUsers(data.users || []);
      setSettings(data.settings || { persenPotongan: 10 });
    } catch (err) {
      console.error('Gagal mengambil data dari server database online:', err);
    }
  };

  // Trigger state fetch when logged in
  useEffect(() => {
    fetchState();
  }, [currentUser]);

  // Handle Login success
  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    sessionStorage.setItem('kantin_user', JSON.stringify(user));
    if (user.role === 'kasir') {
      setActiveTab('kasir');
    } else {
      setActiveTab('dashboard');
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setConfirmDialog({
      isOpen: true,
      message: 'Apakah Anda yakin ingin keluar dari aplikasi?',
      onConfirm: () => {
        setCurrentUser(null);
        sessionStorage.removeItem('kantin_user');
      }
    });
  };

  // State Mutators: Transactions
  const handleAddTransaction = async (newTx: Omit<Transaksi, 'id'>) => {
    try {
      await api.addTransaction(newTx);
      await fetchState();
    } catch (e) {
      console.error(e);
      alert('Terjadi kesalahan koneksi saat membukukan transaksi.');
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await api.deleteTransaction(id);
      await fetchState();
    } catch (e) {
      console.error(e);
      alert('Gagal menghapus catatan transaksi.');
    }
  };

  // State Mutators: Penitip (Consignor)
  const handleAddPenitip = async (newP: Omit<Penitip, 'id'>) => {
    try {
      await api.savePenitip(newP);
      await fetchState();
    } catch (e) {
      console.error(e);
      alert('Gagal mendaftarkan penitip.');
    }
  };

  const handleEditPenitip = async (updatedP: Penitip) => {
    try {
      await api.savePenitip(updatedP);
      await fetchState();
    } catch (e) {
      console.error(e);
      alert('Gagal mengedit data penitip.');
    }
  };

  const handleDeletePenitip = async (id: string) => {
    try {
      await api.deletePenitip(id);
      await fetchState();
    } catch (e) {
      console.error(e);
      alert('Gagal menghapus penitip.');
    }
  };

  // State Mutators: Settings & Accounts
  const handleSaveUser = async (u: UserAccount) => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(u),
      });
      if (res.ok) {
        await fetchState();
      } else {
        alert('Gagal mengelola akun.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await fetchState();
      } else {
        alert('Gagal menghapus akun.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveSettings = async (s: AppSettings) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(s),
      });
      if (res.ok) {
        await fetchState();
        alert('Persentase potongan berhasil disimpan & disinkronkan ke seluruh server.');
      } else {
        alert('Gagal menyimpan pengaturan.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // State Mutators: Backup Restoration
  const handleImportBackup = async (backup: {
    penitip: Penitip[];
    t_data: Transaksi[];
  }) => {
    try {
      const res = await fetch('/api/import-backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backup),
      });
      if (res.ok) {
        await fetchState();
        alert('Database online berhasil dipulihkan dari file backup!');
      } else {
        alert('Gagal mengimpor file backup ke server.');
      }
    } catch (e) {
      console.error(e);
      alert('Kesalahan jaringan saat memulihkan database.');
    }
  };

  // Direct settlement payout trigger from Dashboard
  const handlePayPenitipDirect = async (
    penitipId: string,
    amount: number,
    keterangan: string
  ) => {
    await handleAddTransaction({
      tipe: 'keluar',
      kategori: 'pembayaran_penitip',
      jumlah: amount,
      tanggal: `${new Date().toISOString().split('T')[0]} ${new Date().toTimeString().slice(0, 5)}`,
      keterangan: keterangan,
      penitipId,
    });
    alert(`Pembayaran lunas sebesar Rp${amount.toLocaleString('id-ID')} telah berhasil disinkronkan ke cloud!`);
  };

  // Live financial math for header indicator syncing
  const liveStats = useMemo(() => {
    let masuk = 0;
    let keluar = 0;

    transaksi.forEach((t) => {
      if (t.tipe === 'masuk') {
        masuk += t.jumlah;
      } else {
        keluar += t.jumlah;
      }
    });

    const saldoKas = masuk - keluar;

    let totalOwedValue = 0;
    let totalCanteenMargin = 0;

    // Calculate total hutang and margin from transactions
    transaksi.forEach((t) => {
      if (t.kategori === 'penjualan_konsinyasi' && t.penitipId) {
        totalOwedValue += (t.jumlah - (t.marginKantin || 0));
        totalCanteenMargin += (t.marginKantin || 0);
      }
    });

    const totalPaidToPenitip = transaksi
      .filter((t) => t.kategori === 'pembayaran_penitip')
      .reduce((sum, t) => sum + t.jumlah, 0);

    const sisaHutang = Math.max(0, totalOwedValue - totalPaidToPenitip);

    return {
      totalKas: saldoKas,
      totalHutang: sisaHutang,
      totalMargin: totalCanteenMargin,
    };
  }, [transaksi]);

  // If user is not authenticated, show Login Screen
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} settings={settings} />;
  }

  const userRole = currentUser.role;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      
      {/* Top Header Panel */}
      <Header settings={settings}
        currentRole={userRole}
        onChangeRole={() => {}} // Disabled switching roles in the header (must log in to switch)
        totalKas={liveStats.totalKas}
        totalHutang={liveStats.totalHutang}
        totalMargin={liveStats.totalMargin}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          
          {/* Side navigation bar */}
          <AnimatePresence initial={false}>
            {isSidebarOpen && (
              <motion.div 
                initial={{ opacity: 0, width: 0, scale: 0.95 }}
                animate={{ opacity: 1, width: "auto", scale: 1 }}
                exit={{ opacity: 0, width: 0, scale: 0.95, overflow: "hidden" }}
                transition={{ duration: 0.2 }}
                className="shrink-0 origin-left overflow-hidden"
              >
                <div id="side-nav" className="w-full md:w-60 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm space-y-1">
                  
                  <p className="text-[10px] uppercase font-bold text-slate-400 px-3 py-1 tracking-wider">Navigasi Utama</p>

            {userRole === 'kasir' ? (
              <>
                <button
                  id="nav-btn-kasir"
                  type="button"
                  onClick={() => handleNavClick('kasir')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
                    activeTab === 'kasir'
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-100'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <ShoppingBag className="h-4 w-4" />
                  Input Penjualan & Belanja
                </button>
                <button
                  id="nav-btn-kasir-payout"
                  type="button"
                  onClick={() => handleNavClick('kasir_payout')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
                    activeTab === 'kasir_payout'
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-100'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Coins className="h-4 w-4" />
                  Pembayaran Penitip
                </button>
                <button
                  id="nav-btn-kasir-kas"
                  type="button"
                  onClick={() => handleNavClick('kasir_kas')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
                    activeTab === 'kasir_kas'
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-100'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <BookOpen className="h-4 w-4" />
                  Buku Arus Kas
                </button>
              </>
            ) : (
              <>
                <button
                  id="nav-btn-dashboard"
                  type="button"
                  onClick={() => handleNavClick('dashboard')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
                    activeTab === 'dashboard'
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard Ringkasan
                </button>
                <button
                  id="nav-btn-admin"
                  type="button"
                  onClick={() => handleNavClick('admin')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
                    activeTab === 'admin'
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Shield className="h-4 w-4" />
                  Menu Administrasi
                </button>
              </>
            )}

            <div className="pt-4 border-t border-slate-100 mt-4 px-3 space-y-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Pengguna Aktif</span>
                <p className="text-[11px] font-extrabold text-slate-700 truncate mt-0.5" title={currentUser.namaLengkap}>
                  {currentUser.namaLengkap}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`h-2 w-2 rounded-full ${userRole === 'admin' ? 'bg-indigo-500 animate-pulse' : 'bg-emerald-500 animate-pulse'}`}></span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{userRole}</span>
                </div>
              </div>
            </div>

            {userRole === 'admin' && (
              <div className="pt-2 px-3">
                <button
                  id="btn-reset-demo"
                  type="button"
                  onClick={() => {
                    setConfirmDialog({
                      isOpen: true,
                      message: 'Apakah Anda ingin mereset seluruh data kembali ke kondisi demo awal di database online? Seluruh perubahan saat ini akan hilang.',
                      onConfirm: async () => {
                        try {
                          await api.resetDemo();
                            window.location.reload();
                        } catch (e) {
                          console.error('Gagal terhubung ke server database.');
                        }
                      }
                    });
                  }}
                  className="text-[10px] text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1 mt-2 font-medium cursor-pointer"
                >
                  <RefreshCcw className="h-3 w-3" />
                  Reset Data Demo
                </button>
              </div>
            )}

                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Core Content Area */}
          <div className="flex-1 w-full min-w-0">
            <AnimatePresence mode="wait">
              
              {/* Active Tab rendering */}
              {activeTab === 'dashboard' && userRole === 'admin' && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                >
                  <Dashboard settings={settings}
                    penitip={penitip}
                    transaksi={transaksi}
                    onNavigateToTab={(subtab) => {
                      setActiveTab('admin');
                      setTimeout(() => {
                        const targetBtn = document.getElementById(`btn-subtab-${subtab}`);
                        if (targetBtn) targetBtn.click();
                      }, 50);
                    }}
                    onPayPenitipDirect={handlePayPenitipDirect}
                  />
                </motion.div>
              )}

              {activeTab === 'kasir' && userRole === 'kasir' && (
                <motion.div
                  key="kasir"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                >
                  <KasirPanel
                    penitip={penitip}
                    settings={settings}
                    transaksi={transaksi}
                    onAddTransaction={handleAddTransaction}
                  />
                </motion.div>
              )}

              {/* Cashier restricted subtabs mapped to modified AdminPanel */}
              {userRole === 'kasir' && activeTab.startsWith('kasir_') && (
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                >
                  <AdminPanel
                    penitip={penitip}
                    transaksi={transaksi}
                    users={users}
                    settings={settings}
                    userRole="kasir"
                    initialTab={
                      activeTab === 'kasir_payout' ? 'payout' : 'kas'
                    }
                    onAddPenitip={handleAddPenitip}
                    onEditPenitip={handleEditPenitip}
                    onDeletePenitip={handleDeletePenitip}
                    onAddTransaction={handleAddTransaction}
                    onDeleteTransaction={handleDeleteTransaction}
                    onImportBackup={handleImportBackup}
                    onSaveUser={handleSaveUser}
                    onDeleteUser={handleDeleteUser}
                    onSaveSettings={handleSaveSettings}
                  />
                </motion.div>
              )}

              {activeTab === 'admin' && userRole === 'admin' && (
                <motion.div
                  key="admin"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                >
                  <AdminPanel
                    penitip={penitip}
                    transaksi={transaksi}
                    users={users}
                    settings={settings}
                    userRole="admin"
                    initialTab="payout"
                    onAddPenitip={handleAddPenitip}
                    onEditPenitip={handleEditPenitip}
                    onDeletePenitip={handleDeletePenitip}
                    onAddTransaction={handleAddTransaction}
                    onDeleteTransaction={handleDeleteTransaction}
                    onImportBackup={handleImportBackup}
                    onSaveUser={handleSaveUser}
                    onDeleteUser={handleDeleteUser}
                    onSaveSettings={handleSaveSettings}
                  />
                </motion.div>
              )}

            </AnimatePresence>
          </div>

        </div>
      </main>

      {/* Footer copyright */}
      <footer className="bg-white border-t border-slate-100 py-4 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Kantin Amanah SDN Gapura Barat I. Dirancang khusus untuk pengelolaan keuangan kantin sekolah aman, transparan & akuntabel.</p>
        </div>
      </footer>

      {/* Custom Confirm Dialog Modal */}
      <AnimatePresence>
        {confirmDialog.isOpen && (
          <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 space-y-4"
            >
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center shrink-0">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm mb-1">Konfirmasi Tindakan</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {confirmDialog.message}
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    confirmDialog.onConfirm();
                    setConfirmDialog({ ...confirmDialog, isOpen: false });
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-sm cursor-pointer"
                >
                  Ya, Lanjutkan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
