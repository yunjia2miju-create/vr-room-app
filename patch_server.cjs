const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Hoist vite initialization
code = code.replace(
  "  const handlePropertyOg",
  `  let viteServer: any = null;\n  if (process.env.NODE_ENV !== 'production') {\n    viteServer = await createViteServer({\n      server: { middlewareMode: true },\n      appType: 'spa',\n    });\n  }\n\n  const handlePropertyOg`
);

// Apply vite transform
code = code.replace(
  "      res.setHeader('Content-Type', 'text/html; charset=utf-8');\n      return res.send(html);",
  "      if (viteServer) {\n        html = await viteServer.transformIndexHtml(req.originalUrl, html);\n      }\n      res.setHeader('Content-Type', 'text/html; charset=utf-8');\n      return res.send(html);"
);

// Update app.use(vite.middlewares)
code = code.replace(
  "  if (process.env.NODE_ENV !== 'production') {\n    const vite = await createViteServer({\n      server: { middlewareMode: true },\n      appType: 'spa',\n    });\n    app.use(vite.middlewares);\n  } else {",
  "  if (process.env.NODE_ENV !== 'production' && viteServer) {\n    app.use(viteServer.middlewares);\n  } else {"
);

fs.writeFileSync('server.ts', code);
