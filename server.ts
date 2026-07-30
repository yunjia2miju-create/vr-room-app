import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import * as admin from 'firebase-admin';

// --- [Firebase Admin SDK 초기화] ---
let adminApp: admin.app.App | null = null;
export function getFirebaseAdmin() {
  if (!adminApp) {
    try {
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY;

      if (projectId && clientEmail && privateKey) {
        adminApp = admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey: privateKey.replace(/\\n/g, '\n'),
          }),
        });
        console.log('Firebase Admin SDK initialized with provided credentials.');
      } else {
        // GCP 환경 등에서는 ADC (Application Default Credentials)를 사용합니다.
        adminApp = admin.initializeApp();
        console.log('Firebase Admin SDK initialized with Application Default Credentials.');
      }
    } catch (error) {
      console.error('Error initializing Firebase Admin SDK:', error);
      // 서버 시작을 막지 않기 위해 에러를 로깅만 하고 계속 진행합니다.
    }
  }
  return adminApp;
}

// --- [인증 미들웨어] ---
const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing or invalid Authorization header' });
    return;
  }

  const idToken = authHeader.split('Bearer ')[1];
  try {
    getFirebaseAdmin();
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    (req as any).user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    return;
  }
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json()); // JSON 바디 파싱 미들웨어 추가

  // --- [Node.js API 엔드포인트 시작] ---
  
  // 1. 기본 테스트 API
  app.get('/api/hello', (req, res) => {
    res.json({ message: '안녕하세요! Node.js 백엔드 서버가 정상 작동 중입니다.' });
  });

  // [신규] 보안이 적용된 API 엔드포인트 예시 (GET)
  app.get('/api/secure-data', authenticate, (req, res) => {
    const user = (req as any).user;
    res.json({
      message: '보안 데이터 접근 성공',
      user: {
        uid: user.uid,
        email: user.email,
        email_verified: user.email_verified,
      },
      data: '이 데이터는 인증된(Firebase ID Token을 제공한) 사용자만 볼 수 있습니다.'
    });
  });

  // 2. 데이터 처리 예시 API (POST)
  app.post('/api/data', (req, res) => {
    const data = req.body;
    console.log('클라이언트로부터 받은 데이터:', data);
    res.json({ success: true, receivedData: data, timestamp: new Date() });
  });

  // 3. 기존에 있던 이미지 프록시 API
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
