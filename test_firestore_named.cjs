const admin = require("firebase-admin");
admin.initializeApp({
  projectId: "project-3758368870789431339"
});
const { getFirestore } = require("firebase-admin/firestore");
const db = getFirestore("ai-studio-realestatedashbo-3f2b1139-2496-4de2-87c9-def79bc9970a");
async function run() {
  const querySnapshot = await db.collection("properties").where("id", "==", "10").get();
  if (!querySnapshot.empty) {
    console.log("vrUrl:", querySnapshot.docs[0].data().vrUrl);
  } else {
    console.log("no doc");
  }
}
run();
