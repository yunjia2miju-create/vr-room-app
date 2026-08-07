const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");

admin.initializeApp({
  projectId: "fake-project"
});
try {
  const db = getFirestore("ai-studio-realestatedashbo-3f2b1139-2496-4de2-87c9-def79bc9970a");
  console.log("Success with getFirestore string arg");
} catch(e) {
  try {
    const db2 = getFirestore(admin.app(), "ai-studio-realestatedashbo-3f2b1139-2496-4de2-87c9-def79bc9970a");
    console.log("Success with getFirestore app, string args");
  } catch(e2) {
    console.log("Error:", e2.message);
  }
}
