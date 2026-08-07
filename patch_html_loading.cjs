const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(
  '  if (loading) {\n    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff6600]"></div></div>;\n  }',
  '  // Removed global loading block to allow instant render'
);
fs.writeFileSync('src/App.tsx', code);
