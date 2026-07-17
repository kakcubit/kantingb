-- Supabase Database Schema for Kantin Amanah

-- Enable UUID extension (usually enabled by default)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: settings
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    persen_potongan INTEGER NOT NULL DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: users
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'kasir')),
    nama_lengkap TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: penitip
CREATE TABLE IF NOT EXISTS public.penitip (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama TEXT NOT NULL,
    kontak TEXT,
    rekening TEXT,
    keterangan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: transaksi
CREATE TABLE IF NOT EXISTS public.transaksi (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipe TEXT NOT NULL CHECK (tipe IN ('masuk', 'keluar')),
    kategori TEXT NOT NULL CHECK (kategori IN ('penjualan_umum', 'penjualan_konsinyasi', 'pembayaran_penitip', 'operasional_keluar')),
    jumlah INTEGER NOT NULL,
    tanggal TEXT NOT NULL,
    keterangan TEXT NOT NULL,
    penitip_id UUID REFERENCES public.penitip(id) ON DELETE CASCADE,
    margin_kantin INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Initial default rows (run these after creating tables)
INSERT INTO public.settings (persen_potongan) VALUES (10);

INSERT INTO public.users (id, username, password, role, nama_lengkap) VALUES
  (uuid_generate_v4(), 'admin', 'admin123', 'admin', 'Administrator Kantin'),
  (uuid_generate_v4(), 'kasir', 'kasir123', 'kasir', 'Staf Kasir Kantin');

-- Enable RLS (Row Level Security) - allow all for now since we're porting directly
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.penitip ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaksi ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all read" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Allow all insert" ON public.settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update" ON public.settings FOR UPDATE USING (true);

CREATE POLICY "Allow all read" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow all insert" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update" ON public.users FOR UPDATE USING (true);
CREATE POLICY "Allow all delete" ON public.users FOR DELETE USING (true);

CREATE POLICY "Allow all read" ON public.penitip FOR SELECT USING (true);
CREATE POLICY "Allow all insert" ON public.penitip FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update" ON public.penitip FOR UPDATE USING (true);
CREATE POLICY "Allow all delete" ON public.penitip FOR DELETE USING (true);

CREATE POLICY "Allow all read" ON public.transaksi FOR SELECT USING (true);
CREATE POLICY "Allow all insert" ON public.transaksi FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update" ON public.transaksi FOR UPDATE USING (true);
CREATE POLICY "Allow all delete" ON public.transaksi FOR DELETE USING (true);
