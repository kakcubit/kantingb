import React, { useState } from 'react';
import { Penitip, Transaksi, AppSettings } from '../types';
import { CheckCircle, Store, Coins, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatRupiah } from '../utils/helpers';

interface KasirPanelProps {
  penitip: Penitip[];
  settings: AppSettings;
  transaksi: Transaksi[];
  onAddTransaction: (t: Omit<Transaksi, 'id'>) => void;
}

export default function KasirPanel({
  penitip,
  settings,
  transaksi,
  onAddTransaction,
}: KasirPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<'titipan' | 'umum' | 'pengeluaran'>('titipan');

  // Titipan State
  const [selectedPenitipId, setSelectedPenitipId] = useState('');
  const [keteranganTitipan, setKeteranganTitipan] = useState('');
  const [jumlahTitipan, setJumlahTitipan] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastTxSummary, setLastTxSummary] = useState({ judul: '', total: 0 });

  // Umum State
  const [keteranganUmum, setKeteranganUmum] = useState('');
  const [jumlahUmum, setJumlahUmum] = useState('');

  // Pengeluaran State
  const [keteranganPengeluaran, setKeteranganPengeluaran] = useState('');
  const [jumlahPengeluaran, setJumlahPengeluaran] = useState('');

  const handleSubmitPengeluaran = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keteranganPengeluaran || !jumlahPengeluaran) return;

    const amount = Number(jumlahPengeluaran.replace(/\D/g, ''));
    if (amount <= 0) return;

    onAddTransaction({
      tipe: 'keluar',
      kategori: 'operasional_keluar',
      jumlah: amount,
      tanggal: `${new Date().toISOString().split('T')[0]} ${new Date().toTimeString().slice(0, 5)}`,
      keterangan: keteranganPengeluaran,
    });

    setLastTxSummary({ judul: 'Pengeluaran Kantin', total: amount });
    setShowSuccessModal(true);
    setKeteranganPengeluaran('');
    setJumlahPengeluaran('');
  };

  const handleSubmitTitipan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPenitipId || !keteranganTitipan || !jumlahTitipan) return;

    const amount = Number(jumlahTitipan.replace(/\D/g, ''));
    if (amount <= 0) return;

    const margin = amount * (settings.persenPotongan / 100);

    onAddTransaction({
      tipe: 'masuk',
      kategori: 'penjualan_konsinyasi',
      jumlah: amount,
      tanggal: `${new Date().toISOString().split('T')[0]} ${new Date().toTimeString().slice(0, 5)}`,
      keterangan: keteranganTitipan,
      penitipId: selectedPenitipId,
      marginKantin: margin,
    });

    setLastTxSummary({ judul: 'Rekap Jualan Titipan', total: amount });
    setShowSuccessModal(true);
    setSelectedPenitipId('');
    setKeteranganTitipan('');
    setJumlahTitipan('');
  };

  const handleSubmitUmum = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keteranganUmum || !jumlahUmum) return;

    const amount = Number(jumlahUmum.replace(/\D/g, ''));
    if (amount <= 0) return;

    onAddTransaction({
      tipe: 'masuk',
      kategori: 'penjualan_umum',
      jumlah: amount,
      tanggal: `${new Date().toISOString().split('T')[0]} ${new Date().toTimeString().slice(0, 5)}`,
      keterangan: keteranganUmum,
    });

    setLastTxSummary({ judul: 'Penjualan Umum Kantin', total: amount });
    setShowSuccessModal(true);
    setKeteranganUmum('');
    setJumlahUmum('');
  };

  const formatCurrencyInput = (value: string) => {
    const num = value.replace(/\D/g, '');
    if (!num) return '';
    return 'Rp ' + Number(num).toLocaleString('id-ID');
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Input Kasir</h2>
        <p className="text-sm text-slate-500 mb-6">Pilih jenis pendapatan yang ingin dicatat ke dalam sistem.</p>

        <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => setActiveSubTab('titipan')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              activeSubTab === 'titipan' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Store className="h-4 w-4" />
            Rekap Jualan Titipan
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('umum')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              activeSubTab === 'umum' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Coins className="h-4 w-4" />
            Penjualan Umum Kantin
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('pengeluaran')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              activeSubTab === 'pengeluaran' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <ShoppingCart className="h-4 w-4" />
            Belanja / Pengeluaran
          </button>
        </div>

        {activeSubTab === 'titipan' && (
          <form onSubmit={handleSubmitTitipan} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Penitip (Pemilik Barang)</label>
              <select
                value={selectedPenitipId}
                onChange={(e) => setSelectedPenitipId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                required
              >
                <option value="">-- Pilih Penitip --</option>
                {penitip.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Barang Titipan Terjual</label>
              <input
                type="text"
                value={keteranganTitipan}
                onChange={(e) => setKeteranganTitipan(e.target.value)}
                placeholder="Contoh: Nasi Kuning & Kerupuk"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Total Uang Terkumpul (Omset Kotor)</label>
              <input
                type="text"
                value={jumlahTitipan}
                onChange={(e) => setJumlahTitipan(formatCurrencyInput(e.target.value))}
                placeholder="Rp 0"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-2xl font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                required
              />
              <p className="text-xs text-slate-400 mt-2 flex justify-between">
                <span>Nilai Potongan Kantin: {settings.persenPotongan}%</span>
                {jumlahTitipan && (
                  <span className="font-semibold text-emerald-600">
                    +{formatRupiah(Number(jumlahTitipan.replace(/\D/g, '')) * (settings.persenPotongan / 100))}
                  </span>
                )}
              </p>
            </div>
            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-sm flex justify-center items-center gap-2 text-lg"
              >
                <CheckCircle className="h-5 w-5" />
                Simpan Penjualan
              </button>
            </div>
          </form>
        )}

        {activeSubTab === 'umum' && (
          <form onSubmit={handleSubmitUmum} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Keterangan Penjualan</label>
              <input
                type="text"
                value={keteranganUmum}
                onChange={(e) => setKeteranganUmum(e.target.value)}
                placeholder="Contoh: Es Teh & Jajanan Kantin"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Total Omset Pendapatan</label>
              <input
                type="text"
                value={jumlahUmum}
                onChange={(e) => setJumlahUmum(formatCurrencyInput(e.target.value))}
                placeholder="Rp 0"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-2xl font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                required
              />
            </div>
            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-sm flex justify-center items-center gap-2 text-lg"
              >
                <CheckCircle className="h-5 w-5" />
                Simpan Pendapatan Kantin
              </button>
            </div>
          </form>
        )}

        {activeSubTab === 'pengeluaran' && (
          <form onSubmit={handleSubmitPengeluaran} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Keterangan Belanja / Pengeluaran</label>
              <input
                type="text"
                value={keteranganPengeluaran}
                onChange={(e) => setKeteranganPengeluaran(e.target.value)}
                placeholder="Contoh: Beli sabun cuci, Plastik, Bayar air"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 font-medium focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Total Biaya Pengeluaran</label>
              <input
                type="text"
                value={jumlahPengeluaran}
                onChange={(e) => setJumlahPengeluaran(formatCurrencyInput(e.target.value))}
                placeholder="Rp 0"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-2xl font-bold text-slate-800 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
                required
              />
            </div>
            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-sm flex justify-center items-center gap-2 text-lg"
              >
                <ShoppingCart className="h-5 w-5" />
                Simpan Data Pengeluaran
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 flex flex-col items-center text-center relative"
            >
              <div className="h-16 w-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h3 className="font-extrabold text-slate-800 text-xl mb-1">Berhasil Disimpan!</h3>
              <p className="text-sm text-slate-500 mb-6">{lastTxSummary.judul}</p>
              
              <div className="w-full bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Masuk</p>
                <p className="text-3xl font-black text-emerald-600">{formatRupiah(lastTxSummary.total)}</p>
              </div>

              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl transition-all shadow-sm"
              >
                Input Transaksi Baru
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
