import getCacheOrFetch from '../utils/getCacheOrFetch.js';
import {gatedContent} from '../utils/firebase.js';
import * as Account from './account.js';

// Get an NFT by ID from the DB, or index it
export const getGatedContent = async (nftId) => {
  return await getCacheOrFetch(gatedContent, nftId, null);
};