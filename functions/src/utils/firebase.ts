import admin from "firebase-admin";

admin.initializeApp();

export const db = admin.firestore();
export const auth = admin.auth();

export const nfts = db.collection("nfts");
export const accounts = db.collection("accounts");
export const tasks = db.collection("tasks");
export const cids = db.collection("cids");
