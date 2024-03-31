/*
Workers provided to the runner
source: http://youtube.com/watch?v=h79xrJZAQ6I&t=54s
*/
import { nfts, cids, accounts } from '../utils/firebase.js';
import { getMetadataForNFT, resolveENS, getAccount } from '../utils/web3.js';
import { getMetadataForCID } from '../utils/infura.js';
// Implementation of workers
const workers = {
    indexNFT: async ({ nftId }) => {
        console.log('INDEXING NFT: ', nftId);
        const data = await getMetadataForNFT(nftId);
        if (data)
            nfts.doc(nftId).set(data, { merge: true }).catch(console.error);
    },
    indexCID: async ({ cid }) => {
        console.log('INDEXING IPFS: ', cid);
        const data = await getMetadataForCID(cid);
        if (data)
            cids.doc(cid).set(data, { merge: true }).catch(console.error);
    },
    indexAccount: async ({ address }) => {
        console.log('INDEXING ACCOUNT: ', address);
        const resolvedAddress = await resolveENS(address);
        const ens = address != resolvedAddress ? address : null;
        if (resolvedAddress) {
            accounts.doc(resolvedAddress).set({ address: resolvedAddress, ens }, { merge: true }).catch(console.error);
        }
    },
    indexAccountById: async ({ accountId }) => {
        if (accountId) {
            const account = await getAccount(accountId);
            const resolvedAddress = account?.owner;
            if (resolvedAddress) {
                accounts
                    .doc(resolvedAddress)
                    .set({ address: resolvedAddress, accountId }, { merge: true })
                    .catch(console.error);
            }
        }
    },
};
export default workers;
//# sourceMappingURL=workers.js.map