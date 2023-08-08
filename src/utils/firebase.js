import firebase from 'firebase/compat/app';
import { getAnalytics, logEvent } from 'firebase/analytics';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
// Access Firestore instance
const storage = firebase.storage();
const db = firebase.firestore();

const timestamp = firebase.firestore.FieldValue.serverTimestamp();

// Initialize Analytics and get a reference to the service
const analytics = getAnalytics(app);
const logAnalytics = (name, data) => {
  logEvent(analytics, name, data);
  console.log(name, data);
};

// if (process.env.REACT_APP_DEVELOPMENT) {
//   console.log('configuring emus');
//   db.useEmulator('127.0.0.1', 8080);
// }

export { db, storage, timestamp, logAnalytics };
