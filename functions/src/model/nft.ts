import getCacheOrFetch from '../utils/getCacheOrFetch.js';
import {nfts} from '../utils/firebase.js';
import {indexNFT} from '../runner/tasks.js';
import * as Account from './account.js';
import {getHoldersForNFTData} from '../utils/web3.js';

// Get an NFT by ID from the DB, or index it
export const getNFT = async (nftId) => {
  const dispatchIndex = async (nftId) => await indexNFT(nftId);
  return await getCacheOrFetch(nfts, nftId, dispatchIndex);
};

// get holder by nft data
export const getHolders = async (nftData) => {
  // call Loopring API service to get the holding accounts
  const nftHolders = await getHoldersForNFTData(nftData);

  // prepare to resolve the accounts by mapping the id
  const accountIds = nftHolders.map((e) => e.accountId);

  // resolve the account objects to hex addresses
  const {results, status} = await Account.getAccountsByIds(accountIds);

  // return just the addresses
  if (results?.length > 0) return results.map((e) => e.address);

  return {status};
};
