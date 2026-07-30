import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  projectId: "gumi-today-room-tv",
  appId: "1:321272965760:web:9acc86183e14f3eedc1465",
  apiKey: "AIzaSyCQ_3eEsyqbbmx5DHv0L5PRtgplaCqsu_U",
  authDomain: "gumi-today-room-tv.firebaseapp.com",
  storageBucket: "gumi-today-room-tv.firebasestorage.app",
  messagingSenderId: "321272965760"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, "ai-studio-realestatedashbo-3f2b1139-2496-4de2-87c9-def79bc9970a");
export const storage = getStorage(app);

