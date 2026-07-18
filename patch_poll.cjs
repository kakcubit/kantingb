const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// We need to make sure we don't duplicate the effect, or just add a setInterval
code = code.replace(
  /useEffect\(\(\) => \{\s*fetchState\(\);\s*\}, \[currentUser\]\);/,
  `useEffect(() => {
    fetchState();
    const interval = setInterval(() => {
      if (currentUser) {
        fetchState();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [currentUser]);`
);

fs.writeFileSync('src/App.tsx', code);
