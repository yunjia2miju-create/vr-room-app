const admin = require("firebase-admin");
try {
  const db = admin.firestore(admin.app(), "named-db");
  console.log("Success");
} catch(e) {
  console.log("Error:", e.message);
}
