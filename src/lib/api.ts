import { Penitip, Transaksi, AppSettings, UserAccount } from '../types';
import { supabase } from './supabase';

const useSupabase = Boolean(supabase);

export const api = {
  async getState() {
    if (useSupabase) {
      const [{ data: penitip }, { data: transaksi }, { data: users }, { data: settings }] = await Promise.all([
        supabase!.from('penitip').select('*').order('created_at', { ascending: false }),
        supabase!.from('transaksi').select('*').order('created_at', { ascending: false }),
        supabase!.from('users').select('id, username, role, nama_lengkap'),
        supabase!.from('settings').select('*').limit(1).single()
      ]);
      return {
        penitip: penitip?.map(p => ({ ...p, id: p.id, nama: p.nama, kontak: p.kontak, rekening: p.rekening, keterangan: p.keterangan })) || [],
        transaksi: transaksi?.map(t => ({ ...t, marginKantin: t.margin_kantin, penitipId: t.penitip_id })) || [],
        users: users?.map(u => ({ ...u, namaLengkap: u.nama_lengkap })) || [],
        settings: settings ? { 
          persenPotongan: settings.persen_potongan,
          namaKantin: settings.nama_kantin,
          namaSekolah: settings.nama_sekolah,
          logoUrl: settings.logo_url,
          temaWarna: settings.tema_warna
        } : { persenPotongan: 10 }
      };
    } else {
      const res = await fetch('/api/state');
      if (!res.ok) throw new Error('Failed to fetch state');
      return res.json();
    }
  },

  async login(username: string, password: string): Promise<{ success: boolean; user?: UserAccount; message?: string }> {
    if (useSupabase) {
      const { data, error } = await supabase!
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .single();
      
      if (data) {
        return { success: true, user: { id: data.id, username: data.username, role: data.role as any, namaLengkap: data.nama_lengkap } };
      }
      return { success: false, message: 'Username atau password salah!' };
    } else {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      return res.json();
    }
  },

  async addTransaction(tx: Omit<Transaksi, 'id'>) {
    if (useSupabase) {
      const { error } = await supabase!.from('transaksi').insert({
        tipe: tx.tipe,
        kategori: tx.kategori,
        jumlah: tx.jumlah,
        tanggal: tx.tanggal,
        keterangan: tx.keterangan,
        penitip_id: tx.penitipId,
        margin_kantin: tx.marginKantin
      });
      if (error) throw error;
    } else {
      const res = await fetch('/api/transaksi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tx),
      });
      if (!res.ok) throw new Error('Failed to add transaction');
    }
  },

  async deleteTransaction(id: string) {
    if (useSupabase) {
      const { error } = await supabase!.from('transaksi').delete().eq('id', id);
      if (error) throw error;
    } else {
      const res = await fetch(`/api/transaksi/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete transaction');
    }
  },

  async savePenitip(p: Partial<Penitip>) {
    if (useSupabase) {
      if (p.id) {
        const { error } = await supabase!.from('penitip').update({
          nama: p.nama, kontak: p.kontak, rekening: p.rekening, keterangan: p.keterangan
        }).eq('id', p.id);
        if (error) throw error;
      } else {
        const { error } = await supabase!.from('penitip').insert({
          nama: p.nama, kontak: p.kontak, rekening: p.rekening, keterangan: p.keterangan
        });
        if (error) throw error;
      }
    } else {
      const res = await fetch('/api/penitip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(p),
      });
      if (!res.ok) throw new Error('Failed to save penitip');
    }
  },

  async deletePenitip(id: string) {
    if (useSupabase) {
      const { error } = await supabase!.from('penitip').delete().eq('id', id);
      if (error) throw error;
    } else {
      const res = await fetch(`/api/penitip/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete penitip');
    }
  },

  async saveUser(u: UserAccount) {
    if (useSupabase) {
      if (u.id && !u.id.startsWith('u-')) { // Existing supabase UUID
        const { error } = await supabase!.from('users').update({
          username: u.username,
          role: u.role,
          nama_lengkap: u.namaLengkap,
          ...(u.password ? { password: u.password } : {})
        }).eq('id', u.id);
        if (error) throw error;
      } else {
        const { error } = await supabase!.from('users').insert({
          username: u.username,
          password: u.password || '123456',
          role: u.role,
          nama_lengkap: u.namaLengkap
        });
        if (error) throw error;
      }
    } else {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(u),
      });
      if (!res.ok) throw new Error('Failed to save user');
    }
  },

  async deleteUser(id: string) {
    if (useSupabase) {
      const { error } = await supabase!.from('users').delete().eq('id', id);
      if (error) throw error;
    } else {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete user');
    }
  },

  async saveSettings(s: AppSettings) {
    if (useSupabase) {
      const { data } = await supabase!.from('settings').select('id').limit(1).single();
      if (data) {
        const { error } = await supabase!.from('settings').update({ 
          persen_potongan: s.persenPotongan,
          nama_kantin: s.namaKantin,
          nama_sekolah: s.namaSekolah,
          logo_url: s.logoUrl,
          tema_warna: s.temaWarna
        }).eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase!.from('settings').insert({ 
          persen_potongan: s.persenPotongan,
          nama_kantin: s.namaKantin,
          nama_sekolah: s.namaSekolah,
          logo_url: s.logoUrl,
          tema_warna: s.temaWarna
        });
        if (error) throw error;
      }
    } else {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(s),
      });
      if (!res.ok) throw new Error('Failed to save settings');
    }
  },

  async resetDemo() {
    if (!useSupabase) {
      const res = await fetch('/api/reset', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to reset');
    } else {
      throw new Error('Reset demo is not supported on Supabase directly via client');
    }
  },

  async importBackup(parsed: any) {
    if (!useSupabase) {
      const res = await fetch('/api/import-backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      });
      if (!res.ok) throw new Error('Failed to import backup');
    } else {
      throw new Error('Import backup is not supported on Supabase directly via client');
    }
  }
};
