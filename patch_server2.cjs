const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  "      if (fs.existsSync(path.join(distPath, 'index.html'))) {\n        html = fs.readFileSync(path.join(distPath, 'index.html'), 'utf-8');\n      } else if (fs.existsSync(devPath)) {\n        html = fs.readFileSync(devPath, 'utf-8');\n      } else {\n        return next();\n      }",
  "      if (process.env.NODE_ENV !== 'production' && fs.existsSync(devPath)) {\n        html = fs.readFileSync(devPath, 'utf-8');\n      } else if (fs.existsSync(path.join(distPath, 'index.html'))) {\n        html = fs.readFileSync(path.join(distPath, 'index.html'), 'utf-8');\n      } else if (fs.existsSync(devPath)) {\n        html = fs.readFileSync(devPath, 'utf-8');\n      } else {\n        return next();\n      }"
);

fs.writeFileSync('server.ts', code);
