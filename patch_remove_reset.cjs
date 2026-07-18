const fs = require('fs');

// Patch App.tsx
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(
  /\{userRole === 'admin' && \(\s*<div className="pt-2 px-3">\s*<button\s*id="btn-reset-demo"[\s\S]*?Reset Data Demo\s*<\/button>\s*<\/div>\s*\)\}/,
  ''
);

// We should also remove the import for RefreshCcw if it's unused. We can leave it for now.
fs.writeFileSync('src/App.tsx', code);

// Patch src/lib/api.ts
let apiCode = fs.readFileSync('src/lib/api.ts', 'utf8');
apiCode = apiCode.replace(
  /async resetDemo\(\) \{[\s\S]*?\},/,
  ''
);
fs.writeFileSync('src/lib/api.ts', apiCode);

// Patch server.ts
let serverCode = fs.readFileSync('server.ts', 'utf8');
serverCode = serverCode.replace(
  /\/\/ API Route: Reset Demo[\s\S]*?app\.post\('\/api\/reset', \(req, res\) => \{[\s\S]*?\}\);/,
  ''
);
fs.writeFileSync('server.ts', serverCode);

