const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");

admin.initializeApp();
const db = getFirestore("ai-studio-realestatedashbo-3f2b1139-2496-4de2-87c9-def79bc9970a");

async function test() {
  try {
    const propertiesRef = db.collection("properties");
    const querySnapshot = await propertiesRef.where("id", "==", "10").get();
    console.log("Empty:", querySnapshot.empty);
  } catch (err) {
    console.error("Error:", err);
  }
}
test();
