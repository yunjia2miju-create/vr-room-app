import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.get('/api/proxy-image', async (req, res) => {
    try {
      const url = req.query.url as string;
      console.log('Proxying image requested URL:', url);
      if (!url) {
        return res.status(400).send('URL is required');
      }

      const response = await fetch(url);
      console.log('Proxy response status for', url, ':', response.status);

      if (!response.ok) {
        return res.status(response.status).send('Error fetching image');
      }

      const contentType = response.headers.get('content-type');
      if (contentType) {
        res.setHeader('Content-Type', contentType);
      }
      
      const contentLength = response.headers.get('content-length');
      if (contentLength) {
        res.setHeader('Content-Length', contentLength);
      }

      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

      // Convert Web API ReadableStream to Node.js Readable stream
      const stream = require('stream');
      if (response.body) {
        stream.Readable.fromWeb(response.body as any).pipe(res);
      } else {
        res.end();
      }
    } catch (error) {
      console.error('Proxy error:', error);
      res.status(500).send('Internal Server Error');
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
