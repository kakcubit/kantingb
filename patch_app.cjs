const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace("import { LayoutDashboard, ", "import { api } from './lib/api';\nimport { LayoutDashboard, ");

// Replace fetchState
code = code.replace(/const fetchState = async \(\) => \{\s+try \{\s+const response = await fetch\('\/api\/state'\);\s+if \(response\.ok\) \{\s+const data = await response\.json\(\);\s+setPenitip\(data\.penitip \|\| \[\]\);\s+setTransaksi\(data\.transaksi \|\| \[\]\);\s+setUsers\(data\.users \|\| \[\]\);\s+setSettings\(data\.settings \|\| \{ persenPotongan: 10 \}\);\s+\}\s+\} catch \(err\) \{\s+console\.error\('Gagal mengambil data dari server database online:', err\);\s+\}\s+\};/, 
`const fetchState = async () => {
    try {
      const data = await api.getState();
      setPenitip(data.penitip || []);
      setTransaksi(data.transaksi || []);
      setUsers(data.users || []);
      setSettings(data.settings || { persenPotongan: 10 });
    } catch (err) {
      console.error('Gagal mengambil data dari server database online:', err);
    }
  };`);

// Replace handleAddTransaction
code = code.replace(/const handleAddTransaction = async \(newTx: Omit<Transaksi, 'id'>\) => \{\s+try \{\s+const res = await fetch\('\/api\/transaksi', \{\s+method: 'POST',\s+headers: \{ 'Content-Type': 'application\/json' \},\s+body: JSON\.stringify\(newTx\),\s+\}\);\s+if \(res\.ok\) \{\s+await fetchState\(\);\s+\} else \{\s+alert\('Gagal membukukan transaksi kas\.'\);\s+\}\s+\} catch \(e\) \{\s+console\.error\(e\);\s+alert\('Terjadi kesalahan koneksi saat membukukan transaksi\.'\);\s+\}\s+\};/, 
`const handleAddTransaction = async (newTx: Omit<Transaksi, 'id'>) => {
    try {
      await api.addTransaction(newTx);
      await fetchState();
    } catch (e) {
      console.error(e);
      alert('Terjadi kesalahan koneksi saat membukukan transaksi.');
    }
  };`);

// Replace handleDeleteTransaction
code = code.replace(/const handleDeleteTransaction = async \(id: string\) => \{\s+try \{\s+const res = await fetch\(\`\/api\/transaksi\/\$\{id\}\`, \{\s+method: 'DELETE',\s+\}\);\s+if \(res\.ok\) \{\s+await fetchState\(\);\s+\} else \{\s+alert\('Gagal menghapus catatan transaksi\.'\);\s+\}\s+\} catch \(e\) \{\s+console\.error\(e\);\s+\}\s+\};/,
`const handleDeleteTransaction = async (id: string) => {
    try {
      await api.deleteTransaction(id);
      await fetchState();
    } catch (e) {
      console.error(e);
      alert('Gagal menghapus catatan transaksi.');
    }
  };`);

// Replace handleAddPenitip
code = code.replace(/const handleAddPenitip = async \(newP: Omit<Penitip, 'id'>\) => \{\s+try \{\s+const res = await fetch\('\/api\/penitip', \{\s+method: 'POST',\s+headers: \{ 'Content-Type': 'application\/json' \},\s+body: JSON\.stringify\(newP\),\s+\}\);\s+if \(res\.ok\) \{\s+await fetchState\(\);\s+\} else \{\s+alert\('Gagal mendaftarkan penitip\.'\);\s+\}\s+\} catch \(e\) \{\s+console\.error\(e\);\s+\}\s+\};/,
`const handleAddPenitip = async (newP: Omit<Penitip, 'id'>) => {
    try {
      await api.savePenitip(newP);
      await fetchState();
    } catch (e) {
      console.error(e);
      alert('Gagal mendaftarkan penitip.');
    }
  };`);

// Replace handleEditPenitip
code = code.replace(/const handleEditPenitip = async \(updatedP: Penitip\) => \{\s+try \{\s+const res = await fetch\('\/api\/penitip', \{\s+method: 'POST',\s+headers: \{ 'Content-Type': 'application\/json' \},\s+body: JSON\.stringify\(updatedP\),\s+\}\);\s+if \(res\.ok\) \{\s+await fetchState\(\);\s+\} else \{\s+alert\('Gagal mengedit data penitip\.'\);\s+\}\s+\} catch \(e\) \{\s+console\.error\(e\);\s+\}\s+\};/,
`const handleEditPenitip = async (updatedP: Penitip) => {
    try {
      await api.savePenitip(updatedP);
      await fetchState();
    } catch (e) {
      console.error(e);
      alert('Gagal mengedit data penitip.');
    }
  };`);

// Replace handleDeletePenitip
code = code.replace(/const handleDeletePenitip = async \(id: string\) => \{\s+try \{\s+const res = await fetch\(\`\/api\/penitip\/\$\{id\}\`, \{\s+method: 'DELETE',\s+\}\);\s+if \(res\.ok\) \{\s+await fetchState\(\);\s+\} else \{\s+alert\('Gagal menghapus penitip\.'\);\s+\}\s+\} catch \(e\) \{\s+console\.error\(e\);\s+\}\s+\};/,
`const handleDeletePenitip = async (id: string) => {
    try {
      await api.deletePenitip(id);
      await fetchState();
    } catch (e) {
      console.error(e);
      alert('Gagal menghapus penitip.');
    }
  };`);

// Replace handleSaveUser
code = code.replace(/const handleSaveUser = async \(u: UserAccount\) => \{\s+try \{\s+const res = await fetch\('\/api\/users', \{\s+method: 'POST',\s+headers: \{ 'Content-Type': 'application\/json' \},\s+body: JSON\.stringify\(u\),\s+\}\);\s+if \(res\.ok\) \{\s+await fetchState\(\);\s+alert\('Pengguna berhasil disimpan\.'\);\s+\} else \{\s+alert\('Gagal menyimpan pengguna\.'\);\s+\}\s+\} catch \(e\) \{\s+console\.error\(e\);\s+\}\s+\};/,
`const handleSaveUser = async (u: UserAccount) => {
    try {
      await api.saveUser(u);
      await fetchState();
      alert('Pengguna berhasil disimpan.');
    } catch (e) {
      console.error(e);
      alert('Gagal menyimpan pengguna.');
    }
  };`);

// Replace handleDeleteUser
code = code.replace(/const handleDeleteUser = async \(id: string\) => \{\s+try \{\s+const res = await fetch\(\`\/api\/users\/\$\{id\}\`, \{\s+method: 'DELETE',\s+\}\);\s+if \(res\.ok\) \{\s+await fetchState\(\);\s+alert\('Pengguna berhasil dihapus\.'\);\s+\} else \{\s+alert\('Gagal menghapus pengguna\.'\);\s+\}\s+\} catch \(e\) \{\s+console\.error\(e\);\s+\}\s+\};/,
`const handleDeleteUser = async (id: string) => {
    try {
      await api.deleteUser(id);
      await fetchState();
      alert('Pengguna berhasil dihapus.');
    } catch (e) {
      console.error(e);
      alert('Gagal menghapus pengguna.');
    }
  };`);

// Replace handleSaveSettings
code = code.replace(/const handleSaveSettings = async \(s: AppSettings\) => \{\s+try \{\s+const res = await fetch\('\/api\/settings', \{\s+method: 'POST',\s+headers: \{ 'Content-Type': 'application\/json' \},\s+body: JSON\.stringify\(s\),\s+\}\);\s+if \(res\.ok\) \{\s+await fetchState\(\);\s+\} else \{\s+alert\('Gagal menyimpan pengaturan\.'\);\s+\}\s+\} catch \(e\) \{\s+console\.error\(e\);\s+\}\s+\};/,
`const handleSaveSettings = async (s: AppSettings) => {
    try {
      await api.saveSettings(s);
      await fetchState();
    } catch (e) {
      console.error(e);
      alert('Gagal menyimpan pengaturan.');
    }
  };`);

// Replace handleImportBackup
code = code.replace(/const handleImportBackup = async \(parsed: any\) => \{\s+try \{\s+const res = await fetch\('\/api\/import-backup', \{\s+method: 'POST',\s+headers: \{ 'Content-Type': 'application\/json' \},\s+body: JSON\.stringify\(parsed\),\s+\}\);\s+if \(res\.ok\) \{\s+await fetchState\(\);\s+\} else \{\s+alert\('Gagal restore backup\.'\);\s+\}\s+\} catch \(e\) \{\s+console\.error\(e\);\s+\}\s+\};/,
`const handleImportBackup = async (parsed: any) => {
    try {
      await api.importBackup(parsed);
      await fetchState();
    } catch (e) {
      console.error(e);
      alert('Gagal restore backup.');
    }
  };`);

// Replace Reset Data Demo API call
code = code.replace(/const res = await fetch\('\/api\/reset', \{ method: 'POST' \}\);\s+if \(res\.ok\) \{\s+window\.location\.reload\(\);\s+\}/,
`await api.resetDemo();
                            window.location.reload();`);

fs.writeFileSync('src/App.tsx', code);
