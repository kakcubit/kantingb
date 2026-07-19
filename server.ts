import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'database.json');

// Interface declarations matching React types
interface User {
  id: string;
  username: string;
  password?: string;
  role: 'admin' | 'kasir';
  namaLengkap: string;
}

interface Settings {
  persenPotongan: number;
  namaKantin?: string;
  namaSekolah?: string;
  logoUrl?: string;
  temaWarna?: string;
}

// Initial default data
const INITIAL_DB = {
  penitip: [
    {
      id: 'p-1',
      nama: 'Bu Ida (Kue & Jajanan)',
      kontak: '0812-3456-7890',
      rekening: 'BRI 0021-01-098765-50-3 a.n Ida Royani',
      keterangan: 'Menitipkan aneka kue basah dan gorengan setiap pagi pukul 06:30.',
    },
    {
      id: 'p-2',
      nama: 'Pak Joko (Nasi & Lauk)',
      kontak: '0857-9876-5432',
      rekening: 'BCA 8221045991 a.n Joko Susanto',
      keterangan: 'Menitipkan nasi kuning porsi siswa dan mie goreng cup.',
    },
    {
      id: 'p-3',
      nama: 'Mbak Sri (Camilan & Minuman)',
      kontak: '0821-4433-2211',
      rekening: 'Mandiri 1370012233445 a.n Sri Wahyuni',
      keterangan: 'Menitipkan jasuke (jagung susu keju) dan puding cup.',
    },
  ],
  transaksi: [
    {
      id: 't-1',
      tipe: 'masuk',
      kategori: 'penjualan_umum',
      jumlah: 120000,
      tanggal: `${new Date().toISOString().split('T')[0]} 08:30`,
      keterangan: 'Hasil penjualan minuman dingin & gorengan kantin mandiri (Sesi Pagi)',
    },
    {
      id: 't-2',
      tipe: 'masuk',
      kategori: 'penjualan_konsinyasi',
      jumlah: 192000,
      tanggal: `${new Date().toISOString().split('T')[0]} 10:15`,
      keterangan: 'Rekap penjualan Nasi Kuning',
      penitipId: 'p-2',
      marginKantin: 19200, // 10%
    },
    {
      id: 't-3',
      tipe: 'masuk',
      kategori: 'penjualan_konsinyasi',
      jumlah: 135000,
      tanggal: `${new Date().toISOString().split('T')[0]} 10:20`,
      keterangan: 'Rekap penjualan Risol Mayo & Gorengan',
      penitipId: 'p-1',
      marginKantin: 13500, // 10%
    },
    {
      id: 't-4',
      tipe: 'keluar',
      kategori: 'pembayaran_penitip',
      jumlah: 121500,
      tanggal: `${new Date().toISOString().split('T')[0]} 13:45`,
      keterangan: 'Bayar sisa penjualan Risol (setelah potong kantin)',
      penitipId: 'p-1',
    },
    {
      id: 't-5',
      tipe: 'keluar',
      kategori: 'operasional_keluar',
      jumlah: 15000,
      tanggal: `${new Date().toISOString().split('T')[0]} 14:00`,
      keterangan: 'Beli plastik bungkus & kantong kresek tambahan',
    },
  ],
  users: [
    { id: 'u-1', username: 'admin', password: 'admin123', role: 'admin', namaLengkap: 'Administrator Kantin' },
    { id: 'u-2', username: 'kasir', password: 'kasir123', role: 'kasir', namaLengkap: 'Staf Kasir Kantin' },
  ] as User[],
  settings: {
    persenPotongan: 10,
    namaKantin: 'Kantin Amanah',
    namaSekolah: 'SDN Gapura Barat I',
    temaWarna: 'emerald'
  } as Settings,
};

// Helper to read database
function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DB, null, 2), 'utf-8');
    return INITIAL_DB;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error reading database file, resetting to initial', error);
    return INITIAL_DB;
  }
}

// Helper to write database
function writeDB(data: typeof INITIAL_DB) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Route: Login
  app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    const db = readDB();
    const user = db.users.find(
      (u: any) => u.username === username && u.password === password
    );

    if (user) {
      const { password, ...safeUser } = user;
      res.json({ success: true, user: safeUser });
    } else {
      res.status(401).json({ success: false, message: 'Username atau password salah!' });
    }
  });

  // API Route: Get State
  app.get('/api/state', (req, res) => {
    const db = readDB();
    // Exclude passwords for safety
    const safeUsers = db.users.map(({ password, ...u }: any) => u);
    res.json({
      penitip: db.penitip,
      transaksi: db.transaksi,
      users: safeUsers,
      settings: db.settings,
    });
  });

  // API Route: Update Penitip
  app.post('/api/penitip', (req, res) => {
    const db = readDB();
    const { id, nama, kontak, rekening, keterangan } = req.body;

    if (id) {
      // Edit
      db.penitip = db.penitip.map((p: any) =>
        p.id === id ? { ...p, nama, kontak, rekening, keterangan } : p
      );
    } else {
      // Add
      const newP = {
        id: `p-${Math.random().toString(36).substring(2, 9)}`,
        nama,
        kontak,
        rekening,
        keterangan,
      };
      db.penitip.push(newP);
    }

    writeDB(db);
    res.json({ success: true, data: db.penitip });
  });

  // API Route: Delete Penitip (Cascades)
  app.delete('/api/penitip/:id', (req, res) => {
    const db = readDB();
    const { id } = req.params;

    db.penitip = db.penitip.filter((p: any) => p.id !== id);

    writeDB(db);
    res.json({ success: true, data: db.penitip });
  });

  // API Route: Log single transaction (Custom masuk/keluar)
  app.post('/api/transaksi', (req, res) => {
    const db = readDB();
    const { tipe, kategori, jumlah, keterangan, penitipId, marginKantin } = req.body;

    const tx = {
      id: `t-${Math.random().toString(36).substring(2, 9)}`,
      tipe,
      kategori,
      jumlah: Number(jumlah) || 0,
      tanggal: `${new Date().toISOString().split('T')[0]} ${new Date().toTimeString().slice(0, 5)}`,
      keterangan,
      penitipId,
      marginKantin: marginKantin ? Number(marginKantin) : undefined,
    };

    db.transaksi.unshift(tx);
    writeDB(db);
    res.json({ success: true, data: db.transaksi });
  });

  // API Route: Delete transaction
  app.delete('/api/transaksi/:id', (req, res) => {
    const db = readDB();
    const { id } = req.params;

    db.transaksi = db.transaksi.filter((t: any) => t.id !== id);
    writeDB(db);
    res.json({ success: true, data: db.transaksi });
  });

  // API Route: Update global setting / percentage cut
  app.post('/api/settings', (req, res) => {
    const db = readDB();
    const { persenPotongan, namaKantin, namaSekolah, logoUrl, temaWarna } = req.body;
    db.settings.persenPotongan = Number(persenPotongan) || 10;
    if (namaKantin !== undefined) db.settings.namaKantin = namaKantin;
    if (namaSekolah !== undefined) db.settings.namaSekolah = namaSekolah;
    if (logoUrl !== undefined) db.settings.logoUrl = logoUrl;
    if (temaWarna !== undefined) db.settings.temaWarna = temaWarna;
    writeDB(db);
    res.json({ success: true, settings: db.settings });
  });

  // API Route: Manage User Accounts (Admin only)
  // Get users (with password for editing)
  app.get('/api/users', (req, res) => {
    const db = readDB();
    res.json(db.users);
  });

  app.post('/api/users', (req, res) => {
    const db = readDB();
    const { id, username, password, role, namaLengkap } = req.body;

    if (id) {
      db.users = db.users.map((u: any) =>
        u.id === id ? { ...u, username, role, namaLengkap, ...(password ? { password } : {}) } : u
      );
    } else {
      const newU = {
        id: `u-${Math.random().toString(36).substring(2, 9)}`,
        username,
        password,
        role,
        namaLengkap,
      };
      db.users.push(newU);
    }

    writeDB(db);
    res.json({ success: true, data: db.users });
  });

  app.delete('/api/users/:id', (req, res) => {
    const db = readDB();
    const { id } = req.params;

    db.users = db.users.filter((u: any) => u.id !== id);
    writeDB(db);
    res.json({ success: true, data: db.users });
  });

  // API Route: Bulk Overwrite State (Restore Backup)
  app.post('/api/import-backup', (req, res) => {
    const { penitip, t_data } = req.body;
    const db = readDB();

    if (Array.isArray(penitip)) db.penitip = penitip;
    if (Array.isArray(t_data)) db.transaksi = t_data;

    writeDB(db);
    res.json({ success: true, message: 'Backup restored' });
  });

  // Integrate Vite Dev Server in Development, static handler in Production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Kantiner Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
