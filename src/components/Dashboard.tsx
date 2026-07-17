import React, { useMemo } from 'react';
import { Penitip, Transaksi } from '../types';
import { Wallet, TrendingUp, TrendingDown, Clock, Sparkles } from 'lucide-react';
import { formatRupiah } from '../utils/helpers';
import { motion } from 'motion/react';

interface DashboardProps {
  penitip: Penitip[];
  transaksi: Transaksi[];
  onNavigateToTab: (tabId: string) => void;
  onPayPenitipDirect: (penitipId: string, amount: number, keterangan: string) => void;
}

export default function Dashboard({
  penitip,
  transaksi,
  onNavigateToTab,
  onPayPenitipDirect,
}: DashboardProps) {
  // Financial calculations
  const stats = useMemo(() => {
    let masuk = 0;
    let keluar = 0;
    let omsetTitipan = 0;
    let marginKantin = 0;

    transaksi.forEach((t) => {
      if (t.tipe === 'masuk') {
        masuk += t.jumlah;
      } else {
        keluar += t.jumlah;
      }

      if (t.kategori === 'penjualan_konsinyasi' && t.tipe === 'masuk') {
        omsetTitipan += t.jumlah;
        marginKantin += (t.marginKantin || 0);
      }
    });

    const saldoKasTotal = masuk - keluar;

    const totalPaidToPenitip = transaksi
      .filter((t) => t.kategori === 'pembayaran_penitip')
      .reduce((sum, t) => sum + t.jumlah, 0);

    const sisaHutangPenitip = Math.max(0, (omsetTitipan - marginKantin) - totalPaidToPenitip);
    const labaBersihKantin = saldoKasTotal - sisaHutangPenitip;

    return { saldoKasTotal, omsetTitipan, labaBersihKantin, marginKantin, sisaHutangPenitip };
  }, [transaksi]);

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <h1 className="text-2xl font-black tracking-tight text-slate-800">Dashboard Utama</h1>
        <p className="text-sm text-slate-500 font-medium">Ringkasan kondisi kesehatan keuangan kantin amanah saat ini.</p>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Kas Real (Dompet/Laci) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm relative overflow-hidden group hover:border-emerald-200 transition-colors">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-slate-50 rounded-full group-hover:scale-150 transition-transform duration-500 z-0"></div>
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-slate-100 text-slate-600 p-2.5 rounded-xl">
                <Wallet className="h-5 w-5" />
              </div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Saldo Kas Fisik (Laci)</h2>
            </div>
            <p className="text-2xl font-black text-slate-800 tracking-tight mt-auto">
              {formatRupiah(stats.saldoKasTotal)}
            </p>
          </div>
        </div>

        {/* Laba Bersih Kantin */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-800 rounded-2xl p-5 shadow-sm shadow-emerald-200 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 group-hover:scale-125 transition-transform duration-500"></div>
          <div className="relative z-10 flex flex-col h-full text-white">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-white/10 p-2.5 rounded-xl">
                <TrendingUp className="h-5 w-5 text-emerald-100" />
              </div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-100">Laba Bersih Kantin</h2>
            </div>
            <p className="text-2xl font-black tracking-tight mt-auto">
              {formatRupiah(stats.labaBersihKantin)}
            </p>
          </div>
        </div>

        {/* Margin Titipan / Konsinyasi */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-sky-50 text-sky-600 p-2.5 rounded-xl">
              <TrendingUp className="h-5 w-5" />
            </div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Potongan Konsinyasi</h2>
          </div>
          <p className="text-2xl font-black text-slate-800 tracking-tight mt-auto">
            {formatRupiah(stats.marginKantin)}
          </p>
        </div>

        {/* Hutang Penitip (Belum Dibayar) */}
        <div className="bg-rose-50/50 rounded-2xl p-5 border border-rose-100/50 shadow-sm relative overflow-hidden">
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-rose-100 text-rose-600 p-2.5 rounded-xl">
                <Clock className="h-5 w-5" />
              </div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-rose-600">Total Hutang Penitip</h2>
            </div>
            <p className="text-2xl font-black text-rose-700 tracking-tight mt-auto">
              {formatRupiah(stats.sisaHutangPenitip)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 mb-4">Informasi Transaksi Kasir</h3>
            <p className="text-sm text-slate-500">Semua rekap dan operasional berjalan diatur melalui Kasir.</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Quick Guidance Info Card */}
          <div className="bg-gradient-to-br from-emerald-800 to-teal-950 text-white p-6 rounded-2xl shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 h-24 w-24 bg-white/5 rounded-full -mr-6 -mt-6"></div>
            
            <h3 className="text-sm font-bold font-display uppercase tracking-wider text-emerald-300 mb-3 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-emerald-300" />
              Kantin Amanah Cerdas
            </h3>
            <p className="text-xs text-emerald-100/90 leading-relaxed mb-4">
              Konsep <strong>"Amanah"</strong> memastikan kantin sekolah Anda tidak rugi dan melacak uang hasil penjualan titipan orang lain secara adil tanpa tercampur dengan laba operasional kantin.
            </p>
            <ul className="space-y-2.5 text-xs text-emerald-100/85">
              <li className="flex items-start gap-2">
                <span className="bg-emerald-700/80 rounded-full h-4 w-4 flex items-center justify-center text-[10px] mt-0.5 text-emerald-200">1</span>
                <span><strong>Kasir</strong> melayani penjualan makanan umum dan titipan anak sekolah.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-emerald-700/80 rounded-full h-4 w-4 flex items-center justify-center text-[10px] mt-0.5 text-emerald-200">2</span>
                <span>Uang dari penitip otomatis dialokasikan ke sisa hutang penitip.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
