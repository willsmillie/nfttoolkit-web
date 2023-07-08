const { RateLimit: ratelimit } = require('async-sema');
const { userAPI } = require("./api");
const { getAccountNFTs } = require("./graphQL");

const limit = ratelimit(5);

const deriveCollectionsFromNFTs = async (nfts, id) => {

  const reducer = (accumulator, { minterAccountId: accountId, tokenAddress }) => {
    const pair = { accountId, tokenAddress };
    const pairExists = accumulator.some((item) =>
      item.accountId === pair.accountId &&
      item.tokenAddress === pair.tokenAddress
    );
    if (!pairExists) accumulator.push(pair);
    return accumulator;
  };

  const uniquePairs = nfts.reduce(reducer, []);

  const getUserCollectionPromise = async ({tokenAddress}) => {
    await limit(); // Limit the concurrency to 5 requests
    return userAPI.getUserNFTCollection({accountId: id, tokenAddress}, process.env.LOOPRING_API_KEY);    
  };

  const promises = uniquePairs.map(getUserCollectionPromise);
  const result = await Promise.all(promises);

  return result.map(e => e.collections).flat().filter(e=>e.id !== -1)
}

module.exports = {
  deriveCollectionsFromNFTs
}
