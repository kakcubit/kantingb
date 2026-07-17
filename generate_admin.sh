#!/bin/bash
cat << 'INNER_EOF' > src/components/AdminPanel.tsx
import React, { useState, useMemo } from 'react';
import { Penitip, Transaksi, AppSettings, UserAccount } from '../types';
import {
  Users, Download, Upload, Plus, Trash2, Edit2, ArrowUpRight, ArrowDownLeft, Settings, AlertCircle, Check
} from 'lucide-react';
import { formatRupiah } from '../utils/helpers';

interface AdminPanelProps {
  penitip: Penitip[];
  transaksi: Transaksi[];
  users: UserAccount[];
  settings: AppSettings;
  userRole?: 'admin' | 'kasir';
  initialTab?: 'payout' | 'penitip' | 'kas' | 'backup' | 'settings';
  onAddPenitip: (p: Omit<Penitip, 'id'>) => void;
  onEditPenitip: (p: Penitip) => void;
  onDeletePenitip: (id: string) => void;
  onAddTransaction: (t: Omit<Transaksi, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
  onImportBackup: (backup: { penitip: Penitip[]; t_data: Transaksi[] }) => void;
  onSaveUser: (u: UserAccount) => void;
  onDeleteUser: (id: string) => void;
  onSaveSettings: (s: AppSettings) => void;
}

export default function AdminPanel({
  penitip, transaksi, users, settings, userRole = 'admin', initialTab = 'payout',
  onAddPenitip, onEditPenitip, onDeletePenitip, onAddTransaction, onDeleteTransaction,
  onImportBackup, onSaveUser, onDeleteUser, onSaveSettings
}: AdminPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState(initialTab);

  // Modals / Confirmations
  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean; message: string; onConfirm: () => void}>({ isOpen: false, message: '', onConfirm: () => {} });

  // Payout states
  const [payoutModal, setPayoutModal] = useState<{ isOpen: boolean; penitipId: string; owed: number; namaPenitip: string }>({
    isOpen: false, penitipId: '', owed: 0, namaPenitip: ''
  });

  // Penitip Form
  const [editingPenitip, setEditingPenitip] = useState<Penitip | null>(null);
  const [pNama, setPNama] = useState('');
  const [pKontak, setPKontak] = useState('');
  
  // Settings Form
  const [settingsPercent, setSettingsPercent] = useState<string>(settings.persenPotongan?.toString() || '10');

  // Backup Form
  const [importJsonText, setImportJsonText] = useState('');

  // Derived data for payout per penitip
  const penitipOwed = useMemo(() => {
    return penitip.map(p => {
      let omset = 0;
      let dibayar = 0;

      transaksi.forEach(t => {
        if (t.penitipId === p.id) {
          if (t.kategori === 'penjualan_konsinyasi' && t.tipe === 'masuk') {
            omset += (t.jumlah - (t.marginKantin || 0));
          } else if (t.kategori === 'pembayaran_penitip' && t.tipe === 'keluar') {
            dibayar += t.jumlah;
          }
        }
      });

      return {
        penitip: p,
        omset,
        dibayar,
        outstanding: Math.max(0, omset - dibayar)
      };
    }).filter(p => p.outstanding > 0);
  }, [penitip, transaksi]);

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTransaction({
      tipe: 'keluar',
      kategori: 'pembayaran_penitip',
      jumlah: payoutModal.owed,
      tanggal: `${new Date().toISOString().split('T')[0]} ${new Date().toTimeString().slice(0, 5)}`,
      keterangan: `Bayar hasil penjualan titipan (Lunas) oleh ${userRole}`,
      penitipId: payoutModal.penitipId,
    });
    setPayoutModal({ ...payoutModal, isOpen: false });
    alert('Pembayaran berhasil dicatat!');
  };

  const handlePenitipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pNama) return;
    if (editingPenitip) {
      onEditPenitip({ ...editingPenitip, nama: pNama, kontak: pKontak, rekening: '', keterangan: '' });
      setEditingPenitip(null);
    } else {
      onAddPenitip({ nama: pNama, kontak: pKontak, rekening: '', keterangan: '' });
    }
    setPNama(''); setPKontak('');
  };

  const handleBackupExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ penitip, t_data: transaksi }, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `kantin_backup_${new Date().getTime()}.json`);
    dlAnchorElem.click();
  };

  const handleBackupImport = () => {
    try {
      const parsed = JSON.parse(importJsonText);
      if (parsed.penitip && parsed.t_data) {
        setConfirmDialog({
          isOpen: true,
          message: "Data saat ini akan tertimpa. Yakin?",
          onConfirm: () => {
            onImportBackup(parsed);
            setImportJsonText('');
            alert("Backup berhasil di-restore!");
          }
        });
      } else {
        alert("Format JSON salah!");
      }
    } catch {
      alert("JSON tidak valid.");
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-100 p-4">
        <h2 className="text-xl font-bold text-slate-800">Panel Manajemen</h2>
        <div className="flex flex-wrap gap-2 mt-4">
          <button onClick={() => setActiveSubTab('payout')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${activeSubTab === 'payout' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 hover:bg-emerald-50'}`}>Pembayaran Penitip</button>
          <button onClick={() => setActiveSubTab('kas')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${activeSubTab === 'kas' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 hover:bg-emerald-50'}`}>Riwayat Kas</button>
          {userRole === 'admin' && (
            <>
              <button onClick={() => setActiveSubTab('penitip')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${activeSubTab === 'penitip' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 hover:bg-emerald-50'}`}>Daftar Penitip</button>
              <button onClick={() => setActiveSubTab('settings')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${activeSubTab === 'settings' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 hover:bg-emerald-50'}`}>Pengaturan</button>
              <button onClick={() => setActiveSubTab('backup')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${activeSubTab === 'backup' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 hover:bg-emerald-50'}`}>Backup Data</button>
            </>
          )}
        </div>
      </div>

      <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
        {activeSubTab === 'payout' && (
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4">Daftar Hutang ke Penitip</h3>
            {penitipOwed.length === 0 ? (
              <p className="text-sm text-slate-500">Semua lunas!</p>
            ) : (
              <div className="space-y-4">
                {penitipOwed.map(item => (
                  <div key={item.penitip.id} className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-800">{item.penitip.nama}</p>
                      <p className="text-xs text-slate-500">{item.penitip.kontak}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400">Total Belum Dibayar</p>
                        <p className="font-bold text-rose-600">{formatRupiah(item.outstanding)}</p>
                      </div>
                      <button
                        onClick={() => setPayoutModal({ isOpen: true, penitipId: item.penitip.id, owed: item.outstanding, namaPenitip: item.penitip.nama })}
                        className="bg-emerald-600 hover:bg-emerald-700 transition-colors text-white px-4 py-2 rounded-lg text-xs font-bold"
                      >
                        Bayar Lunas
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {activeSubTab === 'kas' && (
          <div>
             <h3 className="text-lg font-bold text-slate-800 mb-4">Riwayat Arus Kas</h3>
             <div className="space-y-3">
               {transaksi.slice().reverse().map(t => (
                 <div key={t.id} className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center">
                   <div className="flex items-center gap-4">
                     <div className={`p-3 rounded-full ${t.tipe === 'masuk' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                       {t.tipe === 'masuk' ? <ArrowDownLeft className="h-5 w-5"/> : <ArrowUpRight className="h-5 w-5"/>}
                     </div>
                     <div>
                       <p className="font-bold text-slate-800">{t.keterangan}</p>
                       <p className="text-xs text-slate-500">{t.tanggal}</p>
                     </div>
                   </div>
                   <div className="flex items-center gap-4">
                     <p className={`font-bold ${t.tipe === 'masuk' ? 'text-emerald-600' : 'text-rose-600'}`}>
                       {t.tipe === 'masuk' ? '+' : '-'}{formatRupiah(t.jumlah)}
                     </p>
                     {userRole === 'admin' && (
                       <button onClick={() => {
                          setConfirmDialog({
                            isOpen: true,
                            message: 'Yakin hapus transaksi ini?',
                            onConfirm: () => onDeleteTransaction(t.id!)
                          })
                       }} className="text-rose-500 hover:text-rose-700">
                         <Trash2 className="h-4 w-4" />
                       </button>
                     )}
                   </div>
                 </div>
               ))}
             </div>
          </div>
        )}

        {activeSubTab === 'penitip' && userRole === 'admin' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
              <h3 className="font-bold text-lg mb-4">{editingPenitip ? 'Edit Penitip' : 'Tambah Penitip Baru'}</h3>
              <form onSubmit={handlePenitipSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Nama</label>
                  <input type="text" value={pNama} onChange={e => setPNama(e.target.value)} required className="w-full border border-slate-200 rounded-xl px-4 py-2" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Kontak/HP</label>
                  <input type="text" value={pKontak} onChange={e => setPKontak(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2" />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold flex-1">Simpan</button>
                  {editingPenitip && <button type="button" onClick={() => {setEditingPenitip(null); setPNama(''); setPKontak('');}} className="bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold">Batal</button>}
                </div>
              </form>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Daftar Penitip</h3>
              <div className="space-y-3">
                {penitip.map(p => (
                  <div key={p.id} className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-800">{p.nama}</p>
                      <p className="text-xs text-slate-500">{p.kontak}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => {setEditingPenitip(p); setPNama(p.nama); setPKontak(p.kontak);}} className="p-2 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100"><Edit2 className="h-4 w-4"/></button>
                      <button onClick={() => setConfirmDialog({isOpen: true, message: 'Yakin hapus penitip ini?', onConfirm: () => onDeletePenitip(p.id!)})} className="p-2 text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100"><Trash2 className="h-4 w-4"/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'settings' && userRole === 'admin' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 max-w-md">
            <h3 className="font-bold text-lg mb-4">Pengaturan Kantin</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Persentase Potongan Titipan (%)</label>
                <input type="number" value={settingsPercent} onChange={e => setSettingsPercent(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2" />
              </div>
              <button onClick={() => {onSaveSettings({persenPotongan: Number(settingsPercent)}); alert('Tersimpan!');}} className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold w-full">Simpan Pengaturan</button>
            </div>
          </div>
        )}

        {activeSubTab === 'backup' && userRole === 'admin' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
              <h3 className="font-bold text-lg mb-4 text-emerald-700">Export / Download</h3>
              <p className="text-sm text-slate-500 mb-4">Unduh seluruh data sebagai JSON.</p>
              <button onClick={handleBackupExport} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-xl font-bold w-full flex justify-center items-center gap-2">
                <Download className="h-5 w-5"/> Download Data
              </button>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
              <h3 className="font-bold text-lg mb-4 text-rose-700">Import / Restore</h3>
              <p className="text-sm text-slate-500 mb-4">Paste konten JSON backup ke sini.</p>
              <textarea value={importJsonText} onChange={e => setImportJsonText(e.target.value)} className="w-full h-32 border border-slate-200 rounded-xl p-3 text-xs font-mono mb-4" placeholder="{...}"></textarea>
              <button onClick={handleBackupImport} className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-3 rounded-xl font-bold w-full flex justify-center items-center gap-2">
                <Upload className="h-5 w-5"/> Restore Data
              </button>
            </div>
          </div>
        )}

      </div>

      {payoutModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm">
            <h3 className="font-bold text-lg mb-2">Bayar Penitip</h3>
            <p className="text-sm text-slate-600 mb-4">Bayar lunas <span className="font-bold">{payoutModal.namaPenitip}</span> sebesar <span className="font-bold text-emerald-600">{formatRupiah(payoutModal.owed)}</span>?</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setPayoutModal({...payoutModal, isOpen: false})} className="px-4 py-2 text-sm text-slate-500">Batal</button>
              <button onClick={handlePay} className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg font-bold">Lanjutkan Pembayaran</button>
            </div>
          </div>
        </div>
      )}

      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm">
            <div className="flex items-start gap-3 mb-4">
              <div className="bg-rose-100 text-rose-600 p-2 rounded-full"><AlertCircle className="h-5 w-5"/></div>
              <div>
                <h3 className="font-bold text-lg">Konfirmasi</h3>
                <p className="text-sm text-slate-600">{confirmDialog.message}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirmDialog({...confirmDialog, isOpen: false})} className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-lg">Batal</button>
              <button onClick={() => { confirmDialog.onConfirm(); setConfirmDialog({...confirmDialog, isOpen: false}); }} className="px-4 py-2 text-sm bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold">Ya, Lanjutkan</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
INNER_EOF
