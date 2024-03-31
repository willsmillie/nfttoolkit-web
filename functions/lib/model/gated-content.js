import getCacheOrFetch from '../utils/getCacheOrFetch.js';
import { gatedContent } from '../utils/firebase.js';
// Get an NFT by ID from the DB, or index it
export const getGatedContent = async (nftId) => {
    return await getCacheOrFetch(gatedContent, nftId, null);
};
//# sourceMappingURL=gated-content.js.map