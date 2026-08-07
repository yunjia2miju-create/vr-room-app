const admin = require("firebase-admin");
admin.initializeApp();
const { getFirestore } = require("firebase-admin/firestore");
const db = getFirestore("ai-studio-realestatedashbo-3f2b1139-2496-4de2-87c9-def79bc9970a");
async function run() {
  const querySnapshot = await db.collection("properties").limit(1).get();
  if (!querySnapshot.empty) {
    console.log(querySnapshot.docs[0].data().vrUrl);
  }
}
run();
