const fs = require('fs');
let code = fs.readFileSync('src/components/LoginScreen.tsx', 'utf8');

code = code.replace("import { Shield, ", "import { api } from '../lib/api';\nimport { Shield, ");

code = code.replace(/try \{\s+const response = await fetch\('\/api\/auth\/login', \{\s+method: 'POST',\s+headers: \{ 'Content-Type': 'application\/json' \},\s+body: JSON\.stringify\(\{ username, password \}\),\s+\}\);\s+const result = await response\.json\(\);\s+if \(response\.ok && result\.success\) \{\s+onLoginSuccess\(result\.user\);\s+\} else \{\s+setError\(result\.message \|\| 'Username atau password salah!'\);\s+\}\s+\} catch \(err\) \{\s+setError\('Tidak dapat terhubung ke server database online\. Pastikan dev server berjalan\.'\);\s+\}/,
`try {
      const result = await api.login(username, password);
      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setError(result.message || 'Username atau password salah!');
      }
    } catch (err) {
      setError('Tidak dapat terhubung ke server database. Pastikan koneksi internet aktif.');
    }`);

fs.writeFileSync('src/components/LoginScreen.tsx', code);
