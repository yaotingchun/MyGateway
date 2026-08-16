const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const serviceAccount = require("../credentials/firebase.json");

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function main() {
  const snapshot = await db.collection("services").get();
  console.log(`Found ${snapshot.size} services.`);
  
  const batch = db.batch();
  let count = 0;
  
  snapshot.docs.forEach((doc) => {
    batch.update(doc.ref, { enrichedAt: require('firebase-admin/firestore').FieldValue.delete() });
    count++;
  });
  
  await batch.commit();
  console.log(`Successfully reset enrichedAt for ${count} services.`);
}

main().catch(console.error);
