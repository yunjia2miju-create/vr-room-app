const { Storage } = require('@google-cloud/storage');
async function setCors() {
  try {
    const storage = new Storage();
    const bucket = storage.bucket('project-3758368870789431339.firebasestorage.app');
    await bucket.setCorsConfiguration([
      {
        maxAgeSeconds: 3600,
        method: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
        origin: ['*'],
        responseHeader: ['Content-Type', 'Authorization', 'Content-Length', 'User-Agent', 'x-goog-resumable'],
      },
    ]);
    console.log('CORS rules set successfully');
  } catch (error) {
    console.error('Error setting CORS:', error.message);
  }
}
setCors();
