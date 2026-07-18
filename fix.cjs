const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');
code = code.replace(
  `                ))}
              </div>
                ))}
              </div>`,
  `                ))}
              </div>
          </div>
        )}`
);
fs.writeFileSync('src/components/AdminPanel.tsx', code);
