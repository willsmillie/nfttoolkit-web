import admin from "firebase-admin";
import functions from "firebase-functions";

admin.initializeApp();

export const db = admin.firestore();
const config = admin.remoteConfig();
config
    .getTemplate()
    .then(function(template) {
      console.log(JSON.stringify(template, null, 2));

      Object.keys(template.parameters).forEach((key) => {
        const val = template.parameters[key] as any;
        process.env[key] = val.defaultValue.value;
      });
    })
    .catch(function(err) {
      console.error("Unable to get template");
      console.error(err);
    });

export const auth = admin.auth();

export const nfts = db.collection("nfts");
export const accounts = db.collection("accounts");
export const tasks = db.collection("tasks");
export const cids = db.collection("cids");
