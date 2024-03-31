import admin from 'firebase-admin';
admin.initializeApp();
export const db = admin.firestore();
const config = admin.remoteConfig();
config
    .getTemplate()
    .then(function (template) {
    Object.keys(template.parameters).forEach((key) => {
        const val = template.parameters[key];
        process.env[key] = val.defaultValue.value;
    });
})
    .catch(function (err) {
    console.error('Unable to get template');
    console.error(err);
});
export const auth = admin.auth();
export const nfts = db.collection('nfts');
export const accounts = db.collection('accounts');
export const tasks = db.collection('tasks');
export const cids = db.collection('cids');
export const gatedContent = db.collection('gated-content');
// export const holders = db.collection('holders');
//# sourceMappingURL=firebase.js.map