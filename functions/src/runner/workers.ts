/*
Workers provided to the runner
source: http://youtube.com/watch?v=h79xrJZAQ6I&t=54s
*/

import {nfts, cids, accounts} from "../utils/firebase.js";
import {getMetadataForNFT, resolveENS} from "../utils/web3.js";
import {getMetadataForCID} from "../utils/infura.js";

// Generic worker which may be called from the task queue
interface Workers {
  [key: string]: (options: any) => Promise<any>;
}

// Implementation of workers
const workers: Workers = {
  indexNFT: async (token) => {
    const data = await getMetadataForNFT(token);
    if (data) nfts.doc(token.nftId).set(data, {merge: true}).catch(console.error);
  },
  indexCID: async ({cid}) => {
    const data = await getMetadataForCID(cid);
    if (data) cids.doc(cid).set(data, {merge: true}).catch(console.error);
  },
  indexAccount: async ({address}) => {
    const resolvedAddress = await resolveENS(address);
    const ens = address != resolvedAddress ? address : null;
    if (resolvedAddress) {
      accounts.doc(resolvedAddress).set({address: resolvedAddress, ens}, {merge: true}).catch(console.error);
    }
  },
};

export default workers;
