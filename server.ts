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

  // Dynamic Sitemap XML handler
  async function getSitemapPropertyIds(): Promise<string[]> {
    const ids = new Set<string>(['1', '2', '3', '4', '5', '6', '7', '8']);
    try {
      const firestoreUrl = 'https://firestore.googleapis.com/v1/projects/project-3758368870789431339/databases/ai-studio-realestatedashbo-3f2b1139-2496-4de2-87c9-def79bc9970a/documents/properties';
      const resp = await fetch(firestoreUrl);
      if (resp.ok) {
        const data = await resp.json() as any;
        if (data.documents && Array.isArray(data.documents)) {
          for (const doc of data.documents) {
            const docId = doc.name ? doc.name.split('/').pop() : null;
            if (docId) ids.add(docId);
            if (doc.fields && doc.fields.id && doc.fields.id.stringValue) {
              ids.add(doc.fields.id.stringValue);
            }
          }
        }
      }
    } catch (err) {
      console.error('Error fetching properties for sitemap:', err);
    }
    return Array.from(ids);
  }

  app.get('/sitemap.xml', async (req, res) => {
    try {
      const propertyIds = await getSitemapPropertyIds();
      const today = new Date().toISOString().split('T')[0];
      
      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
      xml += `  <url>\n    <loc>https://054-455-6789.com/</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
      
      for (const id of propertyIds) {
        xml += `  <url>\n    <loc>https://054-455-6789.com/property/${id}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
      }
      
      xml += `</urlset>`;

      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.status(200).send(xml);
    } catch (error) {
      console.error('Sitemap generation error:', error);
      res.status(500).send('Error generating sitemap');
    }
  });

  app.get('/robots.txt', (req, res) => {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(`User-agent: *\nAllow: /\n\nSitemap: https://054-455-6789.com/sitemap.xml\n`);
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    const fs = require('fs');
    app.use(express.static(distPath, { index: false }));
    app.get('*', (req, res) => {
      try {
        let html = fs.readFileSync(path.join(distPath, 'index.html'), 'utf-8');
        
        if (req.path.startsWith('/property/')) {
          const propertyId = req.path.split('/')[2];
          const title = `태왕공인중개사사무소 - 매물 TW-${propertyId}`;
          const description = `매물번호 TW-${propertyId} 상세정보와 360 VR 투어를 확인해보세요.`;
          const url = `http://054-455-6789.com${req.path}`;
          
          html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
          html = html.replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${title}" />`);
          html = html.replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${description}" />`);
          html = html.replace(/<meta property="og:url" content=".*?" \/>/, `<meta property="og:url" content="${url}" />`);
        }
        
        res.send(html);
      } catch (err) {
        res.sendFile(path.join(distPath, 'index.html'));
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
