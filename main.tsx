import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  projectId: "project-3758368870789431339",
  appId: "1:404949083911:web:d2675e53e56c97e37687a2",
  apiKey: "AIzaSyChj7RIz9GPmJqOBaHj-WhGisMIApdY_y4",
  authDomain: "project-3758368870789431339.firebaseapp.com",
  storageBucket: "project-3758368870789431339.firebasestorage.app",
  messagingSenderId: "404949083911"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, "ai-studio-realestatedashbo-3f2b1139-2496-4de2-87c9-def79bc9970a");
export const storage = getStorage(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

