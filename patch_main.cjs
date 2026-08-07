const fs = require('fs');
let code = fs.readFileSync('src/main.tsx', 'utf8');
code = code.replace(
  "createRoot(document.getElementById('root')).render(",
  "const rootElement = document.getElementById('root');\nif (!rootElement) throw new Error('Failed to find the root element');\ncreateRoot(rootElement).render("
);
fs.writeFileSync('src/main.tsx', code);
