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

      const buffer = await response.arrayBuffer();
      const nodeBuffer = Buffer.from(buffer);
      
      const contentType = response.headers.get('content-type');
      if (contentType) {
        res.setHeader('Content-Type', contentType);
      }
      
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', 'public, max-age=86400');

      // Attempt to resize if it's a JPEG or PNG
      if (contentType && (contentType.includes('jpeg') || contentType.includes('jpg') || contentType.includes('png'))) {
        try {
          const { default: sharp } = await import('sharp');
          const image = sharp(nodeBuffer);
          const metadata = await image.metadata();
          
          // Max safe texture size for all devices is 4096 (highly recommended for performance and memory)
          const MAX_SIZE = 4096;
          if (metadata.width && metadata.height && (metadata.width > MAX_SIZE || metadata.height > MAX_SIZE)) {
            console.log(`Resizing image from ${metadata.width}x${metadata.height} to fit within ${MAX_SIZE}`);
            const resizedBuffer = await image
              .resize({
                width: MAX_SIZE,
                height: MAX_SIZE,
                fit: 'inside',
                withoutEnlargement: true
              })
              .toBuffer();
            
            res.setHeader('Content-Length', resizedBuffer.length);
            return res.send(resizedBuffer);
          }
        } catch (resizeErr) {
          console.error('Error during image resize:', resizeErr);
          // Fall back to original buffer on error
        }
      }
      
      res.setHeader('Content-Length', nodeBuffer.length);
      res.send(nodeBuffer);
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
