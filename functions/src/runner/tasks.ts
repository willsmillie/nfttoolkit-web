import admin from 'firebase-admin';
import { tasks, nfts, cids, accounts } from '../utils/firebase.js';

export const indexNFT = async (token: any) => {
  const now = admin.firestore.Timestamp.now().toDate();

  // create the nft row in the database
  nfts.doc(token.nftId).set(token, { merge: true });

  // create a task to index the NFT
  return tasks
    .add({
      performAt: now,
      status: 'scheduled',
      worker: 'indexNFT',
      options: {
        nftId: token.nftId,
      },
    })
    .then((ref) => {
      console.log('ENQUEUED INDEX OF NFT');
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

export const indexCID = async (cid: string) => {
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
      console.log('ENQUEUED INDEX OF CID');
      return ref;
    })
    .catch((err) => console.log(err));
};

export const indexAccount = async (address: string) => {
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
      console.log('ENQUEUED INDEX OF ACCOUNT');
      return ref;
    })
    .catch((err) => console.log(err));
};
