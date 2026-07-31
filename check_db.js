import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "project-3758368870789431339",
  appId: "1:404949083911:web:d2675e53e56c97e37687a2",
  apiKey: "AIzaSyChj7RIz9GPmJqOBaHj-WhGisMIApdY_y4",
  authDomain: "project-3758368870789431339.firebaseapp.com",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "ai-studio-realestatedashbo-3f2b1139-2496-4de2-87c9-def79bc9970a");

async function run() {
  const snapshot = await getDocs(collection(db, "properties"));
  snapshot.forEach(doc => {
    console.log("ID:", doc.id);
  });
  process.exit(0);
}
run();
