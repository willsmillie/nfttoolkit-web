import admin from 'firebase-admin';
import { tasks, nfts, cids } from '../utils/firebase.js';
export const indexNFT = async (nftId) => {
    const now = admin.firestore.Timestamp.now().toDate();
    // create the nft row in the database
    nfts.doc(nftId).set({ nftId }, { merge: true });
    // create a task to index the NFT
    return tasks
        .add({
        performAt: now,
        status: 'scheduled',
        worker: 'indexNFT',
        options: {
            nftId: nftId,
        },
    })
        .then((ref) => {
        // console.log('ENQUEUED INDEX OF NFT');
        return ref;
    })
        .catch((err) => console.log(err));
};
// export const indexENS = async (domain: any) => {
//   const now = admin.firestore.Timestamp.now().toDate();
//   // create the nft row in the database
//   nfts.doc(domain).set(token, { merge: true });
//   // create a task to index the NFT
//   return tasks
//     .add({
//       performAt: now,
//       status: 'scheduled',
//       worker: 'indexNFT',
//       options: {
//         nftId: token.nftId,
//       },
//     })
//     .then((ref) => {
//       console.log('ENQUEUED INDEX OF NFT');
//       return ref;
//     })
//     .catch((err) => console.log(err));
// };
export const indexCID = async (cid) => {
    const now = admin.firestore.Timestamp.now().toDate();
    // create the nft row in the database
    cids.doc(cid).set({ cid }, { merge: true });
    // create a task to index the NFT
    return tasks
        .add({
        performAt: now,
        status: 'scheduled',
        worker: 'indexCID',
        options: {
            cid: cid,
        },
    })
        .then((ref) => {
        // console.log('ENQUEUED INDEX OF CID');
        return ref;
    })
        .catch((err) => console.log(err));
};
export const indexAccount = async (address) => {
    const now = admin.firestore.Timestamp.now().toDate();
    // create a task to index the NFT
    return tasks
        .add({
        performAt: now,
        status: 'scheduled',
        worker: 'indexAccount',
        options: {
            address,
        },
    })
        .then((ref) => {
        // console.log('ENQUEUED INDEX OF ACCOUNT');
        return ref;
    })
        .catch((err) => console.log(err));
};
export const indexAccountById = async (accountId) => {
    const now = admin.firestore.Timestamp.now().toDate();
    // create a task to index the NFT
    return tasks
        .add({
        performAt: now,
        status: 'scheduled',
        worker: 'indexAccountById',
        options: {
            accountId,
        },
    })
        .then((ref) => {
        // console.log('ENQUEUED INDEX OF ACCOUNT');
        return ref;
    })
        .catch((err) => console.log(err));
};
//# sourceMappingURL=tasks.js.map