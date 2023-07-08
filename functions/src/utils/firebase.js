const admin = require("firebase-admin");

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
};

admin.initializeApp(firebaseConfig);

// Get the Firestore instance
const db = admin.firestore();

module.exports = { db };
