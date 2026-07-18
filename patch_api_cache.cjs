const fs = require('fs');
let code = fs.readFileSync('src/lib/api.ts', 'utf8');

code = code.replace(
  /const res = await fetch\('\/api\/state'\);/,
  `const res = await fetch('/api/state', { cache: 'no-store' });`
);

code = code.replace(
  /const res = await fetch\('\/api\/users'\);/,
  `const res = await fetch('/api/users', { cache: 'no-store' });`
);

fs.writeFileSync('src/lib/api.ts', code);
