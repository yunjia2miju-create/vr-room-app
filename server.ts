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

  // Dynamic RSS 2.0 Feed handler
  function escapeXml(str: string): string {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  interface RssItem {
    id: string;
    title: string;
    link: string;
    description: string;
    pubDate: string;
  }

  const DEFAULT_PROPERTIES = [
    { id: '1', name: '크라운빌', addr: '사곡동 422-168', room: '501', type: '미투', deposit: '300', rent: '30', note: '출비 : 1543#' },
    { id: '2', name: '어린왕자 하나', addr: '옥계동 950', room: '301', type: '미투', deposit: '300', rent: '35', note: '' },
    { id: '3', name: '고야드', addr: '사곡동 267-54', room: '301', type: '원룸', deposit: '200', rent: '30', note: '현)4119' },
    { id: '4', name: '니캉내캉', addr: '원평동 1034-10', room: '206', type: '미투', deposit: '300', rent: '40', note: '승강기 있음. 보증금 월세조정가능' },
    { id: '5', name: '니캉내캉', addr: '원평동 1034-10', room: '205', type: '미투', deposit: '300/5,000', rent: '38/8', note: '승강기있음. 보증금월세조정가능' },
    { id: '6', name: '힐링타운', addr: '송정동 26-9', room: '305', type: '원룸', deposit: '200', rent: '28', note: '즉시 입주가능' },
    { id: '7', name: '리치하우스', addr: '사곡동 422-56', room: '201', type: '투룸', deposit: '300', rent: '55', note: '' },
    { id: '8', name: '이화빌', addr: '형곡동 192-8', room: '205', type: '미투', deposit: '200', rent: '32', note: '' },
  ];

  async function getRssItems(): Promise<RssItem[]> {
    const items: RssItem[] = [];
    const now = new Date().toUTCString();

    try {
      const firestoreUrl = 'https://firestore.googleapis.com/v1/projects/project-3758368870789431339/databases/ai-studio-realestatedashbo-3f2b1139-2496-4de2-87c9-def79bc9970a/documents/properties';
      const resp = await fetch(firestoreUrl);
      if (resp.ok) {
        const data = await resp.json() as any;
        if (data.documents && Array.isArray(data.documents) && data.documents.length > 0) {
          for (const doc of data.documents) {
            const fields = doc.fields || {};
            const docId = doc.name ? doc.name.split('/').pop()! : fields.id?.stringValue || '1';
            const name = fields.name?.stringValue || '매물';
            const type = fields.type?.stringValue || '원룸/미투/투룸';
            const addr = fields.addr?.stringValue || '';
            const deposit = fields.deposit?.stringValue || '0';
            const rent = fields.rent?.stringValue || '0';
            const note = fields.note?.stringValue || '';
            const createTime = doc.createTime ? new Date(doc.createTime).toUTCString() : now;

            const title = `[태왕] ${name} (${type}) - 보증금 ${deposit} / 월세 ${rent}`;
            const description = `매물명: ${name} | 위치: ${addr} | 건물유형: ${type} | 보증금: ${deposit}만원 | 월세: ${rent}만원 | 비고: ${note}. 태왕공인중개사사무소 (문의: 054-455-6789 / 010-7590-0111)`;
            const link = `https://054-455-6789.com/property/${docId}`;

            items.push({ id: docId, title, link, description, pubDate: createTime });
          }
        }
      }
    } catch (err) {
      console.error('Error fetching properties for RSS:', err);
    }

    if (items.length === 0) {
      for (const p of DEFAULT_PROPERTIES) {
        const title = `[태왕] ${p.name} (${p.type}) - 보증금 ${p.deposit} / 월세 ${p.rent}`;
        const description = `매물명: ${p.name} | 위치: ${p.addr} | 건물유형: ${p.type} | 보증금: ${p.deposit}만원 | 월세: ${p.rent}만원 | 비고: ${p.note}. 태왕공인중개사사무소 (문의: 054-455-6789 / 010-7590-0111)`;
        const link = `https://054-455-6789.com/property/${p.id}`;
        items.push({ id: p.id, title, link, description, pubDate: now });
      }
    }

    return items;
  }

  const handleRssRequest = async (req: express.Request, res: express.Response) => {
    try {
      const items = await getRssItems();
      const lastBuildDate = new Date().toUTCString();

      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xml += `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n`;
      xml += `  <channel>\n`;
      xml += `    <title>${escapeXml('태왕공인중개사사무소 - 구미 전지역 원룸/미투/투룸 360 VR 매물')}</title>\n`;
      xml += `    <link>https://054-455-6789.com</link>\n`;
      xml += `    <description>${escapeXml('구미 전지역 원룸, 미투, 투룸, 쓰리룸, 오피스텔 360도 VR 전문 태왕공인중개사사무소 최신 매물 피드')}</description>\n`;
      xml += `    <language>ko-KR</language>\n`;
      xml += `    <lastBuildDate>${lastBuildDate}</lastBuildDate>\n`;
      xml += `    <atom:link href="https://054-455-6789.com/rss.xml" rel="self" type="application/rss+xml" />\n`;

      for (const item of items) {
        xml += `    <item>\n`;
        xml += `      <title>${escapeXml(item.title)}</title>\n`;
        xml += `      <link>${escapeXml(item.link)}</link>\n`;
        xml += `      <description>${escapeXml(item.description)}</description>\n`;
        xml += `      <pubDate>${item.pubDate}</pubDate>\n`;
        xml += `      <guid isPermaLink="true">${escapeXml(item.link)}</guid>\n`;
        xml += `    </item>\n`;
      }

      xml += `  </channel>\n`;
      xml += `</rss>`;

      res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.status(200).send(xml);
    } catch (error) {
      console.error('RSS feed generation error:', error);
      res.status(500).send('Error generating RSS feed');
    }
  };

  app.get('/rss', handleRssRequest);
  app.get('/rss.xml', handleRssRequest);

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
