import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "project-3758368870789431339",
  appId: "1:404949083911:web:d2675e53e56c97e37687a2",
  apiKey: "AIzaSyChj7RIz9GPmJqOBaHj-WhGisMIApdY_y4",
  authDomain: "project-3758368870789431339.firebaseapp.com",
  storageBucket: "project-3758368870789431339.firebasestorage.app",
  messagingSenderId: "404949083911"
};

const fbApp = initializeApp(firebaseConfig);
const db = getFirestore(fbApp, "ai-studio-realestatedashbo-3f2b1139-2496-4de2-87c9-def79bc9970a");

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
      const querySnapshot = await getDocs(collection(db, 'properties'));
      querySnapshot.forEach(docSnap => {
        const docId = docSnap.id;
        if (docId) ids.add(docId);
        const data = docSnap.data();
        if (data.id) ids.add(String(data.id));
        if (data.listingNumber) ids.add(String(data.listingNumber));
      });
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
      const querySnapshot = await getDocs(collection(db, 'properties'));
      if (!querySnapshot.empty) {
        querySnapshot.forEach(docSnap => {
          const data = docSnap.data();
          const docId = docSnap.id;
          const name = data.name || data.buildingName || '매물';
          const type = data.type || '원룸/미투/투룸';
          const addr = data.addr || '';
          const deposit = data.deposit || '0';
          const rent = data.rent || '0';
          const note = data.note || '';

          const title = `[태왕] ${name} (${type}) - 보증금 ${deposit} / 월세 ${rent}`;
          const description = `매물명: ${name} | 위치: ${addr} | 건물유형: ${type} | 보증금: ${deposit}만원 | 월세: ${rent}만원 | 비고: ${note}. 태왕공인중개사사무소 (문의: 054-455-6789 / 010-7590-0111)`;
          const link = `https://054-455-6789.com/property/${docId}`;

          items.push({ id: docId, title, link, description, pubDate: now });
        });
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

  let viteServer: any = null;
  if (process.env.NODE_ENV !== 'production') {
    viteServer = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
  }

  const handlePropertyOg = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const rawId = req.params.id || '';
      const propertyId = decodeURIComponent(rawId).trim();
      const distPath = path.join(process.cwd(), 'dist');
      const devPath = path.join(process.cwd(), 'index.html');
      
      let html = '';
      if (process.env.NODE_ENV !== 'production' && fs.existsSync(devPath)) {
        html = fs.readFileSync(devPath, 'utf-8');
      } else if (fs.existsSync(path.join(distPath, 'index.html'))) {
        html = fs.readFileSync(path.join(distPath, 'index.html'), 'utf-8');
      } else if (fs.existsSync(devPath)) {
        html = fs.readFileSync(devPath, 'utf-8');
      } else {
        return next();
      }

      let matchedProp: any = null;

      try {
        const querySnapshot = await getDocs(collection(db, 'properties'));
        querySnapshot.forEach(docSnap => {
          if (matchedProp) return;
          const data = docSnap.data();
          const docId = docSnap.id;
          const listingNo = data.listingNumber || (docId.startsWith('TW-') ? docId : `TW-${docId}`);
          
          if (
            docId === propertyId || 
            docId.toLowerCase() === propertyId.toLowerCase() ||
            listingNo === propertyId || 
            listingNo.toLowerCase() === propertyId.toLowerCase() ||
            `TW-${docId}` === propertyId || 
            propertyId.replace(/^TW-/, '') === docId
          ) {
            matchedProp = {
              id: docId,
              listingNumber: listingNo,
              name: data.name || data.buildingName || '매물',
              room: data.room || '',
              addr: data.addr || '',
              type: data.type || '원룸',
              contract: data.contract || data.formContract || '월세',
              deposit: data.deposit || '0',
              rent: data.rent || '',
              vrUrl: data.vrUrl || data.imageUrl || ''
            };
          }
        });
      } catch (err) {
        console.error('Error fetching property for OG tags:', err);
      }

      if (!matchedProp) {
        const defaultMatch = DEFAULT_PROPERTIES.find(p => p.id === propertyId || `TW-${p.id}` === propertyId);
        if (defaultMatch) {
          matchedProp = {
            id: defaultMatch.id,
            listingNumber: `TW-${defaultMatch.id}`,
            name: defaultMatch.name,
            room: defaultMatch.room,
            addr: defaultMatch.addr,
            type: defaultMatch.type,
            contract: '월세',
            deposit: defaultMatch.deposit,
            rent: defaultMatch.rent,
            vrUrl: ''
          };
        }
      }

      const listingNo = matchedProp ? (matchedProp.listingNumber || (matchedProp.id.startsWith('TW-') ? matchedProp.id : `TW-${matchedProp.id}`)) : (propertyId.startsWith('TW-') ? propertyId : `TW-${propertyId}`);
      
      let buildingName = matchedProp ? (matchedProp.name || '매물') : '매물';
      // 호실 및 동 제거 (예: "테스트1 101호" -> "테스트1", "신라아파트 101동 202호" -> "신라아파트")
      buildingName = buildingName.replace(/(\s*\d+동)?\s*\d+호?$/, '').trim();

      const addr = matchedProp?.addr || '';
      const type = matchedProp?.type || '원룸';
      const contract = matchedProp?.contract || '월세';
      const deposit = matchedProp?.deposit || '0';
      const rent = matchedProp?.rent || '';

      const title = `태왕공인중개사사무소 - 매물 ${listingNo}`;
      
      let priceText = `보증금 ${deposit}만`;
      if (rent && rent !== '0' && rent !== 0) {
        priceText += `, 월 ${rent}만`;
      }

      const description = `[건물명-${buildingName}] ${addr} / ${type} / ${contract} / ${priceText}`;
      const url = `https://054-455-6789.com/property/${propertyId}`;

      let imageUrl = 'https://054-455-6789.com/thumbnail.jpg';
      if (matchedProp?.vrUrl) {
        const firstImg = matchedProp.vrUrl.split(/(?=https?:\/\/)/)[0]?.trim();
        if (firstImg && firstImg.startsWith('http')) {
          imageUrl = firstImg;
        }
      }

      html = html.replace(/<title>.*?<\/title>/i, `<title>${title}</title>`);

      if (/<meta\s+property="og:title"/i.test(html)) {
        html = html.replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${title}" />`);
      } else {
        html = html.replace('</head>', `<meta property="og:title" content="${title}" />\n</head>`);
      }

      if (/<meta\s+property="og:description"/i.test(html)) {
        html = html.replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${description}" />`);
      } else {
        html = html.replace('</head>', `<meta property="og:description" content="${description}" />\n</head>`);
      }

      if (/<meta\s+name="description"/i.test(html)) {
        html = html.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i, `<meta name="description" content="${description}" />`);
      } else {
        html = html.replace('</head>', `<meta name="description" content="${description}" />\n</head>`);
      }

      if (/<meta\s+property="og:url"/i.test(html)) {
        html = html.replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${url}" />`);
      } else {
        html = html.replace('</head>', `<meta property="og:url" content="${url}" />\n</head>`);
      }

      if (/<meta\s+property="og:image"/i.test(html)) {
        html = html.replace(/<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:image" content="${imageUrl}" />`);
      } else {
        html = html.replace('</head>', `<meta property="og:image" content="${imageUrl}" />\n</head>`);
      }

      if (viteServer) {
        html = await viteServer.transformIndexHtml(req.originalUrl, html);
      }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.send(html);
    } catch (error) {
      console.error('Property OG handler error:', error);
      next();
    }
  };

  app.get('/property/:id', handlePropertyOg);

  if (process.env.NODE_ENV !== 'production' && viteServer) {
    app.use(viteServer.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { index: false }));
    app.get('*', (req, res) => {
      try {
        let html = fs.readFileSync(path.join(distPath, 'index.html'), 'utf-8');
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
