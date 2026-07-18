/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'admin' | 'kasir';

export interface Penitip {
  id: string;
  nama: string;
  kontak: string;
  rekening?: string;
  keterangan?: string;
}

export type TransaksiKategori =
  | 'penjualan_umum'       // Penjualan kantin sendiri (bukan titipan)
  | 'penjualan_konsinyasi' // Penjualan barang titipan orang lain
  | 'pembayaran_penitip'   // Pembayaran hasil penjualan ke penitip makanan
  | 'operasional_keluar';  // Pengeluaran operasional kantin (plastik, sabun, dll)

export interface Transaksi {
  id: string;
  tipe: 'masuk' | 'keluar';
  kategori: TransaksiKategori;
  jumlah: number;
  tanggal: string; // ISO String atau YYYY-MM-DD HH:mm
  keterangan: string;
  penitipId?: string; // Opsional, jika terkait penitip
  marginKantin?: number; // Selisih keuntungan kantin
}

export interface AppSettings {
  persenPotongan: number;
  namaKantin?: string;
  namaSekolah?: string;
  logoUrl?: string;
  temaWarna?: string;
}

export interface UserAccount {
  id: string;
  username: string;
  role: UserRole;
  namaLengkap: string;
  password?: string;
}

